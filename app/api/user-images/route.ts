import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { getImageUrl } from '@/lib/gallery-utils';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const images = await prisma.generatedImage.findMany({
      where: {
        userId: session.user.id,
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
      },
    });

    // Generate proper URLs for each image
    const imagesWithUrls = await Promise.all(
      images.map(async (image) => {
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

    return NextResponse.json({ images: imagesWithUrls });
  } catch (error) {
    console.error('Error fetching user images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
} 