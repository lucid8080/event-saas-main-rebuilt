import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { uploadImageWithWebP, DEFAULT_WEBP_CONFIG, type WebPIntegrationConfig } from "@/lib/webp-integration";
import { generateSignedUrl } from "@/lib/r2";
import { generatePromptHash } from "@/lib/enhanced-image-naming";
import { env } from "@/env.mjs";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Enhanced authentication debugging
    console.log("🔍 Upscale API Authentication Debug:");
    console.log(`   Session exists: ${!!session}`);
    console.log(`   User ID: ${session?.user?.id || 'undefined'}`);
    console.log(`   User email: ${session?.user?.email || 'undefined'}`);
    console.log(`   Request headers: ${JSON.stringify(Object.fromEntries(request.headers.entries()))}`);
    
    if (!session?.user?.id) {
      console.log("❌ Authentication failed - no session or user ID");
      return NextResponse.json({ 
        error: "Unauthorized", 
        details: "Please sign in again to continue",
        code: "AUTH_REQUIRED"
      }, { status: 401 });
    }

    const requestBody = await request.json();
    const { imageId } = requestBody;
    
    console.log("🔍 Request Body Debug:");
    console.log(`   Request body: ${JSON.stringify(requestBody)}`);
    console.log(`   Image ID from request: ${imageId}`);

    if (!imageId) {
      console.log("❌ No image ID provided in request");
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 });
    }

    // Get user's current credit balance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has enough credits
    if (user.credits <= 0) {
      return NextResponse.json({ 
        error: "Insufficient credits. Please upgrade your plan to use the upscaler." 
      }, { status: 402 });
    }

    // Get the original image
    const originalImage = await prisma.generatedImage.findUnique({
      where: { id: imageId },
      select: {
        id: true,
        url: true,
        r2Key: true,
        userId: true,
        prompt: true,
        eventType: true,
        eventDetails: true,
        aspectRatio: true,
        styleName: true,
        customStyle: true
      }
    });

    if (!originalImage) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Check if user owns this image
    console.log("🔍 Image Ownership Check:");
    console.log(`   Image ID: ${imageId}`);
    console.log(`   Image User ID: ${originalImage.userId}`);
    console.log(`   Session User ID: ${session.user.id}`);
    console.log(`   Ownership Match: ${originalImage.userId === session.user.id ? '✅' : '❌'}`);
    
    if (originalImage.userId !== session.user.id) {
      console.log("❌ Image ownership mismatch - user does not own this image");
      return NextResponse.json({ 
        error: "Unauthorized", 
        details: "You do not own this image",
        code: "IMAGE_OWNERSHIP_MISMATCH"
      }, { status: 403 });
    }
    
    console.log("✅ Image ownership verified");

    // TODO: Add upscaler-specific checks once schema is updated

    // Get the FAL API key
    const falApiKey = env.FAL_KEY;
    if (!falApiKey) {
      return NextResponse.json({ error: "FAL API key not configured" }, { status: 500 });
    }

    // Prepare the image URL for upscaling
    let imageUrl = originalImage.url;
    
    // If the image is stored in R2, generate a signed URL
    if (originalImage.r2Key) {
      imageUrl = await generateSignedUrl(originalImage.r2Key, 3600); // 1 hour
    }

    // Call the FAL AI upscaler API
    const upscaleResponse = await fetch("https://fal.run/fal-ai/clarity-upscaler", {
      method: "POST",
      headers: {
        "Authorization": `Key ${falApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: imageUrl,
        prompt: "masterpiece, best quality, highres",
        upscale_factor: 2,
        negative_prompt: "(worst quality, low quality, normal quality:2)",
        creativity: 0.35,
        resemblance: 0.6,
        guidance_scale: 4,
        num_inference_steps: 18,
        enable_safety_checker: true
      })
    });

    if (!upscaleResponse.ok) {
      const errorText = await upscaleResponse.text();
      console.error("FAL API Error:", errorText);
      return NextResponse.json({ 
        error: "Failed to upscale image", 
        details: errorText 
      }, { status: 500 });
    }

    const upscaleData = await upscaleResponse.json();
    
    if (!upscaleData.image?.url) {
      return NextResponse.json({ error: "No upscaled image URL in response" }, { status: 500 });
    }

    // Download the upscaled image
    const upscaledImageResponse = await fetch(upscaleData.image.url);
    if (!upscaledImageResponse.ok) {
      return NextResponse.json({ error: "Failed to download upscaled image" }, { status: 500 });
    }

    const upscaledImageBuffer = Buffer.from(await upscaledImageResponse.arrayBuffer());
    const contentType = upscaledImageResponse.headers.get('content-type') || 'image/png';

    // Upload the upscaled image to R2 with WebP support
    const imageMetadata = {
      userId: session.user.id,
      eventType: originalImage.eventType,
      aspectRatio: originalImage.aspectRatio,
      stylePreset: originalImage.styleName || 'default',
      watermarkEnabled: false, // Upscaled images don't need watermark
      promptHash: generatePromptHash(originalImage.prompt), // Generate proper hash from original prompt
      generationModel: 'fal-ai/clarity-upscaler',
      customTags: ['upscaled', 'hd']
    };

    const webpConfig = {
      ...DEFAULT_WEBP_CONFIG,
      enabled: true
    };

    const uploadResult = await uploadImageWithWebP(
      upscaledImageBuffer,
      contentType,
      imageMetadata,
      webpConfig
    );

    if (!uploadResult.success) {
      return NextResponse.json({ error: "Failed to upload upscaled image" }, { status: 500 });
    }

    // Generate signed URLs
    const upscaledImageUrl = await generateSignedUrl(uploadResult.r2Key);
    const upscaledWebpUrl = uploadResult.webpSize !== uploadResult.originalSize 
      ? await generateSignedUrl(uploadResult.r2Key.replace(/\.[^.]+$/, '.webp')) 
      : null;

    // Create the upscaled image record
    const upscaledImage = await prisma.generatedImage.create({
      data: {
        userId: session.user.id,
        prompt: originalImage.prompt,
        url: upscaledImageUrl,
        r2Key: uploadResult.r2Key,
        webpKey: upscaledWebpUrl ? uploadResult.r2Key.replace(/\.[^.]+$/, '.webp') : null,
        originalFormat: contentType.split('/')[1] || 'png',
        webpEnabled: !!upscaledWebpUrl,
        eventType: originalImage.eventType,
        eventDetails: originalImage.eventDetails,
        aspectRatio: originalImage.aspectRatio,
        styleName: originalImage.styleName,
        customStyle: originalImage.customStyle,
        provider: "fal-ai/clarity-upscaler",
        quality: "upscaled",
        imageUrl: upscaledImageUrl,
        webpUrl: upscaledWebpUrl,
        isUpscaled: true,
        originalImageId: originalImage.id // Link to original image
      }
    });

    // Update the original image to link to the upscaled version
    await prisma.generatedImage.update({
      where: { id: originalImage.id },
      data: {
        upscaledImageId: upscaledImage.id // Link to upscaled image
      }
    });

    // Deduct one credit from user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: 1 } }
    });

    return NextResponse.json({
      success: true,
      upscaledImageUrl,
      upscaledWebpUrl,
      upscaledImageId: upscaledImage.id,
      message: "Image upscaled successfully"
    });

  } catch (error) {
    console.error("Error upscaling image:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
