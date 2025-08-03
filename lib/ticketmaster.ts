// Ticketmaster API Integration
// Documentation: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/

export interface TicketmasterEvent {
  id: string;
  name: string;
  url: string;
  images: Array<{
    ratio: string;
    url: string;
    width: number;
    height: number;
    fallback: boolean;
  }>;
  dates: {
    start: {
      localDate: string;
      localTime: string;
      dateTime: string;
      dateTBD: boolean;
      dateTBA: boolean;
      timeTBA: boolean;
      noSpecificTime: boolean;
    };
    status: {
      code: string;
    };
    spanMultipleDays: boolean;
  };
  priceRanges?: Array<{
    type: string;
    currency: string;
    min: number;
    max: number;
  }>;
  _embedded?: {
    venues?: Array<{
      id: string;
      name: string;
      url: string;
      locale: string;
      postalCode: string;
      timezone: string;
      city: {
        name: string;
      };
      state: {
        name: string;
        stateCode: string;
      };
      country: {
        name: string;
        countryCode: string;
      };
      address: {
        line1: string;
      };
      location: {
        longitude: string;
        latitude: string;
      };
    }>;
    attractions?: Array<{
      id: string;
      name: string;
      url: string;
      images: Array<{
        ratio: string;
        url: string;
        width: number;
        height: number;
        fallback: boolean;
      }>;
    }>;
  };
  classifications: Array<{
    primary: boolean;
    segment: {
      id: string;
      name: string;
    };
    genre: {
      id: string;
      name: string;
    };
    subGenre: {
      id: string;
      name: string;
    };
    family: boolean;
  }>;
  promoter?: {
    id: string;
    name: string;
    description: string;
  };
  info?: string;
  pleaseNote?: string;
  ticketLimit?: {
    info: string;
  };
  accessibility?: {
    info: string;
  };
  ageRestrictions?: {
    legalAgeEnforced: boolean;
  };
  ticketing?: {
    allInclusivePricing: {
      enabled: boolean;
    };
    safeTix?: {
      enabled: boolean;
    };
  };
}

export interface TicketmasterSearchParams {
  keyword?: string;
  city?: string;
  stateCode?: string;
  countryCode?: string;
  postalCode?: string;
  radius?: number;
  unit?: 'miles' | 'km';
  startDateTime?: string;
  endDateTime?: string;
  size?: number;
  page?: number;
  sort?: 'name,asc' | 'name,desc' | 'date,asc' | 'date,desc' | 'relevance,asc' | 'relevance,desc' | 'distance,asc' | 'distance,desc' | 'popularity,asc' | 'popularity,desc';
  classificationName?: string;
  classificationId?: string;
  segmentId?: string;
  genreId?: string;
  subGenreId?: string;
  includeTBA?: 'yes' | 'no' | 'only';
  includeTBD?: 'yes' | 'no' | 'only';
  includeTest?: 'yes' | 'no' | 'only';
  includeSpellcheck?: 'yes' | 'no';
  includeUnavailable?: 'yes' | 'no';
  includeAccessibility?: 'yes' | 'no';
  includeLicensedContent?: 'yes' | 'no';
}

