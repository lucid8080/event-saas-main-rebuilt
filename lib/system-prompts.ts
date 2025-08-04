import { prisma } from './db';

export interface SystemPromptData {
  id?: string;
  category: string;
  subcategory?: string;
  name: string;
  description?: string;
  content: string;
  version?: number;
  isActive?: boolean;
  metadata?: any;
}

export interface PromptCategory {
  id: string;
  name: string;
  description: string;
  subcategories?: string[];
}

// Define prompt categories
export const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: 'event_type',
    name: 'Event Types',
    description: 'Prompts for different event types (birthday, wedding, corporate, etc.)',
    subcategories: ['BIRTHDAY_PARTY', 'WEDDING', 'CORPORATE_EVENT', 'HOLIDAY_CELEBRATION', 'CONCERT', 'SPORTS_EVENT', 'NIGHTLIFE', 'FAMILY_GATHERING', 'BBQ', 'PARK_GATHERING', 'COMMUNITY_EVENT', 'FUNDRAISER', 'WORKSHOP', 'MEETUP', 'CELEBRATION', 'REUNION', 'POTLUCK', 'GAME_NIGHT', 'BOOK_CLUB', 'ART_CLASS', 'FITNESS_CLASS']
  },
  {
    id: 'style_preset',
    name: 'Style Presets',
    description: 'Prompts for different artistic styles and presets',
    subcategories: ['Wild Card', 'Pop Art', 'Children Book', 'Golden Harmony', 'Vintage Film Poster', 'Retro Game', 'Cyberpunk', 'Origami', 'Fantasy World', 'Street Art', 'Political Satire', 'Unicorn Balloon Bash']
  },
  {
    id: 'carousel_background',
    name: 'Carousel Backgrounds',
    description: 'Prompts for carousel background generation',
    subcategories: ['peach-waves', 'mint-flow', 'lavender-smooth', 'coral-waves', 'sage-organic', 'ux-gradient-purple', 'tech-blue-gradient', 'brand-orange-gradient', 'minimal-gray', 'corporate-navy']
  },
  {
    id: 'text_generation',
    name: 'Text Generation',
    description: 'Prompts for AI text generation in carousels',
    subcategories: ['header', 'body', 'caption', 'cta', 'slider_numbers']
  },
  {
    id: 'system_default',
    name: 'System Defaults',
    description: 'Default system prompts and fallbacks',
    subcategories: ['base_prompt', 'enhancement', 'fallback']
  }
];

// Get active prompt by category and subcategory
export async function getActivePrompt(category: string, subcategory?: string): Promise<SystemPromptData | null> {
  try {
    const prompt = await prisma.systemPrompt.findFirst({
      where: {
        category,
        subcategory: subcategory || null,
        isActive: true
      },
      orderBy: { version: 'desc' }
    });

    return prompt;
  } catch (error) {
    console.error('Error getting active prompt:', error);
    return null;
  }
}

// Get all prompts for a category
export async function getPromptsByCategory(category: string): Promise<SystemPromptData[]> {
  try {
    const prompts = await prisma.systemPrompt.findMany({
      where: {
        category,
        isActive: true
      },
      orderBy: [
        { subcategory: 'asc' },
        { version: 'desc' }
      ]
    });

    return prompts;
  } catch (error) {
    console.error('Error getting prompts by category:', error);
    return [];
  }
}

// Create a new prompt
export async function createPrompt(data: SystemPromptData, userId: string): Promise<SystemPromptData | null> {
  try {
    // Get the latest version for this category/subcategory combination
    const latestVersion = await prisma.systemPrompt.findFirst({
      where: {
        category: data.category,
        subcategory: data.subcategory || null
      },
      orderBy: { version: 'desc' },
      select: { version: true }
    });

    const newVersion = (latestVersion?.version || 0) + 1;

    const prompt = await prisma.systemPrompt.create({
      data: {
        category: data.category,
        subcategory: data.subcategory || null,
        name: data.name,
        description: data.description || null,
        content: data.content,
        version: newVersion,
        isActive: data.isActive !== false,
        metadata: data.metadata || {},
        createdBy: userId,
        updatedBy: userId
      }
    });

    return prompt;
  } catch (error) {
    console.error('Error creating prompt:', error);
    return null;
  }
}

