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

    // Get all prompts (no version filtering needed)
    const prompts = await prisma.systemPrompt.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { subcategory: 'asc' }
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

    // Check if a prompt already exists for this category/subcategory
    const existingPrompt = await prisma.systemPrompt.findFirst({
      where: {
        category,
        subcategory: subcategory || null
      }
    });

    if (existingPrompt) {
      // Update existing prompt instead of creating a new one
      const prompt = await prisma.systemPrompt.update({
        where: { id: existingPrompt.id },
        data: {
          name,
          description: description || null,
          content,
          metadata: metadata || {},
          updatedBy: user.id
        }
      });
      return NextResponse.json({ prompt }, { status: 200 });
    } else {
      // Create new prompt with version 1
      const prompt = await prisma.systemPrompt.create({
        data: {
          category,
          subcategory: subcategory || null,
          name,
          description: description || null,
          content,
          version: 1,
          metadata: metadata || {},
          createdBy: user.id,
          updatedBy: user.id
        }
      });
      return NextResponse.json({ prompt }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating system prompt:', error);
    return NextResponse.json(
      { error: 'Failed to create system prompt' },
      { status: 500 }
    );
  }
} 