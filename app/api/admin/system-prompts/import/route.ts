import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

// POST - Import system prompts from JSON
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'HERO')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { prompts } = body;

    if (!prompts || !Array.isArray(prompts)) {
      return NextResponse.json(
        { error: 'Invalid import data: prompts array is required' },
        { status: 400 }
      );
    }

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    // Process each prompt
    for (const promptData of prompts) {
      try {
        // Validate required fields
        if (!promptData.category || !promptData.name || !promptData.content) {
          console.error('Invalid prompt data:', promptData);
          errors++;
          continue;
        }

        // Check if prompt already exists
        const existingPrompt = await prisma.systemPrompt.findFirst({
          where: {
            category: promptData.category,
            subcategory: promptData.subcategory || null,
            name: promptData.name
          }
        });

        if (existingPrompt) {
          // Update existing prompt
          await prisma.systemPrompt.update({
            where: { id: existingPrompt.id },
            data: {
              description: promptData.description || null,
              content: promptData.content,
              version: promptData.version || existingPrompt.version,
              isActive: promptData.isActive !== false,
              metadata: promptData.metadata || {},
              updatedBy: user.id
            }
          });
          imported++;
        } else {
          // Create new prompt
          await prisma.systemPrompt.create({
            data: {
              category: promptData.category,
              subcategory: promptData.subcategory || null,
              name: promptData.name,
              description: promptData.description || null,
              content: promptData.content,
              version: promptData.version || 1,
              isActive: promptData.isActive !== false,
              metadata: promptData.metadata || {},
              createdBy: user.id,
              updatedBy: user.id
            }
          });
          imported++;
        }
      } catch (error) {
        console.error('Error processing prompt:', promptData.name, error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors,
      total: prompts.length
    });

  } catch (error) {
    console.error('Error importing system prompts:', error);
    return NextResponse.json(
      { error: 'Failed to import system prompts' },
      { status: 500 }
    );
  }
} 