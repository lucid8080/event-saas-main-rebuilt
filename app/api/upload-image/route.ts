import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadImageToR2, generateImageKey, getFileExtension } from '@/lib/r2';
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

    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const imageId = formData.get('imageId') as string;

    if (!imageFile || !imageId) {
      return NextResponse.json(
        { error: 'Image file and imageId are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    
    // Generate unique key for R2 storage
    const extension = getFileExtension(imageFile.type);
    const key = generateImageKey(session.user.id, imageId, extension);

    // Upload to R2
    const uploadedKey = await uploadImageToR2(key, imageBuffer, imageFile.type);

    // Update database record with R2 key
          await prisma.generatedImage.update({
      where: {
        id: imageId,
        userId: session.user.id,
      },
      data: {
        r2Key: uploadedKey,
        // Keep the original URL for backward compatibility
        // url: `r2://${uploadedKey}`, // Optional: store R2 reference
      },
    });

    return NextResponse.json({
      success: true,
      key: uploadedKey,
      message: 'Image uploaded successfully to R2',
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 