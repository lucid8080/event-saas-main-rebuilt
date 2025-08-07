import { EventTypeConfig, getEventTypeConfig } from './event-questions';
import { getHolidayDetailsByName } from './holidays';
import { getActivePrompt } from './system-prompts';

export interface EventDetails {
  [key: string]: string | number;
}

// New async function that uses database system prompts
export async function generateEnhancedPromptWithSystemPrompts(
  basePrompt: string,
  eventType: string,
  eventDetails: EventDetails,
  styleName?: string,
  customStyle?: string
): Promise<string> {
  const eventConfig = getEventTypeConfig(eventType);
  if (!eventConfig) {
    return basePrompt;
  }

  // Build context from event details
  const contextParts: string[] = [];
  
  // Add event type context
  contextParts.push(`${eventConfig.name} flyer theme`);
  
  // Add relevant details based on event type
  switch (eventType) {
    case 'BIRTHDAY_PARTY':
      if (eventDetails.age) {
        contextParts.push(`${eventDetails.age}th birthday celebration`);
      }
      if (eventDetails.theme) {
        contextParts.push(`${eventDetails.theme} theme`);
      }
      if (eventDetails.venue) {
        contextParts.push(`at ${eventDetails.venue}`);
      }
      if (eventDetails.guests) {
        contextParts.push(`${eventDetails.guests} guests`);
      }
      if (eventDetails.activities) {
        contextParts.push(`featuring ${eventDetails.activities}`);
      }
      if (eventDetails.decorations) {
        contextParts.push(`with ${eventDetails.decorations}`);
      }
      break;

    case 'WEDDING':
      if (eventDetails.style) {
        contextParts.push(`${eventDetails.style} style wedding`);
      }
      if (eventDetails.colors) {
        contextParts.push(`${eventDetails.colors} color scheme`);
      }
      if (eventDetails.venue) {
        contextParts.push(`at ${eventDetails.venue}`);
      }
      if (eventDetails.season) {
        contextParts.push(`${eventDetails.season} season`);
      }
      if (eventDetails.guests) {
        contextParts.push(`${eventDetails.guests} guests`);
      }
      if (eventDetails.elements) {
        contextParts.push(`with ${eventDetails.elements}`);
      }
      break;

    case 'CORPORATE_EVENT':
      if (eventDetails.eventType) {
        contextParts.push(`${eventDetails.eventType}`);
      }
      if (eventDetails.industry) {
        contextParts.push(`${eventDetails.industry} industry`);
      }
      if (eventDetails.attendees) {
        contextParts.push(`${eventDetails.attendees} attendees`);
      }
      if (eventDetails.venue) {
        contextParts.push(`at ${eventDetails.venue}`);
      }
      if (eventDetails.formality) {
        contextParts.push(`${eventDetails.formality} atmosphere`);
      }
      if (eventDetails.branding) {
        contextParts.push(`${eventDetails.branding} branding`);
      }
      break;

    case 'HOLIDAY_CELEBRATION':
      if (eventDetails.holiday) {
        const holidayDetails = getHolidayDetailsByName(eventDetails.holiday as string);
        if (holidayDetails) {
          // Add rich holiday context
          contextParts.push(`${holidayDetails.name} celebration`);
          contextParts.push(`${holidayDetails.type.toLowerCase()} holiday`);
          if (holidayDetails.description) {
            contextParts.push(`${holidayDetails.description.toLowerCase()}`);
          }
          if (holidayDetails.region.length > 0) {
            contextParts.push(`${holidayDetails.region.join(', ')} cultural context`);
          }
        } else {
          contextParts.push(`${eventDetails.holiday} celebration`);
        }
      }
      if (eventDetails.context) {
        contextParts.push(`${eventDetails.context} context`);
      }
      if (eventDetails.venue) {
        contextParts.push(`at ${eventDetails.venue}`);
      }
      if (eventDetails.people) {
        contextParts.push(`${eventDetails.people} gathering`);
      }
      if (eventDetails.traditions) {
        contextParts.push(`with ${eventDetails.traditions}`);
      }
      if (eventDetails.decorations) {
        contextParts.push(`decorated with ${eventDetails.decorations}`);
      }
      break;

    case 'CONCERT':
      if (eventDetails.genre) {
        contextParts.push(`${eventDetails.genre} concert`);
      }
      if (eventDetails.venue) {
        contextParts.push(`at ${eventDetails.venue}`);
      }
      if (eventDetails.crowd) {
        contextParts.push(`${eventDetails.crowd} crowd`);
      }
      if (eventDetails.lighting) {
        contextParts.push(`${eventDetails.lighting} lighting`);
      }
      if (eventDetails.performance) {
        contextParts.push(`${eventDetails.performance} performance`);
      }
      if (eventDetails.atmosphere) {
        contextParts.push(`with ${eventDetails.atmosphere}`);
      }
      break;

    case 'SPORTS_EVENT':
      if (eventDetails.sport) {
        contextParts.push(`${eventDetails.sport} event`);
      }
      if (eventDetails.venue) {
        contextParts.push(`at ${eventDetails.venue}`);
      }
      if (eventDetails.colors) {
        contextParts.push(`${eventDetails.colors} colors`);
      }
      if (eventDetails.crowd) {
        contextParts.push(`${eventDetails.crowd} spectators`);
      }
      if (eventDetails.eventType) {
        contextParts.push(`${eventDetails.eventType}`);
      }
      if (eventDetails.weather) {
        contextParts.push(`${eventDetails.weather} weather`);
      }
      break;

    case 'NIGHTLIFE':
      if (eventDetails.venue) {
        contextParts.push(`${eventDetails.venue} venue`);
      }
      if (eventDetails.music) {
        contextParts.push(`${eventDetails.music} music`);
      }
      if (eventDetails.crowd) {
        contextParts.push(`${eventDetails.crowd} crowd`);
      }
      if (eventDetails.lighting) {
        contextParts.push(`${eventDetails.lighting} lighting`);
      }
      if (eventDetails.features) {
        contextParts.push(`with ${eventDetails.features}`);
      }
      if (eventDetails.dresscode) {
        contextParts.push(`${eventDetails.dresscode} dress code`);
      }
      break;

    case 'FAMILY_GATHERING':
    case 'BBQ':
    case 'PARK_GATHERING':
    case 'COMMUNITY_EVENT':
    case 'FUNDRAISER':
    case 'WORKSHOP':
    case 'MEETUP':
    case 'CELEBRATION':
    case 'REUNION':
    case 'POTLUCK':
    case 'GAME_NIGHT':
    case 'BOOK_CLUB':
    case 'ART_CLASS':
    case 'FITNESS_CLASS':
      if (eventDetails.venue) {
        contextParts.push(`at ${eventDetails.venue}`);
      }
      if (eventDetails.atmosphere) {
        contextParts.push(`${eventDetails.atmosphere} atmosphere`);
      }
      if (eventDetails.activities) {
        contextParts.push(`featuring ${eventDetails.activities}`);
      }
      if (eventDetails.decorations) {
        contextParts.push(`with ${eventDetails.decorations}`);
      }
      break;
  }

  // Add style context if provided - NOW USING DATABASE PROMPTS
  if (styleName && styleName !== 'No Style') {
    try {
      // Try to get the system prompt from database
      const systemPrompt = await getActivePrompt('style_preset', styleName);
      
      if (systemPrompt && systemPrompt.content) {
        // Use the database prompt content
        contextParts.push(systemPrompt.content);
      } else {
        // Fallback to the original logic if no database prompt found
        if (styleName.length > 20) {
          contextParts.push(styleName);
        } else {
          contextParts.push(`${styleName} style`);
        }
      }
    } catch (error) {
      console.error('Error retrieving system prompt:', error);
      // Fallback to the original logic if database call fails
      if (styleName.length > 20) {
        contextParts.push(styleName);
      } else {
        contextParts.push(`${styleName} style`);
      }
    }
  }
  
  // Add custom text if provided
  if (eventDetails.customText && eventDetails.customText.toString().trim() !== '') {
    contextParts.push(`with text: "${eventDetails.customText.toString().trim()}"`);
  }
  
  // Add additional custom details if provided
  if (customStyle && customStyle.trim() !== '') {
    contextParts.push(`${customStyle.trim()}`);
  }

  // Combine context with base prompt
  const context = contextParts.join(', ');
  const enhancedPrompt = `${context}, ${basePrompt}`.trim();

  return enhancedPrompt;
}

