"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { uploadImageToR2, generateEnhancedImageKey, generateSignedUrl, type ImageMetadata } from "@/lib/r2";
import { generatePromptHash } from "@/lib/enhanced-image-naming";
import { uploadImageWithWebP, DEFAULT_WEBP_CONFIG, type WebPIntegrationConfig } from "@/lib/webp-integration";

export async function generateCarouselBackground(
  prompt: string, 
  aspectRatio: string,
  slideIndex: number,
  carouselTitle: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Get user's current credit balance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has enough credits
    if (user.credits <= 0) {
      throw new Error("Insufficient credits. Please upgrade your plan.");
    }

    // Check if API key is configured
    const apiKey = process.env.NEXT_PUBLIC_IDEOGRAM_API_KEY;
    if (!apiKey) {
      throw new Error("Ideogram API key is not configured. Please add NEXT_PUBLIC_IDEOGRAM_API_KEY to your environment variables.");
    }

    // Convert aspect ratio format to Ideogram 3.0 API format
    const convertAspectRatio = (ratio: string): string => {
      const aspectRatioMap: { [key: string]: string } = {
        '1:1': '1x1',
        '16:9': '16x9',
        '9:16': '9x16',
        '4:3': '4x3',
        '3:4': '3x4',
        '4:5': '4x5',
        '5:4': '5x4',
        '5:7': '5x7',
        '3:2': '3x2',
        '2:3': '2x3',
        '10:16': '10x16',
        '16:10': '16x10',
        '1:3': '1x3',
        '3:1': '3x1'
      };
      
      return aspectRatioMap[ratio] || '1x1'; // Default to 1x1 if not found
    };

    const ideogramAspectRatio = convertAspectRatio(aspectRatio);
    console.log(`Generating carousel background: ${aspectRatio} -> ${ideogramAspectRatio}`);

    // Create a seamless background image - don't mention carousel or slides
    const enhancedPrompt = `Create a seamless background image. ${prompt}. The image should be visually appealing with a unified design that flows naturally across the entire area. Use simple, solid colors and subtle patterns that create visual interest without being distracting. The design should be cohesive and seamless, with no visible breaks or separations. Choose colors that provide good contrast for white text overlay.`;

    // Create FormData for Ideogram 3.0 API
    const formData = new FormData();
    formData.append("prompt", enhancedPrompt);
    formData.append("aspect_ratio", ideogramAspectRatio);
    formData.append("rendering_speed", "TURBO");

    console.log('Sending request to Ideogram API for carousel background...');

    // Make request to Ideogram 3.0 API
    const response = await fetch("https://api.ideogram.ai/v1/ideogram-v3/generate", {
      method: "POST",
      headers: {
        "Api-Key": apiKey
        // Note: No Content-Type header needed for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ideogram API error:', response.status, errorText);
      throw new Error(`Failed to generate carousel background: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Ideogram API response received:', result);

    // Check for successful image generation
    // Note: Response structure might be different in V3
    let imageUrl: string | null = null;
    
    if (result.data && result.data[0]?.url) {
      imageUrl = result.data[0].url;
    } else if (result.url) {
      imageUrl = result.url;
    } else if (result.images && result.images[0]?.url) {
      imageUrl = result.images[0].url;
    }

    if (!imageUrl) {
      console.error('No image URL found in response:', result);
      throw new Error("Invalid response from image generation service");
    }

    console.log('Carousel background generated successfully:', imageUrl);

    // Download the image and upload to R2 with WebP conversion
    let r2Key: string | null = null;
    let webpKey: string | null = null;
    let signedUrl: string | null = null;
    let originalFormat: string | null = null;
    let compressionRatio: number | null = null;
    let webpEnabled: boolean = true;

    try {
      // Download image from Ideogram
      console.log('Downloading carousel background from Ideogram URL');
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to download carousel background from Ideogram');
      }
      
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      const contentType = imageResponse.headers.get('content-type') || 'image/png';
      
      // Generate enhanced key for R2 storage with comprehensive metadata
      const extension = contentType.includes('png') ? 'png' : 
                        contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'png';
      const promptHash = generatePromptHash(prompt);
      
      const imageMetadata: ImageMetadata = {
        userId: session.user.id,
        eventType: 'CAROUSEL_BACKGROUND',
        aspectRatio: aspectRatio,
        watermarkEnabled: false, // Carousel backgrounds typically don't need watermarks
        promptHash: promptHash,
        generationModel: 'ideogram-v3',
        customTags: [`carousel:${carouselTitle}`, `slide:${slideIndex}`]
      };
      
      // WebP Integration Configuration for carousel backgrounds
      const webpConfig: WebPIntegrationConfig = {
        ...DEFAULT_WEBP_CONFIG,
        defaultPreset: 'medium', // Good balance for carousel backgrounds
        validateConversions: true,
        fallbackToOriginal: true
      };
      
      // Upload with WebP conversion
      const webpResult = await uploadImageWithWebP(
        imageBuffer,
        contentType,
        imageMetadata,
        webpConfig
      );
      
      if (webpResult.success) {
        r2Key = webpResult.r2Key;
        originalFormat = contentType.includes('webp') ? 'webp' : 
                        contentType.includes('png') ? 'png' : 
                        contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'png';
        compressionRatio = webpResult.compressionRatio;
        webpEnabled = webpResult.contentType.includes('webp');
        
        // If WebP conversion was successful, update the key to reflect WebP format
        if (webpResult.contentType.includes('webp')) {
          webpKey = webpResult.r2Key;
        }
        
        console.log('Carousel background successfully uploaded to R2 with WebP conversion:', {
          r2Key,
          webpKey,
          originalFormat,
          compressionRatio: `${compressionRatio.toFixed(2)}%`,
          webpEnabled,
          originalSize: webpResult.originalSize,
          webpSize: webpResult.webpSize
        });
      } else {
        throw new Error(webpResult.error || 'WebP upload failed');
      }
      
      // Generate signed URL for immediate access
      signedUrl = await generateSignedUrl(r2Key, 3600); // 1 hour
      
    } catch (r2Error) {
      console.error('Error uploading carousel background to R2 with WebP:', r2Error);
      console.error('R2 upload failed details:', {
        imageUrl: imageUrl.substring(0, 100) + '...',
        error: r2Error instanceof Error ? r2Error.message : 'Unknown error'
      });
      // Fallback to original URL if R2 upload fails
      console.log('Falling back to original Ideogram URL for carousel background');
    }

    // Deduct credit from user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: 1 } }
    });

    // Track image generation statistics
    await prisma.imageGenerationStats.create({
      data: {
        userId: session.user.id,
        eventType: 'CAROUSEL_BACKGROUND',
        style: `Aspect: ${ideogramAspectRatio}, Carousel: ${carouselTitle}`
      }
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      imageUrl: signedUrl || imageUrl, // Use signed URL if available, fallback to original
      r2Key: r2Key,
      webpKey: webpKey,
      originalFormat: originalFormat,
      compressionRatio: compressionRatio,
      webpEnabled: webpEnabled,
      creditsUsed: 1
    };

  } catch (error) {
    console.error('Error generating carousel background:', error);
    
    // Track failed generation
    try {
      const session = await auth();
      if (session?.user?.id) {
        await prisma.imageGenerationStats.create({
          data: {
            userId: session.user.id,
            eventType: 'CAROUSEL_BACKGROUND',
            style: `Failed: ${aspectRatio}`
          }
        });
      }
    } catch (trackingError) {
      console.error('Error tracking failed generation:', trackingError);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while generating the carousel background"
    };
  }
} 