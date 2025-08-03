import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

// GET - Fetch a specific system prompt
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'HERO')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prompt = await prisma.systemPrompt.findUnique({
      where: { id: params.id }
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error('Error fetching system prompt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system prompt' },
      { status: 500 }
    );
  }
}

// PUT - Update a system prompt
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'HERO')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, content, isActive, metadata } = body;

    // Check if prompt exists
    const existingPrompt = await prisma.systemPrompt.findUnique({
      where: { id: params.id }
    });

    if (!existingPrompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Create a new version instead of updating the existing one
    const newVersion = existingPrompt.version + 1;

    const updatedPrompt = await prisma.systemPrompt.create({
      data: {
        category: existingPrompt.category,
        subcategory: existingPrompt.subcategory,
        name: name || existingPrompt.name,
        description: description !== undefined ? description : existingPrompt.description,
        content: content || existingPrompt.content,
        version: newVersion,
        isActive: isActive !== undefined ? isActive : existingPrompt.isActive,
        metadata: metadata || existingPrompt.metadata,
        createdBy: existingPrompt.createdBy,
        updatedBy: user.id
      }
    });

    return NextResponse.json({ prompt: updatedPrompt });
  } catch (error) {
    console.error('Error updating system prompt:', error);
    return NextResponse.json(
      { error: 'Failed to update system prompt' },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate a system prompt (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'HERO')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prompt = await prisma.systemPrompt.findUnique({
      where: { id: params.id }
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    const updatedPrompt = await prisma.systemPrompt.update({
      where: { id: params.id },
      data: {
        isActive: false,
        updatedBy: user.id
      }
    });

    return NextResponse.json({ prompt: updatedPrompt });
  } catch (error) {
    console.error('Error deactivating system prompt:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate system prompt' },
      { status: 500 }
    );
  }
} 