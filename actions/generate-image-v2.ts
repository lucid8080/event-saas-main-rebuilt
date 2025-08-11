"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { EventDetails, generateEnhancedPromptWithSystemPrompts, generateFullPromptWithSystemPrompts } from "@/lib/prompt-generator";
import { addWatermarkToImageFromUrl } from "@/lib/watermark";
import { uploadImageToR2, generateImageKey, getFileExtension, generateSignedUrl, generateEnhancedImageKey, type ImageMetadata } from "@/lib/r2";
import { generatePromptHash } from "@/lib/enhanced-image-naming";
import { uploadImageWithWebP, DEFAULT_WEBP_CONFIG, type WebPIntegrationConfig } from "@/lib/webp-integration";

// Import our new provider system
import { 
  generateImageWithProviders, 
  AspectRatio, 
  ImageQuality, 
  ProviderType,
  ImageGenerationError,
  ErrorCodes,
  imageProviders
} from "@/lib/providers";

export async function generateImageV2(
  prompt: string, 
  aspectRatio: string, 
  eventType?: string, 
  eventDetails?: EventDetails,
  styleName?: string,
  customStyle?: string,
  preferredProvider?: ProviderType,
  quality?: ImageQuality
) {
  console.log("🔍 generateImageV2 Debug - Starting image generation");
  console.log("   Parameters:", { prompt, aspectRatio, eventType, styleName, customStyle, preferredProvider, quality });
  
  try {
    console.log("🔍 generateImageV2 Debug - Step 1: Authentication");
    const session = await auth();
    console.log("   Session exists:", !!session);
    console.log("   User ID:", session?.user?.id);
    
    if (!session?.user?.id) {
      console.log("❌ Authentication failed");
      throw new Error("Unauthorized");
    }
    console.log("✅ Authentication successful");

    console.log("🔍 generateImageV2 Debug - Step 2: User validation");
    // Get user's current credit balance and watermark setting
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true, watermarkEnabled: true }
    });

    if (!user) {
      console.log("❌ User not found in database");
      throw new Error("User not found");
    }

    console.log("   User credits:", user.credits);
    console.log("   Watermark enabled:", user.watermarkEnabled);

    // Check if user has enough credits
    if (user.credits <= 0) {
      console.log("❌ Insufficient credits");
      throw new Error("Insufficient credits. Please upgrade your plan.");
    }
    console.log("✅ User validation successful");

    console.log("🔍 generateImageV2 Debug - Step 3: Prompt generation");
    // Build the final combined prompt using enhanced prompt generator
    let finalPrompt = prompt;
    if (eventType && eventDetails) {
      try {
        console.log("   Building enhanced prompt with event details");
        // Import the enhanced prompt generator
        const { generateEnhancedPromptWithSystemPrompts } = await import('@/lib/prompt-generator');
        
        // Use the enhanced prompt generator that includes holiday details
        finalPrompt = await generateEnhancedPromptWithSystemPrompts(
          prompt,
          eventType,
          eventDetails,
          styleName,
          customStyle
        );
        console.log("✅ Enhanced prompt generated successfully");
        
      } catch (error) {
        console.error('❌ Error building enhanced prompt, using fallback:', error);
        // Fallback to original prompt if something goes wrong
        finalPrompt = prompt;
      }
    } else {
      console.log("   Using base prompt (no event details)");
    }

    console.log("   Final prompt length:", finalPrompt.length);
    console.log("   Final prompt preview:", finalPrompt.substring(0, 100) + "...");

    // Convert aspect ratio to our standard format (if needed)
    const standardAspectRatio = convertToStandardAspectRatio(aspectRatio);

    console.log("🔍 generateImageV2 Debug - Step 4: Provider selection");
    // Check provider capabilities for seed support
    // First try to get admin-configured default provider, then fall back to system default
    let actualProvider: ProviderType;
    
    try {
      console.log("   Querying database for default provider settings");
      // Directly query the database for the default provider settings
      const defaultProviderSettings = await prisma.providerSettings.findFirst({
        where: {
          isDefault: true,
          isActive: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log("   Default provider settings found:", !!defaultProviderSettings);
      if (defaultProviderSettings?.providerId) {
        actualProvider = defaultProviderSettings.providerId as ProviderType;
        console.log("   Using configured default provider:", actualProvider);
        console.log(`Using admin-configured default provider: ${actualProvider}`);
      } else {
        // No admin default configured, use system default
        actualProvider = preferredProvider || imageProviders.getDefaultProvider()?.getProviderType() || "qwen";
        console.log(`No admin default provider configured, using system default: ${actualProvider}`);
      }
    } catch (error) {
      // Error querying database, use system default
      actualProvider = preferredProvider || imageProviders.getDefaultProvider()?.getProviderType() || "qwen";
      console.log(`Error querying database for default provider, using system default: ${actualProvider}`);
    }
    
    let provider;
    let supportsSeeds = false;
    
    try {
      provider = imageProviders.getProvider(actualProvider);
      const capabilities = provider?.getCapabilities();
      supportsSeeds = capabilities?.supportsSeeds ?? false;
    } catch (error) {
      console.warn(`Provider ${actualProvider} not available, using fallback without seeds`);
      supportsSeeds = false;
    }

    // Get admin-configured quality setting with improved fallback for Fal-Qwen
    let configuredQuality: ImageQuality = actualProvider === 'fal-qwen' ? "high" : "standard";
    try {
      // Directly query the database for provider settings
      const providerSettings = await prisma.providerSettings.findFirst({
        where: {
          providerId: actualProvider,
          isActive: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      if (providerSettings?.baseSettings && typeof providerSettings.baseSettings === 'object') {
        const baseSettings = providerSettings.baseSettings as any;
        if (baseSettings.defaultQuality) {
          configuredQuality = baseSettings.defaultQuality as ImageQuality;
          console.log(`Using admin-configured quality: ${configuredQuality} for provider: ${actualProvider}`);
                } else {
          console.log(`No admin quality configuration found for ${actualProvider}, using fallback: ${configuredQuality}`);
          if (actualProvider === 'fal-qwen') {
            console.log('ℹ️  Using "high" quality as default for Fal-Qwen to ensure better quality compensation');
          }
        }
      } else {
        console.log(`No admin quality configuration found for ${actualProvider}, using fallback: ${configuredQuality}`);
        if (actualProvider === 'fal-qwen') {
          console.log('ℹ️  Using "high" quality as default for Fal-Qwen to ensure better quality compensation');
        }
      }
    } catch (error) {
      console.error('Error querying database for provider settings:', error);
      console.log(`Using fallback quality (${configuredQuality}) due to database query error`);
      if (actualProvider === 'fal-qwen') {
        console.log('ℹ️  Fal-Qwen fallback includes quality compensation');
      }
    }
    
    // Override quality parameter with admin-configured setting (ignore user input)
    const finalQuality = quality || configuredQuality;

    // Prepare parameters for the provider system
    const generationParams = {
      prompt: finalPrompt,
      aspectRatio: standardAspectRatio,
      quality: finalQuality,
      userId: session.user.id,
      eventType,
      eventDetails,
      styleName,
      customStyle,
      watermarkEnabled: user.watermarkEnabled,
      // Only include seed parameters if the provider supports them
      // Use true randomization to ensure different images each time
      ...(supportsSeeds && {
        seed: Math.floor(Math.random() * 1000000), // Generate random seed each time
        randomizeSeed: true
      })
    };

    console.log("Provider generation parameters:", {
      ...generationParams,
      prompt: generationParams.prompt.substring(0, 100) + "...",
      finalQuality: finalQuality,
      configuredQuality: configuredQuality
    });
    
    // Log expected quality compensation for debugging
    if (actualProvider === 'fal-qwen' && standardAspectRatio === '9:16') {
      const qualityToSteps = { fast: 15, standard: 25, high: 35, ultra: 50 };
      const baseSteps = qualityToSteps[finalQuality] || 25;
      const expectedSteps = Math.min(Math.round(baseSteps * 1.5), 50);
      console.log(`🎯 Expected Fal-Qwen quality compensation for 9:16: ${baseSteps} base steps → ${expectedSteps} final steps`);
    }

    console.log("🔍 generateImageV2 Debug - Step 5: Image generation");
    // Generate image using the provider system
    const startTime = Date.now();
    
    let providerResponse;
    let generationTime;
    
    try {
      console.log("   Calling generateImageWithProviders...");
      providerResponse = await generateImageWithProviders(
        generationParams,
        actualProvider
      );
      generationTime = Date.now() - startTime;

      console.log("✅ Image generation successful");
      console.log(`   Provider used: ${providerResponse.provider}`);
      console.log(`   Generation time: ${generationTime}ms`);
      console.log(`   Cost: ${providerResponse.cost}`);
    } catch (error) {
      console.error("❌ Image generation failed:", error);
      throw error;
    }

    // Convert image data to buffer for uploading
    let imageBuffer: Buffer;
    if (typeof providerResponse.imageData === 'string') {
      if (providerResponse.imageData.startsWith('data:image')) {
        // Base64 data URL
        const base64Data = providerResponse.imageData.split(',')[1];
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else if (providerResponse.imageData.startsWith('http')) {
        // Image URL - download it
        console.log("Downloading image from URL:", providerResponse.imageData);
        const response = await fetch(providerResponse.imageData);
        if (!response.ok) {
          throw new Error(`Failed to download image: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
      } else {
        // Plain base64
        imageBuffer = Buffer.from(providerResponse.imageData, 'base64');
      }
    } else {
      // Already a buffer
      imageBuffer = providerResponse.imageData;
    }

    // Create image metadata with provider information FIRST
    const imageMetadata: ImageMetadata = {
      userId: session.user.id,
      eventType: eventType || undefined,
      aspectRatio: aspectRatio,
      stylePreset: styleName || undefined,
      watermarkEnabled: user.watermarkEnabled,
      promptHash: generatePromptHash(finalPrompt),
      generationModel: providerResponse.provider,
      customTags: [
        `provider:${providerResponse.provider}`,
        `quality:${quality || "standard"}`,
        `cost:${providerResponse.cost}`,
        `time:${providerResponse.generationTime}ms`
      ]
    };

    // Generate enhanced image key with provider info
    const fileExtension = providerResponse.mimeType ? 
      providerResponse.mimeType.split('/')[1] : 'png';
    const enhancedKey = generateEnhancedImageKey(
      imageMetadata,
      fileExtension
    );

    // Apply watermark if enabled
    let finalImageBuffer = imageBuffer;
    if (user.watermarkEnabled) {
      console.log("Applying watermark...");
      try {
        // For base64 data, we need to create a temporary data URL
        const dataUrl = `data:${providerResponse.mimeType};base64,${imageBuffer.toString('base64')}`;
        const watermarkedBuffer = await addWatermarkToImageFromUrl(dataUrl);
        
        // addWatermarkToImageFromUrl returns a Buffer, not a data URL
        finalImageBuffer = watermarkedBuffer;
        console.log("Watermark applied successfully");
      } catch (watermarkError) {
        console.error("Watermark application failed:", watermarkError);
        // Continue with original image if watermark fails
        finalImageBuffer = imageBuffer;
      }
    }

    console.log("🔍 generateImageV2 Debug - Step 7: R2 upload");
    // Upload to R2 with WebP support
    console.log("   Uploading to R2 with enhanced key:", enhancedKey);
    const webpConfig: WebPIntegrationConfig = {
      ...DEFAULT_WEBP_CONFIG,
      enabled: true
    };

    let uploadResult;
    let imageUrl: string;
    let webpUrl: string | null = null;

    try {
      uploadResult = await uploadImageWithWebP(
        finalImageBuffer,
        providerResponse.mimeType || 'image/png',
        imageMetadata,
        webpConfig
      );

      console.log("✅ R2 upload successful:", uploadResult);

      // Generate signed URLs for the uploaded images
      imageUrl = await generateSignedUrl(uploadResult.r2Key);
      webpUrl = uploadResult.success && uploadResult.webpSize !== uploadResult.originalSize 
        ? await generateSignedUrl(uploadResult.r2Key.replace(/\.[^.]+$/, '.webp')) 
        : null;

      console.log("✅ Signed URLs generated successfully");
    } catch (uploadError) {
      console.error("❌ R2 upload failed:", uploadError);
      
      // Fallback: Use the original image URL from the provider
      console.log("🔄 Using fallback: original provider image URL");
      imageUrl = providerResponse.imageData.startsWith('http') 
        ? providerResponse.imageData 
        : `data:${providerResponse.mimeType || 'image/png'};base64,${imageBuffer.toString('base64')}`;
      
      uploadResult = {
        r2Key: null,
        success: false,
        originalSize: imageBuffer.length,
        webpSize: imageBuffer.length
      };
      
      console.log("✅ Fallback image URL created:", imageUrl.substring(0, 100) + "...");
    }



    console.log("🔍 generateImageV2 Debug - Step 8: Database operations");
    
    // Deduct one credit from user
    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { credits: { decrement: 1 } }
      });
      console.log("✅ Credit deduction successful");
    } catch (creditError) {
      console.error("❌ Credit deduction failed:", creditError);
      // Continue anyway - the image was generated successfully
    }

    // Save generation record to database with provider info
    try {
      const generatedImage = await prisma.generatedImage.create({
      data: {
        userId: session.user.id,
        prompt: finalPrompt,
        url: imageUrl,
        r2Key: uploadResult.r2Key,
        webpKey: webpUrl ? uploadResult.r2Key.replace(/\.[^.]+$/, '.webp') : null,
        originalFormat: fileExtension,
        webpEnabled: !!webpUrl,
        eventType: eventType as any,
        eventDetails: eventDetails || null,
        // Provider system fields
        aspectRatio: aspectRatio,
        styleName: styleName || null,
        customStyle: customStyle || null,
        seed: providerResponse.seed?.toString() || null,
        provider: providerResponse.provider,
        generationTimeMs: providerResponse.generationTime,
        providerCost: providerResponse.cost,
        quality: quality || "standard",
        imageUrl: imageUrl,
        webpUrl: webpUrl
      }
    });

    console.log("✅ Database record created:", generatedImage.id);

    // Revalidate the dashboard path to show the new image
    revalidatePath("/dashboard");

    console.log("✅ Image generation completed successfully");
    return {
      success: true,
      imageUrl: imageUrl,
      webpUrl: webpUrl,
      r2Key: uploadResult.r2Key,
      generatedImageId: generatedImage.id,
      provider: providerResponse.provider,
      generationTime: providerResponse.generationTime,
      cost: providerResponse.cost,
      seed: providerResponse.seed,
      quality: quality || "standard",
      message: `Image generated successfully using ${providerResponse.provider} provider`
    };
    } catch (dbError) {
      console.error("❌ Database operation failed:", dbError);
      // Return success anyway since the image was generated
      return {
        success: true,
        imageUrl: imageUrl,
        webpUrl: webpUrl,
        r2Key: uploadResult.r2Key,
        generatedImageId: null,
        provider: providerResponse.provider,
        generationTime: providerResponse.generationTime,
        cost: providerResponse.cost,
        seed: providerResponse.seed,
        quality: quality || "standard",
        message: `Image generated successfully using ${providerResponse.provider} provider (database save failed)`
      };
    }

  } catch (error) {
    console.error("Error in generateImageV2:", error);

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
          throw new Error(`Image generation failed: ${error.message}`);
      }
    }

    // Handle other errors
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("An unexpected error occurred during image generation");
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
