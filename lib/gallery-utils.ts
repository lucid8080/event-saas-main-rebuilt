import { generateSignedUrl } from '@/lib/r2';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { getCachedSignedUrl } from '@/lib/r2-cache';
import { trackImageAccess } from '@/lib/r2-analytics';

// Generate signed URL for an image if it's stored in R2
export async function getImageUrl(imageId: string, accessType: 'gallery' | 'modal' | 'download' | 'share' = 'gallery'): Promise<string> {
  try {
    // Get the image from database
    const image = await prisma.generatedImage.findUnique({
      where: { id: imageId },
      select: { url: true, r2Key: true, userId: true }
    });

    if (!image) {
      throw new Error('Image not found');
    }

    // Track image access
    await trackImageAccess(imageId, accessType);

    // Check if image is stored in R2
    if (image.r2Key) {
      try {
        // Use cached signed URL for better performance
        const signedUrl = await getCachedSignedUrl(image.r2Key, 3600);
        return signedUrl;
      } catch (r2Error) {
        console.error('Error generating signed URL for R2 image:', r2Error);
        // Fallback to original URL if signed URL generation fails
        return image.url;
      }
    }

    // Return original URL if not stored in R2
    return image.url;
  } catch (error) {
    console.error('Error getting image URL:', error);
    throw error;
  }
}

// Generate signed URLs for multiple images
export async function getImageUrls(imageIds: string[]): Promise<Record<string, string>> {
  const urls: Record<string, string> = {};
  
  try {
    // Get all images from database
    const images = await prisma.generatedImage.findMany({
      where: { id: { in: imageIds } },
      select: { id: true, url: true, r2Key: true }
    });

    // Process each image
    for (const image of images) {
      if (image.r2Key) {
        try {
          // Generate signed URL for R2 images
          const signedUrl = await generateSignedUrl(image.r2Key, 3600);
          urls[image.id] = signedUrl;
        } catch (r2Error) {
          console.error(`Error generating signed URL for image ${image.id}:`, r2Error);
          // Fallback to original URL
          urls[image.id] = image.url;
        }
      } else {
        // Use original URL for non-R2 images
        urls[image.id] = image.url;
      }
    }
  } catch (error) {
    console.error('Error getting image URLs:', error);
  }

  return urls;
}

// Check if user owns an image (for security)
export async function verifyImageOwnership(imageId: string): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return false;
    }

    const image = await prisma.generatedImage.findFirst({
      where: { 
        id: imageId,
        userId: session.user.id
      },
      select: { id: true }
    });

    return !!image;
  } catch (error) {
    console.error('Error verifying image ownership:', error);
    return false;
  }
} 