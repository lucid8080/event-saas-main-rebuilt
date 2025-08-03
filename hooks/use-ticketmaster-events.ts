import { useState, useEffect, useCallback } from 'react';
import { ticketmasterAPI, type TicketmasterSearchParams } from '@/lib/ticketmaster';

export interface CalendarEvent {
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

export interface EventSearchParams {
  keyword?: string;
  city?: string;
  stateCode?: string;
  countryCode?: string;
  startDate?: Date;
  endDate?: Date;
  days?: number;
}

export interface UseEventsReturn {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  searchEvents: (params: EventSearchParams) => Promise<void>;
  getEventsForDateRange: (startDate: Date, endDate: Date, location?: { city?: string; stateCode?: string; countryCode?: string }) => Promise<void>;
  getUpcomingEvents: (location?: { city?: string; stateCode?: string; countryCode?: string }, days?: number) => Promise<void>;
  clearEvents: () => void;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export function useTicketmasterEvents(): UseEventsReturn {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastSearchParams, setLastSearchParams] = useState<TicketmasterSearchParams | null>(null);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setError(null);
    setHasMore(false);
    setCurrentPage(1);
    setLastSearchParams(null);
  }, []);

  const searchEvents = useCallback(async (params: EventSearchParams) => {
    console.log('Checking API key:', {
      hasKey: !!process.env.NEXT_PUBLIC_TICKETMASTER_API_KEY,
      keyLength: process.env.NEXT_PUBLIC_TICKETMASTER_API_KEY?.length,
      keyPrefix: process.env.NEXT_PUBLIC_TICKETMASTER_API_KEY?.substring(0, 8),
    });
    
    if (!process.env.NEXT_PUBLIC_TICKETMASTER_API_KEY) {
      setError('Ticketmaster API not configured');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchParams: TicketmasterSearchParams = {
        size: 50,
        page: 1,
      };

      if (params.keyword) searchParams.keyword = params.keyword;
      if (params.city) searchParams.city = params.city;
      if (params.stateCode) searchParams.stateCode = params.stateCode;
      if (params.countryCode) searchParams.countryCode = params.countryCode;
      if (params.startDate) searchParams.startDateTime = params.startDate.toISOString();
      if (params.endDate) searchParams.endDateTime = params.endDate.toISOString();

      const response = await ticketmasterAPI.searchEvents(searchParams);
      const formattedEvents = response._embedded?.events?.map(event => 
        ticketmasterAPI.formatEventForCalendar(event)
      ) || [];

      setEvents(formattedEvents);
      setHasMore(response.page.number < response.page.totalPages);
      setCurrentPage(1);
      setLastSearchParams(searchParams);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getEventsForDateRange = useCallback(async (
    startDate: Date, 
    endDate: Date, 
    location?: { city?: string; stateCode?: string; countryCode?: string }
  ) => {
    console.log('getEventsForDateRange called with:', {
      startDate,
      endDate,
      location,
    });
    
    setLoading(true);
    setError(null);

    try {
      console.log('Calling API endpoint for date range...');
      
      const params = new URLSearchParams();
      params.set('startDate', startDate.toISOString());
      params.set('endDate', endDate.toISOString());
      
      if (location?.city) params.set('city', location.city);
      if (location?.stateCode) params.set('stateCode', location.stateCode);
      if (location?.countryCode) params.set('countryCode', location.countryCode);

      const response = await fetch(`/api/events/date-range?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received events from API:', {
        count: data.events?.length || 0,
        sample: data.events?.slice(0, 3),
      });
      
      setEvents(data.events || []);
      setHasMore(false);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error in getEventsForDateRange:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events for date range');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUpcomingEvents = useCallback(async (
    location?: { city?: string; stateCode?: string; countryCode?: string }, 
    days: number = 30
  ) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Calling API endpoint for upcoming events...');
      
      const params = new URLSearchParams();
      params.set('days', days.toString());
      
      if (location?.city) params.set('city', location.city);
      if (location?.stateCode) params.set('stateCode', location.stateCode);
      if (location?.countryCode) params.set('countryCode', location.countryCode);

      const response = await fetch(`/api/events/upcoming?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received upcoming events from API:', {
        count: data.events?.length || 0,
        sample: data.events?.slice(0, 3),
      });
      
      setEvents(data.events || []);
      setHasMore(false);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error in getUpcomingEvents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch upcoming events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || !lastSearchParams || loading) return;

    setLoading(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;
      const searchParams = { ...lastSearchParams, page: nextPage };
      
      const response = await ticketmasterAPI.searchEvents(searchParams);
      const newEvents = response._embedded?.events?.map(event => 
        ticketmasterAPI.formatEventForCalendar(event)
      ) || [];

      setEvents(prev => [...prev, ...newEvents]);
      setHasMore(response.page.number < response.page.totalPages);
      setCurrentPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more events');
    } finally {
      setLoading(false);
    }
  }, [hasMore, lastSearchParams, loading, currentPage]);

  // Cache events by date range
  const [eventCache, setEventCache] = useState<Map<string, CalendarEvent[]>>(new Map());

  const getCachedEvents = useCallback((startDate: Date, endDate: Date, location?: { city?: string; stateCode?: string; countryCode?: string }) => {
    const cacheKey = `${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}-${location?.city || ''}-${location?.stateCode || ''}`;
    return eventCache.get(cacheKey);
  }, [eventCache]);

  const setCachedEvents = useCallback((startDate: Date, endDate: Date, location: { city?: string; stateCode?: string; countryCode?: string } | undefined, events: CalendarEvent[]) => {
    const cacheKey = `${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}-${location?.city || ''}-${location?.stateCode || ''}`;
    setEventCache(prev => new Map(prev).set(cacheKey, events));
  }, []);

  return {
    events,
    loading,
    error,
    searchEvents,
    getEventsForDateRange,
    getUpcomingEvents,
    clearEvents,
    hasMore,
    loadMore,
  };
} 