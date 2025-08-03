/**
 * Utility functions to map Ticketmaster event classifications to Event Generator event types
 */

export interface TicketmasterEventMapping {
  eventType: string;
  eventDetails: Record<string, string>;
  styleSuggestions: string[];
}

/**
 * Maps Ticketmaster event classification to Event Generator event type
 */
export function mapTicketmasterToEventType(classification: string, genre?: string): string {
  const classificationLower = classification.toLowerCase();
  const genreLower = genre?.toLowerCase() || '';

  // Music/Concert events
  if (classificationLower.includes('music') || 
      classificationLower.includes('concert') ||
      classificationLower.includes('festival') ||
      genreLower.includes('rock') ||
      genreLower.includes('pop') ||
      genreLower.includes('jazz') ||
      genreLower.includes('country') ||
      genreLower.includes('hip hop') ||
      genreLower.includes('electronic')) {
    return 'CONCERT';
  }

  // Sports events
  if (classificationLower.includes('sports') ||
      classificationLower.includes('basketball') ||
      classificationLower.includes('football') ||
      classificationLower.includes('baseball') ||
      classificationLower.includes('soccer') ||
      classificationLower.includes('hockey') ||
      classificationLower.includes('tennis') ||
      classificationLower.includes('golf') ||
      classificationLower.includes('racing') ||
      classificationLower.includes('wrestling') ||
      classificationLower.includes('boxing') ||
      classificationLower.includes('mma')) {
    return 'SPORTS_EVENT';
  }

  // Theater/Arts events
  if (classificationLower.includes('theater') ||
      classificationLower.includes('theatre') ||
      classificationLower.includes('play') ||
      classificationLower.includes('musical') ||
      classificationLower.includes('opera') ||
      classificationLower.includes('ballet') ||
      classificationLower.includes('dance') ||
      classificationLower.includes('art') ||
      classificationLower.includes('exhibition')) {
    return 'CORPORATE_EVENT'; // Using corporate event for professional arts
  }

  // Comedy events
  if (classificationLower.includes('comedy') ||
      classificationLower.includes('stand-up') ||
      classificationLower.includes('humor')) {
    return 'NIGHTLIFE'; // Using nightlife for entertainment events
  }

  // Family events
  if (classificationLower.includes('family') ||
      classificationLower.includes('children') ||
      classificationLower.includes('kids') ||
      classificationLower.includes('circus') ||
      classificationLower.includes('magic') ||
      classificationLower.includes('puppet')) {
    return 'FAMILY_GATHERING';
  }

  // Educational/Workshop events
  if (classificationLower.includes('education') ||
      classificationLower.includes('workshop') ||
      classificationLower.includes('seminar') ||
      classificationLower.includes('conference') ||
      classificationLower.includes('lecture') ||
      classificationLower.includes('training')) {
    return 'WORKSHOP';
  }

  // Community events
  if (classificationLower.includes('community') ||
      classificationLower.includes('charity') ||
      classificationLower.includes('fundraiser') ||
      classificationLower.includes('fair') ||
      classificationLower.includes('festival') ||
      classificationLower.includes('parade')) {
    return 'COMMUNITY_EVENT';
  }

  // Nightlife/Club events
  if (classificationLower.includes('nightlife') ||
      classificationLower.includes('club') ||
      classificationLower.includes('party') ||
      classificationLower.includes('dance') ||
      classificationLower.includes('dj')) {
    return 'NIGHTLIFE';
  }

  // Default fallback
  return 'CONCERT';
}

/**
 * Generates event details based on Ticketmaster event data
 */
