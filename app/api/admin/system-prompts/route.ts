import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

// GET - Fetch all system prompts
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'HERO')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    
    if (category) where.category = category;
    if (subcategory) where.subcategory = subcategory;
    if (isActive !== null) where.isActive = isActive === 'true';

    const prompts = await prisma.systemPrompt.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { subcategory: 'asc' },
        { version: 'desc' }
      ]
    });

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Error fetching system prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system prompts' },
      { status: 500 }
    );
  }
}

// POST - Create a new system prompt
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'HERO')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { category, subcategory, name, description, content, metadata } = body;

    if (!category || !name || !content) {
      return NextResponse.json(
        { error: 'Category, name, and content are required' },
        { status: 400 }
      );
    }

    // Get the latest version for this category/subcategory combination
    const latestVersion = await prisma.systemPrompt.findFirst({
      where: {
        category,
        subcategory: subcategory || null
      },
      orderBy: { version: 'desc' },
      select: { version: true }
    });

    const newVersion = (latestVersion?.version || 0) + 1;

    const prompt = await prisma.systemPrompt.create({
      data: {
        category,
        subcategory: subcategory || null,
        name,
        description: description || null,
        content,
        version: newVersion,
        metadata: metadata || {},
        createdBy: user.id,
        updatedBy: user.id
      }
    });

    return NextResponse.json({ prompt }, { status: 201 });
  } catch (error) {
    console.error('Error creating system prompt:', error);
    return NextResponse.json(
      { error: 'Failed to create system prompt' },
      { status: 500 }
    );
  }
} 