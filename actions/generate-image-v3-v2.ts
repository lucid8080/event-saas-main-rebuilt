"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { EventDetails } from "@/lib/prompt-generator";
import { uploadImageToR2, generateEnhancedImageKey, generateSignedUrl, type ImageMetadata } from "@/lib/r2";
import { generatePromptHash } from "@/lib/enhanced-image-naming";
import { uploadImageWithWebP, DEFAULT_WEBP_CONFIG, type WebPIntegrationConfig } from "@/lib/webp-integration";

// Import our new provider system
import { 
  generateImageWithProviders, 
  AspectRatio, 
  ImageQuality, 
  ProviderType,
  ImageGenerationError,
  ErrorCodes 
} from "@/lib/providers";

export async function generateImageV3V2(
  prompt: string, 
  aspectRatio: string, 
  eventType?: string, 
  eventDetails?: EventDetails,
  styleReferenceImages?: File[],
  preferredProvider?: ProviderType,
  quality?: ImageQuality
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Get user's current credit balance and watermark setting
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true, watermarkEnabled: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has enough credits
    if (user.credits <= 0) {
      throw new Error("Insufficient credits. Please upgrade your plan.");
    }

    // Build enhanced prompt if event details are provided
    let finalPrompt = prompt;
    if (eventType && eventDetails) {
      try {
        // Import the enhanced prompt generator
        const { generateEnhancedPromptWithSystemPrompts } = await import('@/lib/prompt-generator');
        
        // Use the enhanced prompt generator that includes holiday details
        finalPrompt = await generateEnhancedPromptWithSystemPrompts(
          prompt,
          eventType,
          eventDetails,
          undefined, // styleName not used in V3
          undefined  // customStyle not used in V3
        );
        
        console.log("V3 enhanced prompt generated:", finalPrompt.substring(0, 100) + "...");
      } catch (error) {
        console.error('Error building enhanced prompt for V3, using fallback:', error);
        // Fallback to original prompt if something goes wrong
        finalPrompt = prompt;
      }
    }

    // Convert aspect ratio to our standard format
    const standardAspectRatio = convertToStandardAspectRatio(aspectRatio);
    console.log(`V3 generation: ${aspectRatio} -> ${standardAspectRatio}`);

    // Prepare parameters for the provider system
    const generationParams = {
      prompt: finalPrompt,
      aspectRatio: standardAspectRatio,
      quality: quality || "high", // V3 typically wants higher quality
      userId: session.user.id,
      eventType,
      eventDetails,
      styleReferenceImages, // This will be passed but may not be supported by all providers
      watermarkEnabled: user.watermarkEnabled,
      // Use true randomization to ensure different images each time
      seed: Math.floor(Math.random() * 1000000), // Generate random seed each time
      randomizeSeed: true,
      // Provider-specific options
      providerOptions: {
        // For Ideogram: style reference images
        styleReferenceImages: styleReferenceImages,
        renderingSpeed: "TURBO",
        // For Hugging Face: enhanced prompt processing
        promptEnhance: true,
        // Higher inference steps for V3 quality
        inferenceSteps: quality === "high" ? 40 : quality === "standard" ? 30 : 20
      }
    };

    console.log('Generating V3 image with provider system...');
    console.log(`Style reference images: ${styleReferenceImages?.length || 0}`);
    
    const startTime = Date.now();

    // Generate image using the provider system
    const providerResponse = await generateImageWithProviders(
      generationParams,
      preferredProvider
    );

    const generationTime = Date.now() - startTime;
    console.log(`V3 image generated with ${providerResponse.provider} in ${generationTime}ms`);

    // Convert base64 image data to buffer for uploading
    let imageBuffer: Buffer;
    if (typeof providerResponse.imageData === 'string') {
      if (providerResponse.imageData.startsWith('data:image')) {
        // Base64 data URL
        const base64Data = providerResponse.imageData.split(',')[1];
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else {
        // Plain base64
        imageBuffer = Buffer.from(providerResponse.imageData, 'base64');
      }
    } else {
      // Already a buffer
      imageBuffer = providerResponse.imageData;
    }

    // Apply watermark if enabled (V3 images are usually high-value)
    let finalImageBuffer = imageBuffer;
    if (user.watermarkEnabled) {
      console.log("Applying watermark to V3 image...");
      try {
        // Import watermark function
        const { addWatermarkToImageFromUrl } = await import("@/lib/watermark");
        
        // Create temporary data URL for watermark processing
        const dataUrl = `data:${providerResponse.mimeType};base64,${imageBuffer.toString('base64')}`;
        const watermarkedDataUrl = await addWatermarkToImageFromUrl(dataUrl);
        
        // Convert back to buffer
        const watermarkedBase64 = watermarkedDataUrl.split(',')[1];
        finalImageBuffer = Buffer.from(watermarkedBase64, 'base64');
        console.log("Watermark applied successfully to V3 image");
      } catch (watermarkError) {
        console.error("Watermark application failed:", watermarkError);
        // Continue with original image if watermark fails
      }
    }

    // Generate enhanced image key with V3-specific metadata
    const enhancedKey = generateEnhancedImageKey(
      session.user.id,
      generatePromptHash(prompt, aspectRatio),
      'png',
      eventType,
      undefined,
      providerResponse.provider,
      { v3Generation: true, hasStyleImages: !!(styleReferenceImages?.length) }
    );

    // Create image metadata with provider information
    const imageMetadata: ImageMetadata = {
      prompt: prompt,
      aspectRatio: aspectRatio,
      eventType: eventType || null,
      styleName: null,
      customStyle: null,
      seed: providerResponse.seed?.toString() || null,
      provider: providerResponse.provider,
      generationTime: providerResponse.generationTime,
      cost: providerResponse.cost,
      quality: quality || "high",
      watermarkApplied: user.watermarkEnabled,
      modelVersion: providerResponse.providerData?.model || null,
      v3Metadata: {
        hasStyleReferenceImages: !!(styleReferenceImages?.length),
        styleImageCount: styleReferenceImages?.length || 0,
        isV3Generation: true
      }
    };

    // Upload to R2 with WebP support
    console.log("Uploading V3 image to R2...");
    const webpConfig: WebPIntegrationConfig = {
      ...DEFAULT_WEBP_CONFIG,
      enableWebP: true,
      metadata: imageMetadata
    };

    const uploadResult = await uploadImageWithWebP(
      finalImageBuffer,
      enhancedKey,
      webpConfig
    );

    console.log("V3 image upload successful:", uploadResult);

    // Deduct one credit from user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: 1 } }
    });

    // Save generation record to database with provider info
    const savedImage = await prisma.generatedImage.create({
      data: {
        userId: session.user.id,
        prompt: finalPrompt,
        url: uploadResult.primaryUrl,
        r2Key: uploadResult.r2Key,
        webpKey: uploadResult.webpR2Key,
        originalFormat: providerResponse.mimeType.split('/')[1] || 'png',
        webpEnabled: !!uploadResult.webpUrl,
        eventType: eventType as any,
        eventDetails: eventDetails || null,
        // Provider system fields
        aspectRatio: aspectRatio,
        seed: providerResponse.seed?.toString() || null,
        provider: providerResponse.provider,
        generationTimeMs: providerResponse.generationTime,
        providerCost: providerResponse.cost,
        quality: quality || "high",
        imageUrl: uploadResult.primaryUrl,
        webpUrl: uploadResult.webpUrl
      }
    });

    console.log("V3 image database record created:", savedImage.id);

    // Generate signed URL for immediate use
    const signedUrl = await generateSignedUrl(uploadResult.r2Key);

    // Revalidate the dashboard path to show the new image
    revalidatePath("/dashboard");

    return {
      success: true,
      imageUrl: signedUrl,
      webpUrl: uploadResult.webpUrl ? await generateSignedUrl(uploadResult.webpR2Key!) : null,
      r2Key: uploadResult.r2Key,
      generatedImageId: savedImage.id,
      provider: providerResponse.provider,
      generationTime: providerResponse.generationTime,
      cost: providerResponse.cost,
      seed: providerResponse.seed,
      quality: quality || "high",
      hasStyleImages: !!(styleReferenceImages?.length),
      styleImageCount: styleReferenceImages?.length || 0,
      message: `V3 image generated successfully using ${providerResponse.provider} provider${styleReferenceImages?.length ? ` with ${styleReferenceImages.length} style reference images` : ''}`
    };

  } catch (error) {
    console.error("Error in generateImageV3V2:", error);

    // Handle provider-specific errors
    if (error instanceof ImageGenerationError) {
      // Map provider errors to user-friendly messages
      switch (error.code) {
        case ErrorCodes.QUOTA_EXCEEDED:
          throw new Error(`API quota exceeded for ${error.provider}. Please try again later or upgrade your plan.`);
        case ErrorCodes.RATE_LIMITED:
          throw new Error(`Rate limit reached for ${error.provider}. Please wait a moment and try again.`);
        case ErrorCodes.SERVICE_UNAVAILABLE:
          throw new Error(`${error.provider} service is temporarily unavailable. Please try again.`);
        case ErrorCodes.INVALID_PARAMETERS:
          throw new Error(`Invalid parameters: ${error.message}`);
        case ErrorCodes.INSUFFICIENT_CREDITS:
          throw new Error("Insufficient credits. Please upgrade your plan.");
        default:
          throw new Error(`V3 image generation failed: ${error.message}`);
      }
    }

    // Handle other errors
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("An unexpected error occurred during V3 image generation");
  }
}

/**
 * Convert various aspect ratio formats to our standard format
 */
function convertToStandardAspectRatio(aspectRatio: string): AspectRatio {
  // Handle both "1:1" and "1x1" formats
  const normalized = aspectRatio.replace('x', ':');
  
  // Validate against supported ratios
  const supportedRatios: AspectRatio[] = [
    "1:1", "16:9", "9:16", "4:3", "3:4", "4:5", "5:7", "3:2", "2:3", "10:16", "16:10", "1:3", "3:1"
  ];
  
  if (supportedRatios.includes(normalized as AspectRatio)) {
    return normalized as AspectRatio;
  }
  
  // Default to 1:1 if not supported
  console.warn(`Unsupported aspect ratio: ${aspectRatio}, defaulting to 1:1`);
  return "1:1";
}

/**
 * Generate a consistent seed from prompt for reproducibility
 */
function generateSeedFromPrompt(prompt: string): number {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 1000000; // Keep it reasonable
}