export interface TicketmasterSearchResponse {
  _embedded: {
    events: TicketmasterEvent[];
  };
  _links: {
    self: {
      href: string;
    };
    next?: {
      href: string;
    };
    prev?: {
      href: string;
    };
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export interface TicketmasterVenue {
  id: string;
  name: string;
  url: string;
  locale: string;
  postalCode: string;
  timezone: string;
  city: {
    name: string;
  };
  state: {
    name: string;
    stateCode: string;
  };
  country: {
    name: string;
    countryCode: string;
  };
  address: {
    line1: string;
  };
  location: {
    longitude: string;
    latitude: string;
  };
}

export interface TicketmasterClassification {
  id: string;
  name: string;
  segment: {
    id: string;
    name: string;
  };
  genre: {
    id: string;
    name: string;
  };
  subGenre: {
    id: string;
    name: string;
  };
  family: boolean;
}

class TicketmasterAPI {
  private apiKey: string;
  private baseUrl = 'https://app.ticketmaster.com/discovery/v2';
  private rateLimitDelay = 100; // ms between requests

  constructor() {
    this.apiKey = process.env.TICKETMASTER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Ticketmaster API key not found. Events will not be available.');
    }
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Ticketmaster API key not configured');
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.set('apikey', this.apiKey);
    url.searchParams.set('size', '50'); // Default page size
    url.searchParams.set('includeLicensedContent', 'yes');

    // Add custom parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value.toString());
      }
    });

    try {
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Ticketmaster API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ticketmaster API request failed:', error);
      throw error;
    }
  }

  async searchEvents(params: TicketmasterSearchParams = {}): Promise<TicketmasterSearchResponse> {
    return this.makeRequest('/events.json', params);
  }

  async getEvent(eventId: string): Promise<TicketmasterEvent> {
    const response = await this.makeRequest(`/events/${eventId}.json`);
    return response;
  }

  async searchVenues(params: Record<string, any> = {}): Promise<any> {
    return this.makeRequest('/venues.json', params);
  }

  async getClassifications(): Promise<any> {
    return this.makeRequest('/classifications.json');
  }

  async getSuggestions(keyword: string): Promise<any> {
    return this.makeRequest('/suggest.json', { keyword });
  }

  // Helper method to format event for calendar display
  formatEventForCalendar(event: TicketmasterEvent) {
    const venue = event._embedded?.venues?.[0];
    const startDate = new Date(event.dates.start.dateTime || event.dates.start.localDate);
    
    // Safely handle images array
    const images = event.images || [];
    const image = images.find(img => img.ratio === '16_9' && !img.fallback)?.url || 
                  images.find(img => !img.fallback)?.url || '';
    
    // Safely handle classifications array
    const classifications = event.classifications || [];
    const primaryClassification = classifications.find(c => c.primary);
    const classification = primaryClassification?.segment?.name || 'Event';
    const genre = primaryClassification?.genre?.name || '';
    
    return {
      id: event.id,
      name: event.name,
      date: startDate,
      time: event.dates.start.localTime,
      venue: venue?.name || 'TBA',
      city: venue?.city?.name || '',
      state: venue?.state?.stateCode || '',
      image: image,
      url: event.url,
      priceRange: event.priceRanges?.[0],
      classification: classification,
      genre: genre,
      description: event.info || event.pleaseNote || '',
      status: event.dates.status.code,
      isTBA: event.dates.start.timeTBA,
      isTBD: event.dates.start.dateTBD,
    };
  }

  // Helper method to get events for a specific date range
  async getEventsForDateRange(startDate: Date, endDate: Date, location?: { city?: string; stateCode?: string; countryCode?: string }) {
    // Format dates as YYYY-MM-DD for Ticketmaster API
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    const params: TicketmasterSearchParams = {
      startDateTime: formatDate(startDate) + 'T00:00:00Z',
      endDateTime: formatDate(endDate) + 'T23:59:59Z',
      sort: 'date,asc',
      size: 100,
    };

    if (location) {
      if (location.city) params.city = location.city;
      if (location.stateCode) params.stateCode = location.stateCode;
      if (location.countryCode) params.countryCode = location.countryCode;
    }

    console.log('getEventsForDateRange params:', params);

    const response = await this.searchEvents(params);
    return response._embedded?.events?.map(event => this.formatEventForCalendar(event)) || [];
  }

  // Helper method to get upcoming events for a location
  async getUpcomingEvents(location?: { city?: string; stateCode?: string; countryCode?: string }, days: number = 30) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return this.getEventsForDateRange(startDate, endDate, location);
  }

  // Helper method to search events by keyword
  async searchEventsByKeyword(keyword: string, location?: { city?: string; stateCode?: string; countryCode?: string }) {
    const params: TicketmasterSearchParams = {
      keyword,
      sort: 'relevance,desc',
      size: 50,
    };

    if (location) {
      if (location.city) params.city = location.city;
      if (location.stateCode) params.stateCode = location.stateCode;
      if (location.countryCode) params.countryCode = location.countryCode;
    }

    const response = await this.searchEvents(params);
    return response._embedded?.events?.map(event => this.formatEventForCalendar(event)) || [];
  }
}

// Export singleton instance
export const ticketmasterAPI = new TicketmasterAPI(); 