import { NextRequest, NextResponse } from 'next/server';
import { ticketmasterAPI } from '@/lib/ticketmaster';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Required parameters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    // Optional location parameters
    const city = searchParams.get('city');
    const stateCode = searchParams.get('stateCode');
    const countryCode = searchParams.get('countryCode');

    const location = city || stateCode || countryCode ? {
      city: city || undefined,
      stateCode: stateCode || undefined,
      countryCode: countryCode || undefined,
    } : undefined;

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Get events for date range
    const events = await ticketmasterAPI.getEventsForDateRange(start, end, location);
    
    return NextResponse.json({
      events,
      dateRange: {
        start: startDate,
        end: endDate,
      },
      location,
      total: events.length,
    });
  } catch (error) {
    console.error('Date range events error:', error);
    
    if (error instanceof Error && error.message.includes('API key not configured')) {
      return NextResponse.json(
        { error: 'Ticketmaster API not configured' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch events for date range' },
      { status: 500 }
    );
  }
} 