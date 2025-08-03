import { NextRequest, NextResponse } from 'next/server';
import { ticketmasterAPI } from '@/lib/ticketmaster';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Optional parameters
    const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : 30;
    const city = searchParams.get('city');
    const stateCode = searchParams.get('stateCode');
    const countryCode = searchParams.get('countryCode');

    const location = city || stateCode || countryCode ? {
      city: city || undefined,
      stateCode: stateCode || undefined,
      countryCode: countryCode || undefined,
    } : undefined;

    // Validate days parameter
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Days must be between 1 and 365' },
        { status: 400 }
      );
    }

    // Get upcoming events
    const events = await ticketmasterAPI.getUpcomingEvents(location, days);
    
    return NextResponse.json({
      events,
      days,
      location,
      total: events.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Upcoming events error:', error);
    
    if (error instanceof Error && error.message.includes('API key not configured')) {
      return NextResponse.json(
        { error: 'Ticketmaster API not configured' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch upcoming events' },
      { status: 500 }
    );
  }
} 