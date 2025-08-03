import { NextRequest, NextResponse } from 'next/server';
import { ticketmasterAPI } from '@/lib/ticketmaster';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.TICKETMASTER_API_KEY;
    const publicApiKey = process.env.NEXT_PUBLIC_TICKETMASTER_API_KEY;
    
    const status = {
      serverApiKey: apiKey ? 'Configured' : 'Missing',
      publicApiKey: publicApiKey ? 'Configured' : 'Missing',
      apiKeyLength: apiKey?.length || 0,
      publicApiKeyLength: publicApiKey?.length || 0,
      apiKeyPrefix: apiKey?.substring(0, 8) || 'N/A',
      publicApiKeyPrefix: publicApiKey?.substring(0, 8) || 'N/A',
    };

    // Test API connection
    let apiTest = null;
    try {
      // Test with a simple search
      const testResponse = await ticketmasterAPI.searchEvents({
        city: 'New York',
        stateCode: 'NY',
        size: 1,
      });
      
      apiTest = {
        success: true,
        eventsFound: testResponse._embedded?.events?.length || 0,
        totalElements: testResponse.page?.totalElements || 0,
        sampleEvent: testResponse._embedded?.events?.[0] ? {
          id: testResponse._embedded.events[0].id,
          name: testResponse._embedded.events[0].name,
          date: testResponse._embedded.events[0].dates?.start?.localDate,
        } : null,
      };
    } catch (error) {
      apiTest = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Test date range endpoint
    let dateRangeTest = null;
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7); // Test with just 7 days
      
      console.log('Testing date range with:', { startDate, endDate });
      
      const dateRangeResponse = await ticketmasterAPI.getEventsForDateRange(
        startDate,
        endDate,
        { city: 'New York', stateCode: 'NY' }
      );
      
      dateRangeTest = {
        success: true,
        eventsFound: dateRangeResponse.length,
        sampleEvents: dateRangeResponse.slice(0, 3).map(event => ({
          id: event.id,
          name: event.name,
          date: event.date,
          venue: event.venue,
        })),
      };
    } catch (error) {
      console.error('Date range test error:', error);
      dateRangeTest = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      };
    }

    // Test simple upcoming events
    let upcomingTest = null;
    try {
      const upcomingResponse = await ticketmasterAPI.getUpcomingEvents(
        { city: 'New York', stateCode: 'NY' },
        7
      );
      
      upcomingTest = {
        success: true,
        eventsFound: upcomingResponse.length,
        sampleEvents: upcomingResponse.slice(0, 3).map(event => ({
          id: event.id,
          name: event.name,
          date: event.date,
          venue: event.venue,
        })),
      };
    } catch (error) {
      console.error('Upcoming events test error:', error);
      upcomingTest = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      };
    }

    return NextResponse.json({
      status,
      apiTest,
      dateRangeTest,
      upcomingTest,
      timestamp: new Date().toISOString(),
      recommendations: getRecommendations(status, apiTest, dateRangeTest, upcomingTest),
    });
  } catch (error) {
    console.error('Ticketmaster debug error:', error);
    return NextResponse.json(
      { error: 'Failed to check Ticketmaster status' },
      { status: 500 }
    );
  }
}

function getRecommendations(status: any, apiTest: any, dateRangeTest: any, upcomingTest: any) {
  const recommendations = [];

  if (status.serverApiKey === 'Missing') {
    recommendations.push('Add TICKETMASTER_API_KEY to your environment variables');
  }

  if (status.publicApiKey === 'Missing') {
    recommendations.push('Add NEXT_PUBLIC_TICKETMASTER_API_KEY to your environment variables');
  }

  if (status.serverApiKey === 'Configured' && status.publicApiKey === 'Configured') {
    if (!apiTest?.success) {
      recommendations.push('API key may be invalid or expired. Check your Ticketmaster developer account');
      recommendations.push('Verify you have selected the Discovery API product');
    }

    if (apiTest?.success && dateRangeTest?.success && dateRangeTest.eventsFound === 0) {
      recommendations.push('API is working but no events found for the test location. Try a different city or date range');
    }

    if (upcomingTest?.success && upcomingTest.eventsFound > 0) {
      recommendations.push('Upcoming events test successful! Events should appear on calendar');
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('API appears to be working correctly. Check the calendar page for events');
  }

  return recommendations;
} 