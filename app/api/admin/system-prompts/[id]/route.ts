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

    // Update the existing prompt in place (no versioning)
    const updatedPrompt = await prisma.systemPrompt.update({
      where: { id: params.id },
      data: {
        name: name || existingPrompt.name,
        description: description !== undefined ? description : existingPrompt.description,
        content: content || existingPrompt.content,
        isActive: isActive !== undefined ? isActive : existingPrompt.isActive,
        metadata: metadata || existingPrompt.metadata,
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