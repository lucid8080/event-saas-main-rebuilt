# Ticketmaster API Setup Guide

This guide will help you set up the Ticketmaster API integration for the calendar events feature.

## Overview

The Ticketmaster integration allows users to view real events from Ticketmaster directly in their calendar, with the ability to generate flyers for these events using the Event Generator.

## Features

- **Real-time Event Data**: Display actual events from Ticketmaster API
- **Calendar Integration**: Events appear alongside holidays in the calendar
- **Event Details**: Comprehensive event information with venue, pricing, and descriptions
- **Flyer Generation**: Convert events into promotional flyers
- **Location-based Search**: Find events by city, state, and country
- **Event Categories**: Filter by event type (concerts, sports, theater, etc.)

## Setup Instructions

### 1. Get Ticketmaster API Key

1. Visit the [Ticketmaster Developer Portal](https://developer.ticketmaster.com/)
2. Create a new account or sign in to your existing account
3. Navigate to "My Apps" and create a new application
4. Select the "Discovery API" product
5. Copy your API key

### 2. Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Ticketmaster API Configuration
TICKETMASTER_API_KEY=your_api_key_here
NEXT_PUBLIC_TICKETMASTER_API_KEY=your_api_key_here
```

**Note**: We use both server-side and client-side API keys for different purposes:
- `TICKETMASTER_API_KEY`: Used for server-side API calls (API routes)
- `NEXT_PUBLIC_TICKETMASTER_API_KEY`: Used for client-side API calls (React hooks)

### 3. API Rate Limits

The Ticketmaster API has the following rate limits:
- **Free Tier**: 5,000 requests per day
- **Paid Tiers**: Higher limits available

The integration includes rate limiting (100ms delay between requests) to respect these limits.

### 4. Default Location Configuration

The calendar currently uses a default location (New York, NY) for event searches. To customize this:

1. Edit `app/(protected)/calendar/page.tsx`
2. Find the `userLocation` object in the `useEffect` hook
3. Update with your preferred default location:

```typescript
const userLocation = {
  city: 'Your City',
  stateCode: 'Your State Code',
  countryCode: 'Your Country Code',
};
```

## API Endpoints

The integration provides the following API endpoints:

### `/api/events/search`
Search for events with various filters
- **Parameters**: keyword, city, stateCode, countryCode, startDateTime, endDateTime, etc.
- **Method**: GET

### `/api/events/date-range`
Get events within a specific date range
- **Parameters**: startDate, endDate, city, stateCode, countryCode
- **Method**: GET

### `/api/events/upcoming`
Get upcoming events
- **Parameters**: days, city, stateCode, countryCode
- **Method**: GET

### `/api/events/[id]`
Get details for a specific event
- **Parameters**: event ID in URL
- **Method**: GET

## Usage Examples

### Search for Events
```typescript
// Search for concerts in New York
const response = await fetch('/api/events/search?keyword=concert&city=New York&stateCode=NY');
const data = await response.json();
```

### Get Events for Date Range
```typescript
// Get events for next month
const startDate = new Date();
const endDate = new Date();
endDate.setMonth(endDate.getMonth() + 1);

const response = await fetch(`/api/events/date-range?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
const data = await response.json();
```

### Get Upcoming Events
```typescript
// Get events for next 30 days
const response = await fetch('/api/events/upcoming?days=30&city=Los Angeles&stateCode=CA');
const data = await response.json();
```

## React Hook Usage

The integration provides a custom React hook for managing events:

```typescript
import { useTicketmasterEvents } from '@/hooks/use-ticketmaster-events';

function MyComponent() {
  const {
    events,
    loading,
    error,
    searchEvents,
    getEventsForDateRange,
    getUpcomingEvents,
  } = useTicketmasterEvents();

  // Search for events
  const handleSearch = () => {
    searchEvents({
      keyword: 'concert',
      city: 'New York',
      stateCode: 'NY',
    });
  };

  // Get events for date range
  const handleDateRange = () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    getEventsForDateRange(startDate, endDate, {
      city: 'New York',
      stateCode: 'NY',
    });
  };

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {events.map(event => (
        <div key={event.id}>{event.name}</div>
      ))}
    </div>
  );
}
```

## Event Data Structure

Events returned by the API have the following structure:

```typescript
interface CalendarEvent {
  id: string;
  name: string;
  date: Date;
  time: string;
  venue: string;
  city: string;
  state: string;
  image: string;
  url: string;
  priceRange?: {
    type: string;
    currency: string;
    min: number;
    max: number;
  };
  classification: string;
  genre: string;
  description: string;
  status: string;
  isTBA: boolean;
  isTBD: boolean;
}
```

## Event Categories

The Ticketmaster API categorizes events into segments:

- **Music**: Concerts, music festivals
- **Sports**: Sporting events, games
- **Arts & Theater**: Plays, musicals, art exhibitions
- **Family**: Family-friendly events
- **Comedy**: Stand-up comedy, comedy shows
- **Film**: Movie screenings, film festivals

## Flyer Generation Integration

When users click "Generate Flyer" on an event, they are redirected to the Event Generator with pre-populated data:

- **Event Type**: Automatically set based on event classification
- **Event Name**: Pre-filled with the event name
- **Date & Time**: Pre-filled with event date and time
- **Venue**: Pre-filled with event venue
- **Location**: Pre-filled with city and state
- **Description**: Pre-filled with event description

## Troubleshooting

### API Key Issues
- Ensure your API key is valid and active
- Check that you've selected the Discovery API product
- Verify the API key is correctly set in environment variables

### Rate Limiting
- If you hit rate limits, consider upgrading your Ticketmaster API plan
- The integration includes built-in rate limiting to prevent issues

### No Events Showing
- Check that your default location is correct
- Verify the date range you're searching
- Ensure the API key has proper permissions

### CORS Issues
- The API calls are made server-side to avoid CORS issues
- Client-side calls use the public API key for basic functionality

## Security Considerations

- Keep your API keys secure and never commit them to version control
- Use environment variables for all API keys
- Consider implementing API key rotation for production use
- Monitor API usage to stay within rate limits

## Support

For issues with the Ticketmaster API:
- Visit the [Ticketmaster Developer Portal](https://developer.ticketmaster.com/)
- Check the [API Documentation](https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/)
- Contact Ticketmaster Developer Support

For issues with the integration:
- Check the console for error messages
- Verify environment variable configuration
- Test API endpoints directly 