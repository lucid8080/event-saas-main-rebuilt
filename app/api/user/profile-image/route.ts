import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const imageUrl = formData.get('imageUrl') as string;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid image URL format' }, { status: 400 });
    }

    // Update user's profile image
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Profile image updated successfully',
      imageUrl 
    });
  } catch (error) {
    console.error('Error updating profile image:', error);
    return NextResponse.json({ error: 'Failed to update profile image' }, { status: 500 });
  }
} 