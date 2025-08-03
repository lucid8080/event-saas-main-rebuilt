import { NextRequest, NextResponse } from 'next/server';
import { ticketmasterAPI } from '@/lib/ticketmaster';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Get specific event
    const event = await ticketmasterAPI.getEvent(eventId);
    
    return NextResponse.json({
      event,
      formatted: ticketmasterAPI.formatEventForCalendar(event),
    });
  } catch (error) {
    console.error('Event fetch error:', error);
    
    if (error instanceof Error && error.message.includes('API key not configured')) {
      return NextResponse.json(
        { error: 'Ticketmaster API not configured' },
        { status: 503 }
      );
    }
    
    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
} 