// Update a prompt (creates new version)
export async function updatePrompt(id: string, data: Partial<SystemPromptData>, userId: string): Promise<SystemPromptData | null> {
  try {
    const existingPrompt = await prisma.systemPrompt.findUnique({
      where: { id }
    });

    if (!existingPrompt) {
      return null;
    }

    const newVersion = existingPrompt.version + 1;

    const updatedPrompt = await prisma.systemPrompt.create({
      data: {
        category: existingPrompt.category,
        subcategory: existingPrompt.subcategory,
        name: data.name || existingPrompt.name,
        description: data.description !== undefined ? data.description : existingPrompt.description,
        content: data.content || existingPrompt.content,
        version: newVersion,
        isActive: data.isActive !== undefined ? data.isActive : existingPrompt.isActive,
        metadata: data.metadata || existingPrompt.metadata,
        createdBy: existingPrompt.createdBy,
        updatedBy: userId
      }
    });

    return updatedPrompt;
  } catch (error) {
    console.error('Error updating prompt:', error);
    return null;
  }
}

// Get prompt history
export async function getPromptHistory(category: string, subcategory?: string): Promise<SystemPromptData[]> {
  try {
    const prompts = await prisma.systemPrompt.findMany({
      where: {
        category,
        subcategory: subcategory || null
      },
      orderBy: { version: 'desc' }
    });

    return prompts;
  } catch (error) {
    console.error('Error getting prompt history:', error);
    return [];
  }
}

// Get default prompts (fallback when database is not available)
export function getDefaultPrompts(): Record<string, string> {
  return {
    'BIRTHDAY_PARTY': 'vibrant birthday party celebration with colorful balloons, confetti, and festive decorations, warm and joyful atmosphere with bright lighting, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional event flyer design',
    'WEDDING': 'elegant wedding celebration with romantic floral arrangements, soft lighting, and sophisticated decor, timeless and romantic atmosphere with warm golden tones, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional wedding flyer design',
    'CORPORATE_EVENT': 'professional corporate event with modern business aesthetics, clean lines, and sophisticated design elements, professional and trustworthy atmosphere with corporate color schemes, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional business flyer design',
    'HOLIDAY_CELEBRATION': 'festive holiday celebration with seasonal decorations, warm lighting, and traditional holiday elements, joyful and celebratory atmosphere with holiday color palettes, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional holiday flyer design',
    'CONCERT': 'dynamic concert event with energetic lighting, stage effects, and musical atmosphere, exciting and vibrant mood with dramatic lighting and performance energy, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional concert flyer design',
    'SPORTS_EVENT': 'action-packed sports event with dynamic movement, competitive energy, and athletic atmosphere, energetic and competitive mood with sports equipment and arena elements, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional sports flyer design',
    'NIGHTLIFE': 'vibrant nightlife event with neon lighting, urban atmosphere, and contemporary club aesthetics, exciting and energetic mood with modern urban elements and nightlife energy, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional nightlife flyer design',
    'carousel_background_base': 'Create a seamless background image with a continuous pattern. The background should be a unified design that flows smoothly from left to right across the entire width. Use simple, solid colors and subtle patterns that create visual interest without being distracting. The design should be cohesive and seamless, with no visible breaks, separations, or distinct sections. Choose colors that provide excellent contrast for white text overlay. Ensure high quality, no blur, no distortion, professional design suitable for social media carousels.',
    'text_generation_header': 'Generate a compelling header text for a carousel slide that is attention-grabbing and clearly communicates the main message. The text should be concise (3-7 words), impactful, use strong action words, and create immediate visual impact. Focus on clarity, brevity, and emotional resonance. Use only real, readable English words - no gibberish, no fake letters, no strange characters.',
    'text_generation_body': 'Generate informative body text that provides details and context for the carousel content. The text should be clear, engaging, provide valuable information to the reader, and maintain consistent tone. Keep it concise (1-2 sentences) while being informative and compelling. Use only real, readable English words - no gibberish, no fake letters, no strange characters.',
    'text_generation_cta': 'Generate a clear call-to-action text that encourages engagement or next steps. The text should be action-oriented, compelling, create urgency or excitement, and use strong verbs. Keep it short (2-4 words) and make it impossible to ignore. Use only real, readable English words - no gibberish, no fake letters, no strange characters.'
  };
} 