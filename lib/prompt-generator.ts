import { EventTypeConfig, getEventTypeConfig } from './event-questions';
import { getHolidayDetailsByName } from './holidays';
import { getActivePrompt } from './system-prompts';

export interface EventDetails {
  [key: string]: string | number;
}

// Full prompt generation function for testing and preview purposes
export async function generateFullPromptWithSystemPrompts(
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
  
  // Add relevant details based on event type (same logic as the enhanced function)
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
        contextParts.push(`${eventDetails.eventType} corporate event`);
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
        contextParts.push(`${eventDetails.formality} dress code`);
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
      
      // Only add context if it's not redundant with holiday details
      if (eventDetails.context && eventDetails.context !== 'Public Holiday') {
        contextParts.push(`${eventDetails.context} context`);
      }
      
      if (eventDetails.venue) {
        contextParts.push(`at ${eventDetails.venue}`);
      }
      if (eventDetails.people) {
        contextParts.push(`${eventDetails.people} people`);
      }
      if (eventDetails.traditions) {
        contextParts.push(`featuring ${eventDetails.traditions}`);
      }
      
      // Only add decorations if they're not redundant with holiday details
      if (eventDetails.decorations) {
        const holidayDetails = getHolidayDetailsByName(eventDetails.holiday as string);
        const isRedundantDecoration = holidayDetails && 
          eventDetails.decorations.toLowerCase().includes(holidayDetails.region[0].toLowerCase()) &&
          eventDetails.decorations.toLowerCase().includes('cultural');
        
        if (!isRedundantDecoration) {
          contextParts.push(`with ${eventDetails.decorations}`);
        }
      }
      break;

    // Add other event types as needed
    default:
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

  // Get the FULL event type prompt from database and add it directly
  let foundEventTypePrompt = false;
  try {
    console.log('FULL PROMPT MODE: Looking up event type:', eventType);
    const eventTypePrompt = await getActivePrompt('event_type', eventType);
    if (eventTypePrompt && eventTypePrompt.content) {
      console.log('FULL PROMPT MODE: Found event type prompt:', eventTypePrompt.content.length, 'chars');
      contextParts.push(eventTypePrompt.content);
      foundEventTypePrompt = true;
    } else {
      console.log('FULL PROMPT MODE: No event type prompt found for:', eventType);
    }
  } catch (error) {
    console.error('Error retrieving event type prompt:', error);
  }

  // Only add fallback context if no database prompt was found
  // This prevents "Wedding flyer theme" from appearing when system prompts are available
  if (!foundEventTypePrompt) {
    console.log('FULL PROMPT MODE: Adding fallback event context since no database prompt found');
    contextParts.unshift(`${eventConfig.name} flyer theme`);
  }

  // Get the FULL style preset prompt from database and add it directly
  if (styleName && styleName !== 'No Style') {
    try {
      console.log('FULL PROMPT MODE: Looking up style preset:', styleName);
      const stylePrompt = await getActivePrompt('style_preset', styleName);
      if (stylePrompt && stylePrompt.content) {
        console.log('FULL PROMPT MODE: Found style preset prompt:', stylePrompt.content.length, 'chars');
        contextParts.push(stylePrompt.content);
      } else {
        console.log('FULL PROMPT MODE: No style preset prompt found for:', styleName);
      }
    } catch (error) {
      console.error('Error retrieving style preset prompt:', error);
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
  const fullPrompt = `${context}, ${basePrompt}`.trim();

  return fullPrompt;
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
      
      // Only add context if it's not redundant with holiday details
      if (eventDetails.context && eventDetails.context !== 'Public Holiday') {
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
      
      // Only add decorations if they're not redundant with holiday details
      if (eventDetails.decorations) {
        const holidayDetails = getHolidayDetailsByName(eventDetails.holiday as string);
        const isRedundantDecoration = holidayDetails && 
          eventDetails.decorations.toLowerCase().includes(holidayDetails.region[0].toLowerCase()) &&
          eventDetails.decorations.toLowerCase().includes('cultural');
        
        if (!isRedundantDecoration) {
          contextParts.push(`decorated with ${eventDetails.decorations}`);
        }
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
        // Extract key style elements from the database prompt
        // Take the main style description (before quality control phrases)
        const styleContent = systemPrompt.content;
        
        // Split by quality control phrases to separate style from quality control
        const qualityControlPhrases = [
          'no text unless otherwise specified',
          'no blur',
          'no distortion', 
          'high quality',
          'no gibberish text',
          'no fake letters',
          'no strange characters',
          'only real readable words if text is included'
        ];
        
        // Find where quality control phrases start
        let styleDescription = styleContent;
        let textQualityControl = '';
        for (const phrase of qualityControlPhrases) {
          const index = styleContent.toLowerCase().indexOf(phrase.toLowerCase());
          if (index !== -1) {
            styleDescription = styleContent.substring(0, index).trim();
            // Extract text-specific quality control phrases
            const remainingText = styleContent.substring(index);
            const textQualityPhrases = [
              'no gibberish text',
              'no fake letters', 
              'no strange characters',
              'only real readable words if text is included'
            ];
            const foundTextPhrases = textQualityPhrases.filter(phrase => 
              remainingText.toLowerCase().includes(phrase.toLowerCase())
            );
            if (foundTextPhrases.length > 0) {
              textQualityControl = foundTextPhrases.join(', ');
            }
            break;
          }
        }
        
        // Clean up the style description (remove trailing commas)
        styleDescription = styleDescription.replace(/,\s*$/, '');
        
        contextParts.push(styleDescription);
        
        // Add text quality control phrases if found
        if (textQualityControl) {
          contextParts.push(textQualityControl);
        }
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
      
      // Only add context if it's not redundant with holiday details
      if (eventDetails.context && eventDetails.context !== 'Public Holiday') {
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
      
      // Only add decorations if they're not redundant with holiday details
      if (eventDetails.decorations) {
        const holidayDetails = getHolidayDetailsByName(eventDetails.holiday as string);
        const isRedundantDecoration = holidayDetails && 
          eventDetails.decorations.toLowerCase().includes(holidayDetails.region[0].toLowerCase()) &&
          eventDetails.decorations.toLowerCase().includes('cultural');
        
        if (!isRedundantDecoration) {
          contextParts.push(`decorated with ${eventDetails.decorations}`);
        }
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

  // Add style context if provided - SIMPLIFIED FOR CONSISTENCY
  if (styleName && styleName !== 'No Style') {
    // Use simplified style name for consistency with async version
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