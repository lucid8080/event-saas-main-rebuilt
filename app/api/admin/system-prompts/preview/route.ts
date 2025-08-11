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

    // Get event type prompt with fallback logic matching actual generator
    if (eventType) {
      // Define event type names mapping (matches actual generator)
      const eventTypeNames: { [key: string]: string } = {
        'WEDDING': 'Wedding',
        'BIRTHDAY_PARTY': 'Birthday Party',
        'CORPORATE_EVENT': 'Corporate Event',
        'HOLIDAY_CELEBRATION': 'Holiday Celebration',
        'CONCERT': 'Concert',
        'SPORTS_EVENT': 'Sports Event',
        'NIGHTLIFE': 'Nightlife',
        'FAMILY_GATHERING': 'Family Gathering'
      };
      const eventName = eventTypeNames[eventType] || eventType;
      const minimalEventContext = `${eventName} flyer theme`;

      try {
        const eventPrompt = await getActivePrompt('event_type', eventType);
        if (eventPrompt?.content) {
          // Check if the database prompt already contains the minimal context
          const hasEventContextAlready = eventPrompt.content.toLowerCase().includes(minimalEventContext.toLowerCase());
          if (!hasEventContextAlready) {
            // Prepend minimal context if not already included (matches actual generator)
            prompts.eventTypePrompt = `${minimalEventContext}, ${eventPrompt.content}`;
          } else {
            prompts.eventTypePrompt = eventPrompt.content;
          }
        } else {
          // Fallback to minimal event context if DB is missing (matches actual generator)
          prompts.eventTypePrompt = minimalEventContext;
        }
      } catch (error) {
        console.error('Error retrieving event type prompt:', error);
        // On error, still add a minimal event context (matches actual generator)
        prompts.eventTypePrompt = minimalEventContext;
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