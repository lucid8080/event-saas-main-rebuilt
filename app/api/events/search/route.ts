import { NextRequest, NextResponse } from 'next/server';
import { ticketmasterAPI, type TicketmasterSearchParams } from '@/lib/ticketmaster';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract search parameters
    const params: TicketmasterSearchParams = {};
    
    // Optional parameters
    if (searchParams.get('keyword')) params.keyword = searchParams.get('keyword')!;
    if (searchParams.get('city')) params.city = searchParams.get('city')!;
    if (searchParams.get('stateCode')) params.stateCode = searchParams.get('stateCode')!;
    if (searchParams.get('countryCode')) params.countryCode = searchParams.get('countryCode')!;
    if (searchParams.get('postalCode')) params.postalCode = searchParams.get('postalCode')!;
    if (searchParams.get('radius')) params.radius = parseInt(searchParams.get('radius')!);
    if (searchParams.get('unit')) params.unit = searchParams.get('unit') as 'miles' | 'km';
    if (searchParams.get('startDateTime')) params.startDateTime = searchParams.get('startDateTime')!;
    if (searchParams.get('endDateTime')) params.endDateTime = searchParams.get('endDateTime')!;
    if (searchParams.get('size')) params.size = parseInt(searchParams.get('size')!);
    if (searchParams.get('page')) params.page = parseInt(searchParams.get('page')!);
    if (searchParams.get('sort')) params.sort = searchParams.get('sort') as any;
    if (searchParams.get('classificationName')) params.classificationName = searchParams.get('classificationName')!;
    if (searchParams.get('classificationId')) params.classificationId = searchParams.get('classificationId')!;
    if (searchParams.get('segmentId')) params.segmentId = searchParams.get('segmentId')!;
    if (searchParams.get('genreId')) params.genreId = searchParams.get('genreId')!;
    if (searchParams.get('subGenreId')) params.subGenreId = searchParams.get('subGenreId')!;
    if (searchParams.get('includeTBA')) params.includeTBA = searchParams.get('includeTBA') as 'yes' | 'no' | 'only';
    if (searchParams.get('includeTBD')) params.includeTBD = searchParams.get('includeTBD') as 'yes' | 'no' | 'only';
    if (searchParams.get('includeTest')) params.includeTest = searchParams.get('includeTest') as 'yes' | 'no' | 'only';
    if (searchParams.get('includeSpellcheck')) params.includeSpellcheck = searchParams.get('includeSpellcheck') as 'yes' | 'no';
    if (searchParams.get('includeUnavailable')) params.includeUnavailable = searchParams.get('includeUnavailable') as 'yes' | 'no';
    if (searchParams.get('includeAccessibility')) params.includeAccessibility = searchParams.get('includeAccessibility') as 'yes' | 'no';
    if (searchParams.get('includeLicensedContent')) params.includeLicensedContent = searchParams.get('includeLicensedContent') as 'yes' | 'no';

    // Search events
    const response = await ticketmasterAPI.searchEvents(params);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Event search error:', error);
    
    if (error instanceof Error && error.message.includes('API key not configured')) {
      return NextResponse.json(
        { error: 'Ticketmaster API not configured' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to search events' },
      { status: 500 }
    );
  }
} 