// Original synchronous function for backward compatibility
export function generateEnhancedPrompt(
  basePrompt: string,
  eventType: string,
  eventDetails: EventDetails,
  styleName?: string,
  customStyle?: string
): string {
  const eventConfig = getEventTypeConfig(eventType);
  if (!eventConfig) {
    return basePrompt;
  }

  // Build context from event details
  const contextParts: string[] = [];
  
  // Add event type context
  contextParts.push(`${eventConfig.name} flyer theme`);
  
  // Add relevant details based on event type
  switch (eventType) {
    case 'BIRTHDAY_PARTY':
      if (eventDetails.age) {
        contextParts.push(`${eventDetails.age}th birthday celebration`);
      }
      if (eventDetails.theme) {
        contextParts.push(`${eventDetails.theme} theme`);
      }
      if (eventDetails.venue) {
        contextParts.push(`at ${eventDetails.venue}`);
      }
      if (eventDetails.guests) {
        contextParts.push(`${eventDetails.guests} guests`);
      }
      if (eventDetails.activities) {
        contextParts.push(`featuring ${eventDetails.activities}`);
      }
      if (eventDetails.decorations) {
        contextParts.push(`with ${eventDetails.decorations}`);
      }
      break;

    case 'WEDDING':
      if (eventDetails.style) {
        contextParts.push(`${eventDetails.style} style wedding`);
      }
      if (eventDetails.colors) {
        contextParts.push(`${eventDetails.colors} color scheme`);
      }
      if (eventDetails.venue) {
        contextParts.push(`at ${eventDetails.venue}`);
      }
      if (eventDetails.season) {
        contextParts.push(`${eventDetails.season} season`);
      }
      if (eventDetails.guests) {
        contextParts.push(`${eventDetails.guests} guests`);
      }
      if (eventDetails.elements) {
        contextParts.push(`with ${eventDetails.elements}`);
      }
      break;

    case 'CORPORATE_EVENT':
      if (eventDetails.eventType) {
        contextParts.push(`${eventDetails.eventType}`);
      }
      if (eventDetails.industry) {
        contextParts.push(`${eventDetails.industry} industry`);
      }
      if (eventDetails.attendees) {
        contextParts.push(`${eventDetails.attendees} attendees`);
      }
      if (eventDetails.venue) {
        contextParts.push(`at ${eventDetails.venue}`);
      }
      if (eventDetails.formality) {
        contextParts.push(`${eventDetails.formality} atmosphere`);
      }
      if (eventDetails.branding) {
        contextParts.push(`${eventDetails.branding} branding`);
      }
      break;

    case 'HOLIDAY_CELEBRATION':
      if (eventDetails.holiday) {
        const holidayDetails = getHolidayDetailsByName(eventDetails.holiday as string);
        if (holidayDetails) {
          // Add rich holiday context
          contextParts.push(`${holidayDetails.name} celebration`);
          contextParts.push(`${holidayDetails.type.toLowerCase()} holiday`);
          if (holidayDetails.description) {
            contextParts.push(`${holidayDetails.description.toLowerCase()}`);
          }
          if (holidayDetails.region.length > 0) {
            contextParts.push(`${holidayDetails.region.join(', ')} cultural context`);
          }
        } else {
          contextParts.push(`${eventDetails.holiday} celebration`);
        }
      }
      if (eventDetails.context) {
        contextParts.push(`${eventDetails.context} context`);
      }
      if (eventDetails.venue) {
        contextParts.push(`at ${eventDetails.venue}`);
      }
      if (eventDetails.people) {
        contextParts.push(`${eventDetails.people} gathering`);
      }
      if (eventDetails.traditions) {
        contextParts.push(`with ${eventDetails.traditions}`);
      }
      if (eventDetails.decorations) {
        contextParts.push(`decorated with ${eventDetails.decorations}`);
      }
      break;

    case 'CONCERT':
      if (eventDetails.genre) {
        contextParts.push(`${eventDetails.genre} concert`);
      }
      if (eventDetails.venue) {
        contextParts.push(`at ${eventDetails.venue}`);
      }
      if (eventDetails.crowd) {
        contextParts.push(`${eventDetails.crowd} crowd`);
      }
      if (eventDetails.lighting) {
        contextParts.push(`${eventDetails.lighting} lighting`);
      }
      if (eventDetails.performance) {
        contextParts.push(`${eventDetails.performance} performance`);
      }
      if (eventDetails.atmosphere) {
        contextParts.push(`with ${eventDetails.atmosphere}`);
      }
      break;

    case 'SPORTS_EVENT':
      if (eventDetails.sport) {
        contextParts.push(`${eventDetails.sport} event`);
      }
      if (eventDetails.venue) {
        contextParts.push(`at ${eventDetails.venue}`);
      }
      if (eventDetails.colors) {
        contextParts.push(`${eventDetails.colors} colors`);
      }
      if (eventDetails.crowd) {
        contextParts.push(`${eventDetails.crowd} spectators`);
      }
      if (eventDetails.eventType) {
        contextParts.push(`${eventDetails.eventType}`);
      }
      if (eventDetails.weather) {
        contextParts.push(`${eventDetails.weather} weather`);
      }
      break;

    case 'NIGHTLIFE':
      if (eventDetails.venue) {
        contextParts.push(`${eventDetails.venue} venue`);
      }
      if (eventDetails.music) {
        contextParts.push(`${eventDetails.music} music`);
      }
      if (eventDetails.crowd) {
        contextParts.push(`${eventDetails.crowd} crowd`);
      }
      if (eventDetails.lighting) {
        contextParts.push(`${eventDetails.lighting} lighting`);
      }
      if (eventDetails.features) {
        contextParts.push(`with ${eventDetails.features}`);
      }
      if (eventDetails.dresscode) {
        contextParts.push(`${eventDetails.dresscode} dress code`);
      }
      break;

    case 'FAMILY_GATHERING':
    case 'BBQ':
    case 'PARK_GATHERING':
    case 'COMMUNITY_EVENT':
    case 'FUNDRAISER':
    case 'WORKSHOP':
    case 'MEETUP':
    case 'CELEBRATION':
    case 'REUNION':
    case 'POTLUCK':
    case 'GAME_NIGHT':
    case 'BOOK_CLUB':
    case 'ART_CLASS':
    case 'FITNESS_CLASS':
      if (eventDetails.venue) {
        contextParts.push(`at ${eventDetails.venue}`);
      }
      if (eventDetails.atmosphere) {
        contextParts.push(`${eventDetails.atmosphere} atmosphere`);
      }
      if (eventDetails.activities) {
        contextParts.push(`featuring ${eventDetails.activities}`);
      }
      if (eventDetails.decorations) {
        contextParts.push(`with ${eventDetails.decorations}`);
      }
      break;
  }

  // Add style context if provided
  if (styleName && styleName !== 'No Style') {
    // If the styleName is a detailed description (longer than typical style names), add it directly
    // Otherwise, add "style" suffix for backward compatibility
    if (styleName.length > 20) {
      contextParts.push(styleName);
    } else {
      contextParts.push(`${styleName} style`);
    }
  }
  
  // Add custom text if provided
  if (eventDetails.customText && eventDetails.customText.toString().trim() !== '') {
    contextParts.push(`with text: "${eventDetails.customText.toString().trim()}"`);
  }
  
  // Add additional custom details if provided
  if (customStyle && customStyle.trim() !== '') {
    contextParts.push(`${customStyle.trim()}`);
  }

  // Combine context with base prompt
  const context = contextParts.join(', ');
  const enhancedPrompt = `${context}, ${basePrompt}`.trim();

  return enhancedPrompt;
}

export function validateEventDetails(
  eventType: string,
  eventDetails: EventDetails
): { isValid: boolean; missingFields: string[] } {
  const eventConfig = getEventTypeConfig(eventType);
  if (!eventConfig) {
    return { isValid: false, missingFields: [] };
  }

  const missingFields: string[] = [];
  
  eventConfig.questions.forEach(question => {
    if (question.required && (!eventDetails[question.id] || eventDetails[question.id] === '')) {
      missingFields.push(question.label);
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

export function getPromptPreview(
  basePrompt: string,
  eventType: string,
  eventDetails: EventDetails,
  styleName?: string,
  customStyle?: string
): string {
  return generateEnhancedPrompt(basePrompt, eventType, eventDetails, styleName, customStyle);
} 