"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { EventDetails, generateEnhancedPromptWithSystemPrompts, generateFullPromptWithSystemPrompts } from "@/lib/prompt-generator";
import { addWatermarkToImageFromUrl } from "@/lib/watermark";
import { uploadImageToR2, generateImageKey, getFileExtension, generateSignedUrl, generateEnhancedImageKey, type ImageMetadata } from "@/lib/r2";
import { generatePromptHash } from "@/lib/enhanced-image-naming";
import { uploadImageWithWebP, DEFAULT_WEBP_CONFIG, type WebPIntegrationConfig } from "@/lib/webp-integration";

export async function generateImage(
  prompt: string, 
  aspectRatio: string, 
  eventType?: string, 
  eventDetails?: EventDetails,
  styleName?: string,
  customStyle?: string
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

    // Check if API key is configured
    const apiKey = process.env.NEXT_PUBLIC_IDEOGRAM_API_KEY;
    if (!apiKey) {
      throw new Error("Ideogram API key is not configured. Please add NEXT_PUBLIC_IDEOGRAM_API_KEY to your environment variables.");
    }

    // Build the final combined prompt using enhanced prompt generator
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
          styleName,
          customStyle
        );
        
      } catch (error) {
        console.error('Error building enhanced prompt, using fallback:', error);
        // Fallback to original prompt if something goes wrong
        finalPrompt = prompt;
      }
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
    console.log(`Converting aspect ratio for V3: ${aspectRatio} -> ${ideogramAspectRatio}`);

    // Create FormData for Ideogram 3.0 API
    const formData = new FormData();

    // Add the prompt
    formData.append("prompt", finalPrompt);

    // Add aspect ratio
    formData.append("aspect_ratio", ideogramAspectRatio);

    // Add rendering speed (TURBO for faster generation)
    formData.append("rendering_speed", "TURBO");

    // Make the API call to generate the image using Ideogram 3.0
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
      console.error("Ideogram API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}. Response: ${errorText}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    // If image generation was successful, deduct one credit
    if (data.data && data.data[0]?.url) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { credits: { decrement: 1 } }
      });

      const originalImageUrl = data.data[0].url;
      let finalImageUrl = originalImageUrl;

      // Apply watermark if enabled
      if (user.watermarkEnabled) {
        try {
          console.log("Watermark enabled - applying server-side watermark");
          
          // Apply watermark directly to the image
          const watermarkedBuffer = await addWatermarkToImageFromUrl(originalImageUrl);
          
          // Convert the watermarked buffer to a data URL
          const watermarkedDataUrl = `data:image/png;base64,${watermarkedBuffer.toString('base64')}`;
          
          finalImageUrl = watermarkedDataUrl;
          console.log("Watermark applied successfully, using data URL");
        } catch (watermarkError) {
          console.error("Error applying watermark:", watermarkError);
          // Continue with original URL if there's an error
          finalImageUrl = originalImageUrl;
        }
      }

      // Check if cloud services are enabled before attempting R2 upload
      const cloudServicesEnabled = process.env.NEXT_PUBLIC_ENABLE_CLOUD_SERVICES === 'true';
      
      // Download the image from Ideogram and upload to R2 (if enabled)
      let r2Key: string | null = null;
      let webpKey: string | null = null;
      let signedUrl: string | null = null;
      let originalFormat: string | null = null;
      let compressionRatio: number | null = null;
      let webpEnabled: boolean = true;

      let imageBuffer: Buffer;
      let contentType: string;

      try {
        // Handle different URL types
        if (finalImageUrl.startsWith('data:')) {
          // Handle data URL (watermarked image)
          console.log('Processing data URL (watermarked image)');
          const base64Data = finalImageUrl.split(',')[1];
          imageBuffer = Buffer.from(base64Data, 'base64');
          contentType = 'image/png'; // Watermarked images are always PNG
        } else {
          // Handle regular URL (download from Ideogram)
          console.log('Downloading image from Ideogram URL');
          const imageResponse = await fetch(finalImageUrl);
          if (!imageResponse.ok) {
            throw new Error('Failed to download image from Ideogram');
          }
          
          imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
          contentType = imageResponse.headers.get('content-type') || 'image/png';
        }

        // Only attempt R2 upload if cloud services are enabled
        if (!cloudServicesEnabled) {
          console.warn('🚨 Cloud services disabled (NEXT_PUBLIC_ENABLE_CLOUD_SERVICES not set)');
          console.warn('Skipping R2 upload, using original Ideogram URL');
          // Don't attempt upload, just use the original URL
          // Set defaults for non-R2 mode
          r2Key = null;
          webpKey = null;
          signedUrl = null;
          originalFormat = contentType.includes('png') ? 'png' : 
                          contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'png';
          compressionRatio = null;
          webpEnabled = false;
        } else {
          // Generate enhanced key for R2 storage with comprehensive metadata
          const extension = getFileExtension(contentType);
          const promptHash = generatePromptHash(finalPrompt);
          
          const imageMetadata: ImageMetadata = {
            userId: session.user.id,
            eventType: eventType as any,
            aspectRatio: aspectRatio,
            watermarkEnabled: user.watermarkEnabled,
            promptHash: promptHash,
            generationModel: 'ideogram-v3',
            customTags: eventDetails ? Object.keys(eventDetails).filter(key => eventDetails[key as keyof EventDetails]) : undefined
          };
          
          // WebP Integration Configuration
          const webpConfig: WebPIntegrationConfig = {
            ...DEFAULT_WEBP_CONFIG,
            defaultPreset: 'medium', // Good balance of quality and compression for generated images
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
            
            console.log('Image successfully uploaded to R2 with WebP conversion:', {
              r2Key,
              webpKey,
              originalFormat,
              compressionRatio: `${compressionRatio.toFixed(2)}%`,
              webpEnabled,
              originalSize: webpResult.originalSize,
              webpSize: webpResult.webpSize
            });
            
            // Generate signed URL for immediate access
            signedUrl = await generateSignedUrl(r2Key, 3600); // 1 hour
          } else {
            throw new Error(webpResult.error || 'WebP upload failed');
          }
        }
        
      } catch (r2Error) {
        console.error('Error uploading to R2 with WebP:', r2Error);
        console.error('R2 upload failed details:', {
          finalImageUrl: finalImageUrl.substring(0, 100) + '...',
          contentType,
          imageBufferSize: imageBuffer?.length || 'unknown',
          error: r2Error instanceof Error ? r2Error.message : 'Unknown error'
        });
        // Fallback to original URL if R2 upload fails
        console.log('Falling back to original Ideogram URL');
        r2Key = null;
        webpKey = null;
        signedUrl = null;
      }

      // Save the generated image to the database
      const savedImage = await prisma.generatedImage.create({
        data: {
          userId: session.user.id,
          prompt: finalPrompt,
          url: signedUrl || finalImageUrl, // Use signed URL if available, fallback to original
          r2Key: r2Key, // Store R2 key for future signed URL generation
          webpKey: webpKey, // Store WebP key if conversion was successful
          originalFormat: originalFormat, // Store original format
          compressionRatio: compressionRatio, // Store compression ratio
          webpEnabled: webpEnabled, // Store WebP enabled status
          eventType: eventType as any, // Cast to EventType enum
          eventDetails: eventDetails || null,
        }
      });

      revalidatePath("/dashboard");
      return { 
        success: true, 
        imageUrl: signedUrl || finalImageUrl,
        imageId: savedImage.id,
        r2Key: r2Key
      };
    } else {
      throw new Error("Failed to generate image");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to generate image" 
    };
  }
} 