import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { getImageUrl } from '@/lib/gallery-utils';

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters for pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6'); // Default to 6 images per page
    const offset = parseInt(searchParams.get('offset') || '0');
    const eventType = searchParams.get('eventType');

    // Build where clause
    const whereClause: any = {
      userId: session.user.id,
    };

    // Add event type filter if provided
    if (eventType && eventType !== 'all') {
      whereClause.eventType = eventType.toUpperCase();
    }

    // Fetch images with pagination - show best version (upscaled if available, otherwise original)
    const images = await prisma.generatedImage.findMany({
      where: {
        ...whereClause,
        OR: [
          { isUpscaled: false }, // Original images
          { isUpscaled: true, originalImageId: null } // Upscaled images without original (fallback)
        ]
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        url: true,
        prompt: true,
        eventType: true,
        eventDetails: true,
        isPublic: true,
        createdAt: true,
        isUpscaled: true,
        originalImageId: true,
        upscaledImageId: true,
        userId: true, // Add userId to check ownership
      },
      take: limit,
      skip: offset,
    });

    // For each original image, check if it has an upscaled version and use that instead
    const processedImages = await Promise.all(
      images.map(async (image) => {
        if (!image.isUpscaled && image.upscaledImageId) {
          // This is an original image with an upscaled version - get the upscaled version
          const upscaledImage = await prisma.generatedImage.findUnique({
            where: { id: image.upscaledImageId },
            select: {
              id: true,
              url: true,
              prompt: true,
              eventType: true,
              eventDetails: true,
              isPublic: true,
              createdAt: true,
              isUpscaled: true,
              originalImageId: true,
              upscaledImageId: true,
              userId: true, // Add userId to check ownership
            }
          });
          return upscaledImage || image;
        }
        return image;
      })
    );

    // Get total count for pagination - count original images (upscaled versions will replace them in display)
    const totalCount = await prisma.generatedImage.count({
      where: {
        ...whereClause,
        isUpscaled: false, // Only count original images for pagination
      },
    });

    // Generate proper URLs for each image
    const imagesWithUrls = await Promise.all(
      processedImages.map(async (image) => {
        try {
          const properUrl = await getImageUrl(image.id, 'gallery');
          return {
            ...image,
            url: properUrl
          };
        } catch (error) {
          console.error(`Error generating URL for image ${image.id}:`, error);
          return image; // Return original image if URL generation fails
        }
      })
    );

    return NextResponse.json({
      images: imagesWithUrls,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching user images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
} 