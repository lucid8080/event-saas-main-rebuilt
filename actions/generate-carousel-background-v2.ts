"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
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

export async function generateCarouselBackgroundV2(
  prompt: string, 
  aspectRatio: string,
  slideIndex: number,
  carouselTitle: string,
  preferredProvider?: ProviderType,
  quality?: ImageQuality
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

    // Convert aspect ratio to our standard format
    const standardAspectRatio = convertToStandardAspectRatio(aspectRatio);
    console.log(`Generating carousel background: ${aspectRatio} -> ${standardAspectRatio}`);

    // Create a seamless background image prompt - don't mention carousel or slides
    const enhancedPrompt = `Create a seamless background image. ${prompt}. The image should be visually appealing with a unified design that flows naturally across the entire area. Use simple, solid colors and subtle patterns that create visual interest without being distracting. The design should be cohesive and seamless, with no visible breaks or separations. Choose colors that provide good contrast for white text overlay.`;

    // Prepare parameters for the provider system
    const generationParams = {
      prompt: enhancedPrompt,
      aspectRatio: standardAspectRatio,
      quality: quality || "standard",
      userId: session.user.id,
      eventType: "CAROUSEL_BACKGROUND",
      eventDetails: {
        slideIndex,
        carouselTitle,
        originalPrompt: prompt
      },
      // Generate a consistent seed for reproducibility
      seed: generateSeedFromPrompt(enhancedPrompt, slideIndex),
      randomizeSeed: false
    };

    console.log('Generating carousel background with provider system...');
    const startTime = Date.now();

    // Generate image using the provider system
    const providerResponse = await generateImageWithProviders(
      generationParams,
      preferredProvider
    );

    const generationTime = Date.now() - startTime;
    console.log(`Carousel background generated with ${providerResponse.provider} in ${generationTime}ms`);

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

    // Generate enhanced image key with carousel-specific metadata
    const enhancedKey = generateEnhancedImageKey(
      session.user.id,
      generatePromptHash(enhancedPrompt, aspectRatio),
      'png',
      'CAROUSEL_BACKGROUND',
      undefined,
      providerResponse.provider,
      { slideIndex, carouselTitle }
    );

    // Create image metadata with provider information
    const imageMetadata: ImageMetadata = {
      prompt: enhancedPrompt,
      aspectRatio: aspectRatio,
      eventType: 'CAROUSEL_BACKGROUND',
      styleName: null,
      customStyle: null,
      seed: providerResponse.seed?.toString() || null,
      provider: providerResponse.provider,
      generationTime: providerResponse.generationTime,
      cost: providerResponse.cost,
      quality: quality || "standard",
      watermarkApplied: false, // Carousel backgrounds don't need watermarks
      modelVersion: providerResponse.providerData?.model || null,
      carouselMetadata: {
        slideIndex,
        carouselTitle,
        originalPrompt: prompt
      }
    };

    // Upload to R2 with WebP support
    console.log("Uploading carousel background to R2...");
    const webpConfig: WebPIntegrationConfig = {
      ...DEFAULT_WEBP_CONFIG,
      enableWebP: true,
      metadata: imageMetadata
    };

    const uploadResult = await uploadImageWithWebP(
      imageBuffer,
      enhancedKey,
      webpConfig
    );

    console.log("Carousel background upload successful:", uploadResult);

    // Deduct one credit from user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: 1 } }
    });

    // Save generation record to database with provider info
    const savedImage = await prisma.generatedImage.create({
      data: {
        userId: session.user.id,
        prompt: enhancedPrompt,
        url: uploadResult.primaryUrl,
        r2Key: uploadResult.r2Key,
        webpKey: uploadResult.webpR2Key,
        originalFormat: providerResponse.mimeType.split('/')[1] || 'png',
        webpEnabled: !!uploadResult.webpUrl,
        eventType: 'CAROUSEL_BACKGROUND' as any,
        eventDetails: {
          slideIndex,
          carouselTitle,
          originalPrompt: prompt
        },
        // Provider system fields
        aspectRatio: aspectRatio,
        seed: providerResponse.seed?.toString() || null,
        provider: providerResponse.provider,
        generationTimeMs: providerResponse.generationTime,
        providerCost: providerResponse.cost,
        quality: quality || "standard",
        imageUrl: uploadResult.primaryUrl,
        webpUrl: uploadResult.webpUrl
      }
    });

    console.log("Carousel background database record created:", savedImage.id);

    // Generate signed URL for immediate use
    const signedUrl = await generateSignedUrl(uploadResult.r2Key);

    // Revalidate the carousel maker path to show the new image
    revalidatePath("/carousel-maker");

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
      quality: quality || "standard",
      message: `Carousel background generated successfully using ${providerResponse.provider} provider`
    };

  } catch (error) {
    console.error("Error in generateCarouselBackgroundV2:", error);

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
          throw new Error(`Carousel background generation failed: ${error.message}`);
      }
    }

    // Handle other errors
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("An unexpected error occurred during carousel background generation");
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
 * Generate a consistent seed from prompt and slide index for reproducibility
 */
function generateSeedFromPrompt(prompt: string, slideIndex: number): number {
  let hash = 0;
  const combinedInput = `${prompt}_slide_${slideIndex}`;
  
  for (let i = 0; i < combinedInput.length; i++) {
    const char = combinedInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash) % 1000000; // Keep it reasonable
}