export function generateEventDetails(
  eventName: string,
  venue: string,
  city: string,
  state: string,
  description: string,
  classification: string,
  genre?: string,
  priceRange?: { min: number; max: number; currency: string }
): Record<string, string> {
  const eventType = mapTicketmasterToEventType(classification, genre);
  
  const baseDetails: Record<string, string> = {
    eventName: eventName,
    venue: venue,
    location: `${city}, ${state}`,
    description: description || `${eventName} at ${venue}`,
  };

  // Add event type specific details
  switch (eventType) {
    case 'CONCERT':
      baseDetails.genre = genre || 'Music';
      baseDetails.atmosphere = 'Energetic and exciting';
      baseDetails.activities = 'Live music performance';
      break;
    
    case 'SPORTS_EVENT':
      baseDetails.sport = classification.replace('Sports', '').trim();
      baseDetails.atmosphere = 'Competitive and thrilling';
      baseDetails.activities = 'Sports competition';
      break;
    
    case 'CORPORATE_EVENT':
      baseDetails.eventType = 'Professional';
      baseDetails.atmosphere = 'Elegant and sophisticated';
      baseDetails.activities = 'Arts and entertainment';
      break;
    
    case 'NIGHTLIFE':
      baseDetails.eventType = 'Entertainment';
      baseDetails.atmosphere = 'Vibrant and social';
      baseDetails.activities = 'Entertainment and socializing';
      break;
    
    case 'FAMILY_GATHERING':
      baseDetails.eventType = 'Family-friendly';
      baseDetails.atmosphere = 'Fun and welcoming';
      baseDetails.activities = 'Family entertainment';
      break;
    
    case 'WORKSHOP':
      baseDetails.eventType = 'Educational';
      baseDetails.atmosphere = 'Learning-focused';
      baseDetails.activities = 'Workshop and learning';
      break;
    
    case 'COMMUNITY_EVENT':
      baseDetails.eventType = 'Community';
      baseDetails.atmosphere = 'Welcoming and inclusive';
      baseDetails.activities = 'Community activities';
      break;
  }

  // Add pricing information if available
  if (priceRange) {
    baseDetails.pricing = `${priceRange.currency}${priceRange.min} - ${priceRange.currency}${priceRange.max}`;
  }

  return baseDetails;
}

/**
 * Generates style suggestions based on event type
 */
export function generateStyleSuggestions(eventType: string): string[] {
  switch (eventType) {
    case 'CONCERT':
      return [
        'Dynamic and energetic design',
        'Bold typography with music elements',
        'Vibrant colors and dramatic lighting',
        'Stage and performance imagery'
      ];
    
    case 'SPORTS_EVENT':
      return [
        'Action-oriented design',
        'Dynamic sports imagery',
        'Team colors and competitive elements',
        'Athletic and energetic styling'
      ];
    
    case 'CORPORATE_EVENT':
      return [
        'Professional and elegant design',
        'Sophisticated typography',
        'Refined color palette',
        'Classic and timeless styling'
      ];
    
    case 'NIGHTLIFE':
      return [
        'Vibrant and contemporary design',
        'Modern typography with urban elements',
        'Bold colors and dynamic layouts',
        'Nightlife and entertainment imagery'
      ];
    
    case 'FAMILY_GATHERING':
      return [
        'Fun and welcoming design',
        'Playful typography and colors',
        'Family-friendly imagery',
        'Warm and inviting styling'
      ];
    
    case 'WORKSHOP':
      return [
        'Professional and educational design',
        'Clean and organized layout',
        'Informative typography',
        'Learning-focused imagery'
      ];
    
    case 'COMMUNITY_EVENT':
      return [
        'Welcoming and inclusive design',
        'Community-focused imagery',
        'Accessible and friendly styling',
        'Local and cultural elements'
      ];
    
    case 'BREAKDANCING':
      return [
        'Dynamic and energetic design',
        'Urban street culture elements',
        'Bold typography with dance imagery',
        'Vibrant colors and movement-focused styling'
      ];
    
    case 'POTTERY':
      return [
        'Artistic and creative design',
        'Handcrafted and organic elements',
        'Earthy color palette',
        'Studio and craft-focused imagery'
      ];
    
    default:
      return [
        'Professional event design',
        'Clean and modern layout',
        'Appropriate typography',
        'Event-specific imagery'
      ];
  }
}

/**
 * Complete mapping function that returns all necessary data for Event Generator
 */
export function mapTicketmasterEvent(
  eventName: string,
  venue: string,
  city: string,
  state: string,
  description: string,
  classification: string,
  genre?: string,
  priceRange?: { min: number; max: number; currency: string }
): TicketmasterEventMapping {
  const eventType = mapTicketmasterToEventType(classification, genre);
  const eventDetails = generateEventDetails(
    eventName,
    venue,
    city,
    state,
    description,
    classification,
    genre,
    priceRange
  );
  const styleSuggestions = generateStyleSuggestions(eventType);

  return {
    eventType,
    eventDetails,
    styleSuggestions
  };
} 