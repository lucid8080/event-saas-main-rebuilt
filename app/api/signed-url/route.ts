import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateSignedUrl } from '@/lib/r2';
import { prisma } from '@/lib/db';

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

    const { imageId, expiresIn = 3600 } = await request.json();

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // Get image from database and verify ownership
    const image = await prisma.generatedImage.findFirst({
      where: {
        id: imageId,
        userId: session.user.id,
      },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found or access denied' },
        { status: 404 }
      );
    }

    // Check if image has R2 key
    if (!image.r2Key) {
      return NextResponse.json(
        { error: 'Image not stored in R2' },
        { status: 400 }
      );
    }

    // Generate signed URL
    const signedUrl = await generateSignedUrl(image.r2Key, expiresIn);

    return NextResponse.json({
      success: true,
      signedUrl,
      expiresIn,
      message: 'Signed URL generated successfully',
    });

  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate signed URL' },
      { status: 500 }
    );
  }
} 