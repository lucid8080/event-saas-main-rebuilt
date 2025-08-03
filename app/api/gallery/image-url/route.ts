import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getImageUrl, verifyImageOwnership } from '@/lib/gallery-utils';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { imageId } = await request.json();

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // Verify user owns the image
    const ownsImage = await verifyImageOwnership(imageId);
    if (!ownsImage) {
      return NextResponse.json(
        { error: 'Image not found or access denied' },
        { status: 404 }
      );
    }

    // Get signed URL for the image
    const imageUrl = await getImageUrl(imageId);

    return NextResponse.json({
      success: true,
      imageUrl,
      message: 'Image URL generated successfully',
    });

  } catch (error) {
    console.error('Error getting image URL:', error);
    return NextResponse.json(
      { error: 'Failed to get image URL' },
      { status: 500 }
    );
  }
} 