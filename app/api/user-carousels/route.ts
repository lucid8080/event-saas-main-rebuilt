import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const carousels = await prisma.generatedCarousel.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        slides: true,
        slideUrls: true,
        aspectRatio: true,
        slideCount: true,
        isPublic: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ carousels });
  } catch (error) {
    console.error('Error fetching user carousels:', error);
    return NextResponse.json({ error: 'Failed to fetch carousels' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, slides, slideUrls, aspectRatio, slideCount } = body;

    if (!title || !slides || !slideUrls) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const carousel = await prisma.generatedCarousel.create({
      data: {
        userId: session.user.id,
        title,
        description,
        slides,
        slideUrls,
        aspectRatio: aspectRatio || '1:1',
        slideCount: slideCount || 3,
      },
    });

    return NextResponse.json({ carousel });
  } catch (error) {
    console.error('Error creating carousel:', error);
    return NextResponse.json({ error: 'Failed to create carousel' }, { status: 500 });
  }
} 