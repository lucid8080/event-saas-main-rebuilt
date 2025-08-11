import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateSignedUrl } from "@/lib/r2";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 });
    }

    // Get the image and check if user owns it
    const image = await prisma.generatedImage.findUnique({
      where: { id: imageId },
      select: {
        id: true,
        url: true,
        userId: true,
        isUpscaled: true,
        originalImageId: true,
        upscaledImageId: true,
      }
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    if (image.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let originalImage = null;
    let upscaledImage = null;

    if (image.isUpscaled) {
      // This is an upscaled image, get the original
      originalImage = await prisma.generatedImage.findUnique({
        where: { id: image.originalImageId! },
        select: {
          id: true,
          url: true,
          r2Key: true,
          webpKey: true,
          webpEnabled: true,
        }
      });
      upscaledImage = {
        id: image.id,
        url: image.url,
        r2Key: null, // Will be generated below
        webpKey: null,
        webpEnabled: false,
      };
    } else {
      // This is an original image, get the upscaled version if it exists
      originalImage = {
        id: image.id,
        url: image.url,
        r2Key: null, // Will be generated below
        webpKey: null,
        webpEnabled: false,
      };
      
      if (image.upscaledImageId) {
        upscaledImage = await prisma.generatedImage.findUnique({
          where: { id: image.upscaledImageId },
          select: {
            id: true,
            url: true,
            r2Key: true,
            webpKey: true,
            webpEnabled: true,
          }
        });
      }
    }

    // Generate signed URLs for R2 images
    if (originalImage) {
      if (originalImage.r2Key) {
        originalImage.url = await generateSignedUrl(originalImage.r2Key);
        if (originalImage.webpKey && originalImage.webpEnabled) {
          originalImage.webpUrl = await generateSignedUrl(originalImage.webpKey);
        }
      }
    }

    if (upscaledImage) {
      if (upscaledImage.r2Key) {
        upscaledImage.url = await generateSignedUrl(upscaledImage.r2Key);
        if (upscaledImage.webpKey && upscaledImage.webpEnabled) {
          upscaledImage.webpUrl = await generateSignedUrl(upscaledImage.webpKey);
        }
      }
    }

    return NextResponse.json({
      success: true,
      originalImage,
      upscaledImage,
      hasUpscaledVersion: !!upscaledImage,
    });

  } catch (error) {
    console.error("Error fetching image versions:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
