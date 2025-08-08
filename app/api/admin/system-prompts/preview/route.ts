import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getActivePrompt } from '@/lib/system-prompts';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin/hero role
    const user = session.user as any;
    if (user.role !== 'ADMIN' && user.role !== 'HERO') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { eventType, styleName } = body;

    const prompts: { eventTypePrompt?: string; stylePrompt?: string } = {};

    // Get event type prompt
    if (eventType) {
      const eventPrompt = await getActivePrompt('event_type', eventType);
      if (eventPrompt?.content) {
        prompts.eventTypePrompt = eventPrompt.content;
      }
    }

    // Get style preset prompt
    if (styleName && styleName !== 'No Style') {
      const stylePrompt = await getActivePrompt('style_preset', styleName);
      if (stylePrompt?.content) {
        prompts.stylePrompt = stylePrompt.content;
      }
    }

    return NextResponse.json({ success: true, prompts });

  } catch (error) {
    console.error('Error fetching prompts for preview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}