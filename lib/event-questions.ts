import { getHolidayOptionsForEventGenerator } from './holidays';

export interface EventQuestion {
  id: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: string[];
  description?: string;
}

export interface EventTypeConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  questions: EventQuestion[];
}

export const eventTypeConfigs: EventTypeConfig[] = [
  {
    id: 'BIRTHDAY_PARTY',
    name: 'Birthday Party',
    icon: '🎉',
    description: 'Birthday Party flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'age',
        label: 'Age of birthday person',
        type: 'number',
        required: true,
        placeholder: 'e.g., 25',
        description: 'This helps determine the appropriate style and theme'
      },
      {
        id: 'theme',
        label: 'Theme or color scheme',
        type: 'text',
        required: false,
        placeholder: 'e.g., superhero, princess, sports, rainbow',
        description: 'Any specific theme or color preferences?'
      },
      {
        id: 'activities',
        label: 'Activities planned',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., games, entertainment, dancing, karaoke',
        description: 'What activities will be happening at the party?'
      },
      {
        id: 'decorations',
        label: 'Special decorations or elements',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., balloons, streamers, cake, presents, piñata',
        description: 'Any specific decorations or elements you want to see?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Join us for a celebration!", "RSVP by [date]", "Free admission"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'WEDDING',
    name: 'Wedding',
    icon: '💒',
    description: 'Wedding flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'style',
        label: 'Wedding style',
        type: 'select',
        required: true,
        options: ['Traditional', 'Modern', 'Rustic', 'Elegant', 'Bohemian', 'Vintage', 'Minimalist'],
        description: 'What style best describes your wedding?'
      },
      {
        id: 'colors',
        label: 'Color scheme',
        type: 'text',
        required: false,
        placeholder: 'e.g., white and gold, blush and navy, sage green',
        description: 'What colors will be used in your wedding?'
      },
      {
        id: 'season',
        label: 'Season or time of year',
        type: 'select',
        required: false,
        options: ['Spring', 'Summer', 'Fall', 'Winter'],
        description: 'When will the wedding take place?'
      },
      {
        id: 'elements',
        label: 'Special elements',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., flowers, lighting, arches, candles, lanterns',
        description: 'Any special decorative elements or features?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Join us for our special day", "RSVP by [date]", "Ceremony at 2 PM"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'CORPORATE_EVENT',
    name: 'Corporate Event',
    icon: '🏢',
    description: 'Corporate Event flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'eventType',
        label: 'Event type',
        type: 'select',
        required: true,
        options: ['Conference', 'Meeting', 'Celebration', 'Training', 'Product Launch', 'Networking', 'Award Ceremony'],
        description: 'What type of corporate event is this?'
      },
      {
        id: 'industry',
        label: 'Industry or business type',
        type: 'text',
        required: false,
        placeholder: 'e.g., technology, healthcare, finance, education',
        description: 'What industry does your business operate in?'
      },
      {
        id: 'formality',
        label: 'Formality level',
        type: 'select',
        required: false,
        options: ['Very Formal', 'Formal', 'Semi-Formal', 'Casual', 'Very Casual'],
        description: 'How formal should the event appear?'
      },
      {
        id: 'branding',
        label: 'Brand colors or themes',
        type: 'text',
        required: false,
        placeholder: 'e.g., blue and white, company logo colors',
        description: 'Any specific brand colors or themes to include?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Join us for an exciting event", "Register now", "Free admission"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'HOLIDAY_CELEBRATION',
    name: 'Holiday Celebration',
    icon: '🎄',
    description: 'Holiday Celebration flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'holiday',
        label: 'Specific holiday',
        type: 'select',
        required: true,
        options: getHolidayOptionsForEventGenerator(),
        description: 'Which holiday are you celebrating?'
      },
      {
        id: 'context',
        label: 'Cultural or religious context',
        type: 'text',
        required: false,
        placeholder: 'e.g., Christian, Jewish, secular, family tradition',
        description: 'Any specific cultural or religious context?'
      },
      {
        id: 'venue',
        label: 'Venue type',
        type: 'select',
        required: false,
        options: ['Home', 'Community Center', 'Church', 'Park', 'Restaurant', 'Outdoor', 'Other'],
        description: 'Where will the celebration take place?'
      },
      {
        id: 'traditions',
        label: 'Traditional elements to include',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., tree, lights, gifts, food, decorations',
        description: 'What traditional elements should be featured?'
      },
      {
        id: 'decorations',
        label: 'Seasonal decorations',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., ornaments, wreaths, candles, seasonal flowers',
        description: 'Any specific seasonal decorations?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Join our holiday celebration", "Family welcome", "Potluck dinner"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'CONCERT',
    name: 'Concert',
    icon: '🎵',
    description: 'Concert flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'genre',
        label: 'Music genre',
        type: 'select',
        required: true,
        options: ['Rock', 'Pop', 'Hip Hop', 'Country', 'Jazz', 'Classical', 'Electronic', 'Folk', 'R&B', 'Metal', 'Other'],
        description: 'What type of music will be performed?'
      },
      {
        id: 'lighting',
        label: 'Lighting style',
        type: 'select',
        required: false,
        options: ['Stage Lights', 'Neon', 'Laser Show', 'Natural', 'Mood Lighting', 'Spotlights', 'Other'],
        description: 'What type of lighting will be used?'
      },
      {
        id: 'performance',
        label: 'Performance type',
        type: 'select',
        required: false,
        options: ['Band', 'Solo Artist', 'Orchestra', 'Choir', 'DJ', 'Acoustic', 'Other'],
        description: 'What type of performance will it be?'
      },
      {
        id: 'atmosphere',
        label: 'Special effects or atmosphere',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., smoke, pyrotechnics, video screens, special effects',
        description: 'Any special effects or atmospheric elements?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Live music tonight", "Doors open at 8 PM", "Tickets available"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'SPORTS_EVENT',
    name: 'Sports Event',
    icon: '⚽',
    description: 'Sports Event flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'sport',
        label: 'Sport type',
        type: 'select',
        required: true,
        options: ['Football', 'Basketball', 'Baseball', 'Soccer', 'Tennis', 'Golf', 'Hockey', 'Volleyball', 'Track & Field', 'Swimming', 'Other'],
        description: 'What sport will be featured?'
      },
      {
        id: 'colors',
        label: 'Team colors or branding',
        type: 'text',
        required: false,
        placeholder: 'e.g., red and white, blue and gold, team logo colors',
        description: 'What colors represent the teams or event?'
      },
      {
        id: 'eventType',
        label: 'Event type',
        type: 'select',
        required: false,
        options: ['Game', 'Tournament', 'Championship', 'Exhibition', 'Celebration', 'Training', 'Other'],
        description: 'What type of sports event is this?'
      },
      {
        id: 'weather',
        label: 'Weather conditions (if outdoor)',
        type: 'select',
        required: false,
        options: ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Evening/Night', 'Not Applicable'],
        description: 'What weather conditions are expected?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Championship game", "Free admission", "Bring your team spirit"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'NIGHTLIFE',
    name: 'Nightlife',
    icon: '🌙',
    description: 'Nightlife/club event flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'music',
        label: 'Music genre or atmosphere',
        type: 'select',
        required: false,
        options: ['Electronic', 'Hip Hop', 'Pop', 'Rock', 'Jazz', 'Latin', 'House', 'Techno', 'Mixed', 'Other'],
        description: 'What type of music or atmosphere?'
      },
      {
        id: 'lighting',
        label: 'Lighting style',
        type: 'select',
        required: false,
        options: ['Neon', 'LED', 'Black Light', 'Strobe', 'Mood Lighting', 'Laser Show', 'Natural', 'Other'],
        description: 'What type of lighting will be used?'
      },
      {
        id: 'features',
        label: 'Special features',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., dance floor, VIP areas, outdoor space, live DJ',
        description: 'Any special features or areas?'
      },
      {
        id: 'dresscode',
        label: 'Dress code or theme',
        type: 'text',
        required: false,
        placeholder: 'e.g., casual, dressy, themed party, costume',
        description: 'What is the dress code or theme?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Party all night", "VIP access", "21+ only"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'FAMILY_GATHERING',
    name: 'Family Gathering',
    icon: '👨‍👩‍👧‍👦',
    description: 'Family Gathering flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'venue',
        label: 'Venue or location',
        type: 'text',
        required: false,
        placeholder: 'e.g., home, park, community center, restaurant',
        description: 'Where will the gathering take place?'
      },
      {
        id: 'atmosphere',
        label: 'Atmosphere or mood',
        type: 'select',
        required: false,
        options: ['Casual', 'Formal', 'Fun', 'Relaxed', 'Intimate', 'Celebratory', 'Other'],
        description: 'What kind of atmosphere are you aiming for?'
      },
      {
        id: 'activities',
        label: 'Activities or features',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., games, food, music, activities, entertainment',
        description: 'What activities or features will be part of the gathering?'
      },
      {
        id: 'decorations',
        label: 'Decorations or theme elements',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., balloons, banners, table settings, seasonal decor',
        description: 'Any specific decorations or theme elements?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Family reunion", "All welcome", "Potluck dinner"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'BBQ',
    name: 'BBQ',
    icon: '🍖',
    description: 'BBQ event flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'venue',
        label: 'Venue or location',
        type: 'text',
        required: false,
        placeholder: 'e.g., backyard, park, beach, community center',
        description: 'Where will the BBQ take place?'
      },
      {
        id: 'atmosphere',
        label: 'Atmosphere or mood',
        type: 'select',
        required: false,
        options: ['Casual', 'Fun', 'Relaxed', 'Energetic', 'Community', 'Celebratory', 'Other'],
        description: 'What kind of atmosphere are you aiming for?'
      },
      {
        id: 'activities',
        label: 'Activities or features',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., games, music, outdoor activities, entertainment',
        description: 'What activities or features will be part of the BBQ?'
      },
      {
        id: 'decorations',
        label: 'Decorations or theme elements',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., picnic tables, outdoor lighting, seasonal decor',
        description: 'Any specific decorations or theme elements?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "BBQ party", "Bring a dish", "All welcome"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'PARK_GATHERING',
    name: 'Park Gathering',
    icon: '🌳',
    description: 'Park Gathering flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'venue',
        label: 'Park or location',
        type: 'text',
        required: false,
        placeholder: 'e.g., city park, national park, beach park, playground',
        description: 'Which park or outdoor location?'
      },
      {
        id: 'atmosphere',
        label: 'Atmosphere or mood',
        type: 'select',
        required: false,
        options: ['Casual', 'Fun', 'Relaxed', 'Energetic', 'Community', 'Nature', 'Other'],
        description: 'What kind of atmosphere are you aiming for?'
      },
      {
        id: 'activities',
        label: 'Activities or features',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., picnic, games, hiking, outdoor activities',
        description: 'What activities or features will be part of the gathering?'
      },
      {
        id: 'decorations',
        label: 'Decorations or theme elements',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., picnic blankets, outdoor games, seasonal decor',
        description: 'Any specific decorations or theme elements?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Park day", "Bring a picnic", "Family friendly"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'COMMUNITY_EVENT',
    name: 'Community Event',
    icon: '🏘️',
    description: 'Community Event flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'venue',
        label: 'Venue or location',
        type: 'text',
        required: false,
        placeholder: 'e.g., community center, town square, local park, school',
        description: 'Where will the event take place?'
      },
      {
        id: 'atmosphere',
        label: 'Atmosphere or mood',
        type: 'select',
        required: false,
        options: ['Casual', 'Formal', 'Fun', 'Relaxed', 'Community', 'Educational', 'Celebratory', 'Other'],
        description: 'What kind of atmosphere are you aiming for?'
      },
      {
        id: 'activities',
        label: 'Activities or features',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., workshops, entertainment, food, activities',
        description: 'What activities or features will be part of the event?'
      },
      {
        id: 'decorations',
        label: 'Decorations or theme elements',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., banners, table settings, community displays',
        description: 'Any specific decorations or theme elements?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Community event", "All welcome", "Free admission"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'FUNDRAISER',
    name: 'Fundraiser',
    icon: '💝',
    description: 'Fundraiser flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'venue',
        label: 'Venue or location',
        type: 'text',
        required: false,
        placeholder: 'e.g., community center, restaurant, outdoor venue, school',
        description: 'Where will the fundraiser take place?'
      },
      {
        id: 'atmosphere',
        label: 'Atmosphere or mood',
        type: 'select',
        required: false,
        options: ['Formal', 'Semi-Formal', 'Casual', 'Elegant', 'Community', 'Celebratory', 'Other'],
        description: 'What kind of atmosphere are you aiming for?'
      },
      {
        id: 'activities',
        label: 'Activities or features',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., auction, dinner, entertainment, silent auction',
        description: 'What activities or features will be part of the fundraiser?'
      },
      {
        id: 'decorations',
        label: 'Decorations or theme elements',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., elegant table settings, lighting, themed decor',
        description: 'Any specific decorations or theme elements?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Fundraiser event", "Support our cause", "Tickets available"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'WORKSHOP',
    name: 'Workshop',
    icon: '🔧',
    description: 'Workshop flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'venue',
        label: 'Venue or location',
        type: 'text',
        required: false,
        placeholder: 'e.g., community center, school, studio, office',
        description: 'Where will the workshop take place?'
      },
      {
        id: 'atmosphere',
        label: 'Atmosphere or mood',
        type: 'select',
        required: false,
        options: ['Educational', 'Professional', 'Casual', 'Creative', 'Interactive', 'Other'],
        description: 'What kind of atmosphere are you aiming for?'
      },
      {
        id: 'activities',
        label: 'Activities or features',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., hands-on learning, demonstrations, group activities',
        description: 'What activities or features will be part of the workshop?'
      },
      {
        id: 'decorations',
        label: 'Decorations or theme elements',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., educational materials, displays, themed decor',
        description: 'Any specific decorations or theme elements?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Learn something new", "Register now", "Limited spots"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'MEETUP',
    name: 'Meetup',
    icon: '🤝',
    description: 'Meetup flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'venue',
        label: 'Venue or location',
        type: 'text',
        required: false,
        placeholder: 'e.g., coffee shop, restaurant, community center, park',
        description: 'Where will the meetup take place?'
      },
      {
        id: 'atmosphere',
        label: 'Atmosphere or mood',
        type: 'select',
        required: false,
        options: ['Casual', 'Professional', 'Social', 'Relaxed', 'Networking', 'Other'],
        description: 'What kind of atmosphere are you aiming for?'
      },
      {
        id: 'activities',
        label: 'Activities or features',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., networking, discussion, socializing, activities',
        description: 'What activities or features will be part of the meetup?'
      },
      {
        id: 'decorations',
        label: 'Decorations or theme elements',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., name tags, displays, themed decor',
        description: 'Any specific decorations or theme elements?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Join our meetup", "Network with others", "Free to attend"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'CELEBRATION',
    name: 'Celebration',
    icon: '🎊',
    description: 'Celebration flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'venue',
        label: 'Venue or location',
        type: 'text',
        required: false,
        placeholder: 'e.g., home, restaurant, community center, outdoor venue',
        description: 'Where will the celebration take place?'
      },
      {
        id: 'atmosphere',
        label: 'Atmosphere or mood',
        type: 'select',
        required: false,
        options: ['Casual', 'Formal', 'Fun', 'Energetic', 'Elegant', 'Celebratory', 'Other'],
        description: 'What kind of atmosphere are you aiming for?'
      },
      {
        id: 'activities',
        label: 'Activities or features',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., entertainment, games, music, activities',
        description: 'What activities or features will be part of the celebration?'
      },
      {
        id: 'decorations',
        label: 'Decorations or theme elements',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., balloons, banners, lighting, themed decor',
        description: 'Any specific decorations or theme elements?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Join our celebration", "All welcome", "Party time"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'REUNION',
    name: 'Reunion',
    icon: '👥',
    description: 'Reunion flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'venue',
        label: 'Venue or location',
        type: 'text',
        required: false,
        placeholder: 'e.g., school, restaurant, park, community center',
        description: 'Where will the reunion take place?'
      },
      {
        id: 'atmosphere',
        label: 'Atmosphere or mood',
        type: 'select',
        required: false,
        options: ['Casual', 'Nostalgic', 'Fun', 'Relaxed', 'Social', 'Celebratory', 'Other'],
        description: 'What kind of atmosphere are you aiming for?'
      },
      {
        id: 'activities',
        label: 'Activities or features',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., reminiscing, entertainment, games, activities',
        description: 'What activities or features will be part of the reunion?'
      },
      {
        id: 'decorations',
        label: 'Decorations or theme elements',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., memorabilia, photos, themed decor',
        description: 'Any specific decorations or theme elements?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Class reunion", "Catch up with old friends", "RSVP required"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'POTLUCK',
    name: 'Potluck',
    icon: '🍽️',
    description: 'Potluck flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'venue',
        label: 'Venue or location',
        type: 'text',
        required: false,
        placeholder: 'e.g., home, community center, park, church',
        description: 'Where will the potluck take place?'
      },
      {
        id: 'atmosphere',
        label: 'Atmosphere or mood',
        type: 'select',
        required: false,
        options: ['Casual', 'Community', 'Fun', 'Relaxed', 'Social', 'Other'],
        description: 'What kind of atmosphere are you aiming for?'
      },
      {
        id: 'activities',
        label: 'Activities or features',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., sharing food, socializing, games, activities',
        description: 'What activities or features will be part of the potluck?'
      },
      {
        id: 'decorations',
        label: 'Decorations or theme elements',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., table settings, food displays, themed decor',
        description: 'Any specific decorations or theme elements?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Potluck dinner", "Bring a dish", "All welcome"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'GAME_NIGHT',
    name: 'Game Night',
    icon: '🎲',
    description: 'Game Night flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'venue',
        label: 'Venue or location',
        type: 'text',
        required: false,
        placeholder: 'e.g., home, community center, game store, restaurant',
        description: 'Where will the game night take place?'
      },
      {
        id: 'atmosphere',
        label: 'Atmosphere or mood',
        type: 'select',
        required: false,
        options: ['Casual', 'Fun', 'Competitive', 'Social', 'Relaxed', 'Other'],
        description: 'What kind of atmosphere are you aiming for?'
      },
      {
        id: 'activities',
        label: 'Activities or features',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., board games, card games, video games, tournaments',
        description: 'What activities or features will be part of the game night?'
      },
      {
        id: 'decorations',
        label: 'Decorations or theme elements',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., game tables, lighting, themed decor',
        description: 'Any specific decorations or theme elements?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Game night", "Bring your favorite games", "All skill levels"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'BOOK_CLUB',
    name: 'Book Club',
    icon: '📚',
    description: 'Book Club flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'venue',
        label: 'Venue or location',
        type: 'text',
        required: false,
        placeholder: 'e.g., library, bookstore, home, coffee shop',
        description: 'Where will the book club meet?'
      },
      {
        id: 'atmosphere',
        label: 'Atmosphere or mood',
        type: 'select',
        required: false,
        options: ['Intellectual', 'Casual', 'Social', 'Relaxed', 'Educational', 'Other'],
        description: 'What kind of atmosphere are you aiming for?'
      },
      {
        id: 'activities',
        label: 'Activities or features',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., book discussion, refreshments, socializing',
        description: 'What activities or features will be part of the book club?'
      },
      {
        id: 'decorations',
        label: 'Decorations or theme elements',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., books, reading materials, themed decor',
        description: 'Any specific decorations or theme elements?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Book club meeting", "Join the discussion", "New members welcome"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'ART_CLASS',
    name: 'Art Class',
    icon: '🎨',
    description: 'Art Class flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'venue',
        label: 'Venue or location',
        type: 'text',
        required: false,
        placeholder: 'e.g., art studio, community center, school, gallery',
        description: 'Where will the art class take place?'
      },
      {
        id: 'atmosphere',
        label: 'Atmosphere or mood',
        type: 'select',
        required: false,
        options: ['Creative', 'Educational', 'Relaxed', 'Inspiring', 'Casual', 'Other'],
        description: 'What kind of atmosphere are you aiming for?'
      },
      {
        id: 'activities',
        label: 'Activities or features',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., painting, drawing, sculpture, mixed media',
        description: 'What activities or features will be part of the art class?'
      },
      {
        id: 'decorations',
        label: 'Decorations or theme elements',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., art supplies, displays, themed decor',
        description: 'Any specific decorations or theme elements?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Art class", "Express your creativity", "All materials provided"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'FITNESS_CLASS',
    name: 'Fitness Class',
    icon: '💪',
    description: 'Fitness Class flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'venue',
        label: 'Venue or location',
        type: 'text',
        required: false,
        placeholder: 'e.g., gym, community center, park, studio',
        description: 'Where will the fitness class take place?'
      },
      {
        id: 'atmosphere',
        label: 'Atmosphere or mood',
        type: 'select',
        required: false,
        options: ['Energetic', 'Motivational', 'Casual', 'Professional', 'Community', 'Other'],
        description: 'What kind of atmosphere are you aiming for?'
      },
      {
        id: 'activities',
        label: 'Activities or features',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., yoga, cardio, strength training, dance',
        description: 'What activities or features will be part of the fitness class?'
      },
      {
        id: 'decorations',
        label: 'Decorations or theme elements',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., fitness equipment, motivational displays, themed decor',
        description: 'Any specific decorations or theme elements?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Fitness class", "Get fit together", "All levels welcome"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'BREAKDANCING',
    name: 'Breakdancing',
    icon: '🕺',
    description: 'Breakdancing event flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'venue',
        label: 'Venue or location',
        type: 'text',
        required: false,
        placeholder: 'e.g., dance studio, community center, gym, outdoor space',
        description: 'Where will the breakdancing event take place?'
      },
      {
        id: 'atmosphere',
        label: 'Atmosphere or mood',
        type: 'select',
        required: false,
        options: ['Energetic', 'Competitive', 'Casual', 'Educational', 'Community', 'Other'],
        description: 'What kind of atmosphere are you aiming for?'
      },
      {
        id: 'activities',
        label: 'Activities or features',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., battles, workshops, performances, freestyle sessions',
        description: 'What activities or features will be part of the breakdancing event?'
      },
      {
        id: 'decorations',
        label: 'Decorations or theme elements',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., dance floor, music equipment, graffiti art, street culture elements',
        description: 'Any specific decorations or theme elements?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Breakdancing event", "Show your moves", "All skill levels"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  },
  {
    id: 'POTTERY',
    name: 'Pottery',
    icon: '🏺',
    description: 'Pottery event flyer theme no text unless otherwise specified.',
    questions: [
      {
        id: 'venue',
        label: 'Venue or location',
        type: 'text',
        required: false,
        placeholder: 'e.g., pottery studio, art center, community center, workshop space',
        description: 'Where will the pottery event take place?'
      },
      {
        id: 'atmosphere',
        label: 'Atmosphere or mood',
        type: 'select',
        required: false,
        options: ['Creative', 'Relaxed', 'Educational', 'Inspiring', 'Casual', 'Other'],
        description: 'What kind of atmosphere are you aiming for?'
      },
      {
        id: 'activities',
        label: 'Activities or features',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., wheel throwing, hand building, glazing, kiln firing',
        description: 'What activities or features will be part of the pottery event?'
      },
      {
        id: 'decorations',
        label: 'Decorations or theme elements',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., pottery wheels, clay, kilns, finished pieces, art supplies',
        description: 'Any specific decorations or theme elements?'
      },
      {
        id: 'customText',
        label: 'Custom text to add to image',
        type: 'textarea',
        required: false,
        placeholder: 'e.g., "Pottery workshop", "Create something beautiful", "All materials included"',
        description: 'Optional text you want to appear on the generated image. Tip: Shorter text (3-5 words) works better with AI generation for clearer results.'
      }
    ]
  }
];

export function getEventTypeConfig(eventTypeId: string): EventTypeConfig | undefined {
  return eventTypeConfigs.find(config => config.id === eventTypeId);
}

export function getEventTypeConfigByName(eventTypeName: string): EventTypeConfig | undefined {
  return eventTypeConfigs.find(config => config.name === eventTypeName);
} 