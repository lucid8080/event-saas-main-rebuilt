"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { EventDetails } from "@/lib/prompt-generator";

export async function generateImageV3(
  prompt: string, 
  aspectRatio: string, 
  eventType?: string, 
  eventDetails?: EventDetails,
  styleReferenceImages?: File[]
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

    // Convert aspect ratio format to Ideogram 3.0 format
    const convertAspectRatioV3 = (ratio: string): string => {
      const aspectRatioMap: { [key: string]: string } = {
        '1:1': '1x1',
        '16:9': '16x9',
        '9:16': '9x16',
        '4:3': '4x3',
        '3:4': '3x4',
        '3:2': '3x2',
        '2:3': '2x3',
        '10:16': '10x16',
        '16:10': '16x10',
        '1:3': '1x3',
        '3:1': '3x1'
      };
      
      return aspectRatioMap[ratio] || '1x1'; // Default to 1x1 if not found
    };

    const ideogramAspectRatio = convertAspectRatioV3(aspectRatio);
    console.log(`Converting aspect ratio for V3: ${aspectRatio} -> ${ideogramAspectRatio}`);

    // Create FormData for Ideogram 3.0 API
    const formData = new FormData();

    // Add style reference images if provided
    if (styleReferenceImages && styleReferenceImages.length > 0) {
      styleReferenceImages.forEach((file) => {
        formData.append("style_reference_images", file);
      });
    }

    // Add the prompt
    formData.append("prompt", prompt);

    // Add aspect ratio
    formData.append("aspect_ratio", ideogramAspectRatio);

    // Add rendering speed (TURBO for faster generation)
    formData.append("rendering_speed", "TURBO");

    console.log("Sending request to Ideogram 3.0 API with:", {
      prompt,
      aspectRatio: ideogramAspectRatio,
      styleReferenceImages: styleReferenceImages?.length || 0
    });

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
      console.error("Ideogram 3.0 API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}. Response: ${errorText}`);
    }

    const data = await response.json();
    console.log("Ideogram 3.0 API Response:", data);

    // Check for successful image generation
    // Note: Response structure might be different in V3
    let imageUrl: string | null = null;
    
    if (data.data && data.data[0]?.url) {
      imageUrl = data.data[0].url;
    } else if (data.url) {
      imageUrl = data.url;
    } else if (data.images && data.images[0]?.url) {
      imageUrl = data.images[0].url;
    }

    if (imageUrl) {
      // Deduct one credit
      await prisma.user.update({
        where: { id: session.user.id },
        data: { credits: { decrement: 1 } }
      });

      // Save the generated image to the database
      await prisma.generatedImage.create({
        data: {
          userId: session.user.id,
          prompt: prompt,
          url: imageUrl,
          eventType: eventType as any, // Cast to EventType enum
          eventDetails: eventDetails || null,
        }
      });

      revalidatePath("/dashboard");
      return { success: true, imageUrl };
    } else {
      console.error("No image URL found in response:", data);
      throw new Error("Failed to generate image - no URL in response");
    }
  } catch (error) {
    console.error("Error generating image with Ideogram 3.0:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to generate image" 
    };
  }
} 