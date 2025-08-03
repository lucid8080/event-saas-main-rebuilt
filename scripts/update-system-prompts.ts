import { prisma } from '../lib/prisma';

const enhancedPrompts = [
  // Event Type Prompts - Enhanced with Ideogram Best Practices
  {
    category: 'event_type',
    subcategory: 'BIRTHDAY_PARTY',
    name: 'Birthday Party Event Type',
    description: 'Enhanced prompt for birthday party event type with specific visual elements and festive mood',
    content: 'vibrant birthday party celebration with colorful balloons, confetti, and festive decorations, warm and joyful atmosphere with bright lighting, no text unless otherwise specified, no blur, no distortion, high quality, professional event flyer design',
    isActive: true
  },
  {
    category: 'event_type',
    subcategory: 'WEDDING',
    name: 'Wedding Event Type',
    description: 'Enhanced prompt for wedding event type with elegant styling and romantic context',
    content: 'elegant wedding celebration with romantic floral arrangements, soft lighting, and sophisticated decor, timeless and romantic atmosphere with warm golden tones, no text unless otherwise specified, no blur, no distortion, high quality, professional wedding flyer design',
    isActive: true
  },
  {
    category: 'event_type',
    subcategory: 'CORPORATE_EVENT',
    name: 'Corporate Event Type',
    description: 'Enhanced prompt for corporate event type with professional and modern aesthetics',
    content: 'professional corporate event with modern business aesthetics, clean lines, and sophisticated design elements, professional and trustworthy atmosphere with corporate color schemes, no text unless otherwise specified, no blur, no distortion, high quality, professional business flyer design',
    isActive: true
  },
  {
    category: 'event_type',
    subcategory: 'HOLIDAY_CELEBRATION',
    name: 'Holiday Celebration Event Type',
    description: 'Enhanced prompt for holiday celebration event type with festive and seasonal elements',
    content: 'festive holiday celebration with seasonal decorations, warm lighting, and traditional holiday elements, joyful and celebratory atmosphere with holiday color palettes, no text unless otherwise specified, no blur, no distortion, high quality, professional holiday flyer design',
    isActive: true
  },
  {
    category: 'event_type',
    subcategory: 'CONCERT',
    name: 'Concert Event Type',
    description: 'Enhanced prompt for concert event type with dynamic and energetic styling',
    content: 'dynamic concert event with energetic lighting, stage effects, and musical atmosphere, exciting and vibrant mood with dramatic lighting and performance energy, no text unless otherwise specified, no blur, no distortion, high quality, professional concert flyer design',
    isActive: true
  },
  {
    category: 'event_type',
    subcategory: 'SPORTS_EVENT',
    name: 'Sports Event Type',
    description: 'Enhanced prompt for sports event type with action-oriented and competitive feel',
    content: 'action-packed sports event with dynamic movement, competitive energy, and athletic atmosphere, energetic and competitive mood with sports equipment and arena elements, no text unless otherwise specified, no blur, no distortion, high quality, professional sports flyer design',
    isActive: true
  },
  {
    category: 'event_type',
    subcategory: 'NIGHTLIFE',
    name: 'Nightlife Event Type',
    description: 'Enhanced prompt for nightlife event type with vibrant and contemporary urban style',
    content: 'vibrant nightlife event with neon lighting, urban atmosphere, and contemporary club aesthetics, exciting and energetic mood with modern urban elements and nightlife energy, no text unless otherwise specified, no blur, no distortion, high quality, professional nightlife flyer design',
    isActive: true
  },

  // Style Preset Prompts - Enhanced with Ideogram Best Practices
  {
    category: 'style_preset',
    subcategory: 'Wild Card',
    name: 'Wild Card Style',
    description: 'Enhanced wild card style with creative freedom and artistic unpredictability',
    content: 'unique and unpredictable artistic interpretation with creative freedom, experimental composition and unconventional visual elements, artistic and innovative style with unexpected color combinations and abstract elements, no text unless otherwise specified, no blur, no distortion, high quality, creative artistic design',
    isActive: true
  },
  {
    category: 'style_preset',
    subcategory: 'Pop Art',
    name: 'Pop Art Style',
    description: 'Enhanced pop art style with specific artist references and techniques',
    content: 'vibrant pop art style reminiscent of Roy Lichtenstein and Andy Warhol, bold colors, comic book dots, and graphic design elements, retro pop culture aesthetic with bright primary colors and bold outlines, no text unless otherwise specified, no blur, no distortion, high quality, authentic pop art design',
    isActive: true
  },
  {
    category: 'style_preset',
    subcategory: 'Children Book',
    name: 'Children Book Style',
    description: 'Enhanced children book style with whimsical and family-friendly elements',
    content: 'whimsical children book illustration style with soft colors, friendly characters, and playful elements, warm and inviting atmosphere perfect for family events, gentle and approachable aesthetic with rounded shapes and cheerful colors, no text unless otherwise specified, no blur, no distortion, high quality, family-friendly design',
    isActive: true
  },
  {
    category: 'style_preset',
    subcategory: 'Golden Harmony',
    name: 'Golden Harmony Style',
    description: 'Enhanced golden harmony style with elegant celebration aesthetics',
    content: 'elegant celebration design with soft neutral tones, gold accents, and warm lighting, sophisticated and luxurious atmosphere with harmonious color balance, refined and upscale aesthetic with golden highlights and elegant composition, no text unless otherwise specified, no blur, no distortion, high quality, premium celebration design',
    isActive: true
  },
  {
    category: 'style_preset',
    subcategory: 'Vintage Film Poster',
    name: 'Vintage Film Poster Style',
    description: 'Enhanced vintage film poster style with 80s retro and dramatic styling',
    content: 'vintage action movie poster style with bold colors, dramatic lighting, and 80s retro aesthetic, cinematic and dramatic atmosphere with vintage typography and film poster composition, nostalgic and energetic style with retro color palettes and dramatic shadows, no text unless otherwise specified, no blur, no distortion, high quality, authentic vintage poster design',
    isActive: true
  },
  {
    category: 'style_preset',
    subcategory: 'Retro Game',
    name: 'Retro Game Style',
    description: 'Enhanced retro game style with pixel art and 16-bit graphics',
    content: 'retro game theme with pixel art graphics, 16-bit aesthetic, and nostalgic gaming elements, vintage video game atmosphere with pixelated textures and retro color palettes, nostalgic and playful style with classic gaming visual elements, no text unless otherwise specified, no blur, no distortion, high quality, authentic retro game design',
    isActive: true
  },
  {
    category: 'style_preset',
    subcategory: 'Cyberpunk',
    name: 'Cyberpunk Style',
    description: 'Enhanced cyberpunk style with futuristic and neon-lit elements',
    content: 'futuristic cyberpunk style with neon lighting, technological elements, and urban dystopia aesthetic, high-tech and edgy atmosphere with neon colors and futuristic design elements, modern and cutting-edge style with cyberpunk visual language, no text unless otherwise specified, no blur, no distortion, high quality, authentic cyberpunk design',
    isActive: true
  },
  {
    category: 'style_preset',
    subcategory: 'Origami',
    name: 'Origami Style',
    description: 'Enhanced origami style with low-poly 3D and geometric styling',
    content: 'low-poly 3D character design in geometric, faceted style with warm shades, minimalist and modern aesthetic with clean geometric forms, contemporary and artistic style with polygonal shapes and warm color palette, no text unless otherwise specified, no blur, no distortion, high quality, modern geometric design',
    isActive: true
  },
  {
    category: 'style_preset',
    subcategory: 'Fantasy World',
    name: 'Fantasy World Style',
    description: 'Enhanced fantasy world style with magical and mystical elements',
    content: 'magical and enchanting fantasy realm with mystical elements, ethereal lighting, and otherworldly atmosphere, dreamlike and fantastical aesthetic with magical visual effects and fantasy creatures, whimsical and imaginative style with fantasy world elements, no text unless otherwise specified, no blur, no distortion, high quality, enchanting fantasy design',
    isActive: true
  },
  {
    category: 'style_preset',
    subcategory: 'Street Art',
    name: 'Street Art Style',
    description: 'Enhanced street art style with urban graffiti and contemporary culture',
    content: 'urban street art style with bold graffiti elements, contemporary urban culture, and vibrant street aesthetics, edgy and urban atmosphere with graffiti techniques and street art visual language, modern and rebellious style with urban artistic elements, limited text and faces unless otherwise specified, no blur, no distortion, high quality, authentic street art design',
    isActive: true
  },
  {
    category: 'style_preset',
    subcategory: 'Political Satire',
    name: 'Political Satire Style',
    description: 'Enhanced political satire style with caricature and formal backdrop',
    content: 'detailed political caricature with formal government office backdrop, satirical and humorous political commentary, sophisticated and witty aesthetic with political symbolism and formal setting, no text unless otherwise specified, no blur, no distortion, high quality, professional political satire design',
    isActive: true
  },

  // Carousel Background Prompts - Enhanced with Ideogram Best Practices
  {
    category: 'carousel_background',
    subcategory: 'peach-waves',
    name: 'Peach Waves Background',
    description: 'Enhanced soft peach background with flowing wavy shapes and improved text readability',
    content: 'soft peach salmon background with flowing abstract wavy shapes, completely seamless pattern that flows continuously from left to right, no visible breaks or separations, muted tones with high contrast for text readability, subtle geometric lines, flat design, unified visual experience, perfect for white text overlay, no blur, no distortion, high quality, professional background design',
    isActive: true
  },
  {
    category: 'carousel_background',
    subcategory: 'mint-flow',
    name: 'Mint Flow Background',
    description: 'Enhanced gentle mint background with organic flowing shapes and improved text positioning',
    content: 'gentle mint green background with organic flowing shapes, completely seamless pattern that flows continuously from left to right, no visible breaks or separations, muted tones with optimal contrast for text visibility, subtle geometric elements, flat design, unified visual experience, text-friendly with clear readability zones, no blur, no distortion, high quality, professional background design',
    isActive: true
  },
  {
    category: 'carousel_background',
    subcategory: 'lavender-smooth',
    name: 'Lavender Smooth Background',
    description: 'Enhanced smooth lavender background with soft curves and elegant text overlay',
    content: 'smooth lavender background with soft curved shapes, completely seamless pattern that flows continuously from left to right, no visible breaks or separations, muted purple tones with excellent text contrast, subtle geometric patterns, flat design, unified visual experience, elegant simplicity perfect for text overlay, no blur, no distortion, high quality, professional background design',
    isActive: true
  },
  {
    category: 'carousel_background',
    subcategory: 'coral-waves',
    name: 'Coral Waves Background',
    description: 'Enhanced coral background with flowing wave patterns and vibrant energy',
    content: 'coral background with flowing wave patterns, completely seamless design that flows continuously from left to right, no visible breaks or separations, vibrant coral tones with strong text contrast, subtle geometric lines, flat colors, unified visual experience, perfect for text readability with energetic feel, no blur, no distortion, high quality, professional background design',
    isActive: true
  },
  {
    category: 'carousel_background',
    subcategory: 'sage-organic',
    name: 'Sage Organic Background',
    description: 'Enhanced sage green background with organic flowing shapes and natural calming elements',
    content: 'sage green background with organic flowing shapes, completely seamless pattern that flows continuously from left to right, no visible breaks or separations, muted green tones with natural calming feel, subtle geometric elements, flat design, unified visual experience, natural and calming with excellent text contrast, no blur, no distortion, high quality, professional background design',
    isActive: true
  },

  // Text Generation Prompts - Enhanced with Ideogram Best Practices
  {
    category: 'text_generation',
    subcategory: 'header',
    name: 'Header Text Generation',
    description: 'Enhanced header text generation with clear hierarchy and impact',
    content: 'Generate a compelling header text for a carousel slide that is attention-grabbing and clearly communicates the main message. The text should be concise (3-7 words), impactful, use strong action words, and create immediate visual impact. Focus on clarity, brevity, and emotional resonance.',
    isActive: true
  },
  {
    category: 'text_generation',
    subcategory: 'body',
    name: 'Body Text Generation',
    description: 'Enhanced body text generation with informative and engaging content',
    content: 'Generate informative body text that provides details and context for the carousel content. The text should be clear, engaging, provide valuable information to the reader, and maintain consistent tone. Keep it concise (1-2 sentences) while being informative and compelling.',
    isActive: true
  },
  {
    category: 'text_generation',
    subcategory: 'cta',
    name: 'Call-to-Action Text Generation',
    description: 'Enhanced call-to-action text generation with action-oriented and compelling language',
    content: 'Generate a clear call-to-action text that encourages engagement or next steps. The text should be action-oriented, compelling, create urgency or excitement, and use strong verbs. Keep it short (2-4 words) and make it impossible to ignore.',
    isActive: true
  },

  // System Default Prompts - Enhanced with Ideogram Best Practices
  {
    category: 'system_default',
    subcategory: 'carousel_background_base',
    name: 'Carousel Background Base',
    description: 'Enhanced base prompt for carousel background generation with better structure and quality control',
    content: 'Create a seamless background image with a continuous pattern. The background should be a unified design that flows smoothly from left to right across the entire width. Use simple, solid colors and subtle patterns that create visual interest without being distracting. The design should be cohesive and seamless, with no visible breaks, separations, or distinct sections. Choose colors that provide excellent contrast for white text overlay. Ensure high quality, no blur, no distortion, professional design suitable for social media carousels.',
    isActive: true
  }
];

async function updateSystemPrompts() {
  try {
    console.log('🔄 Updating system prompts with enhanced versions...');

    for (const promptData of enhancedPrompts) {
      // Find the existing active prompt
      const existingPrompt = await prisma.systemPrompt.findFirst({
        where: {
          category: promptData.category,
          subcategory: promptData.subcategory,
          isActive: true
        }
      });

      if (existingPrompt) {
        // Create a new version with enhanced content
        const newVersion = existingPrompt.version + 1;
        
        await prisma.systemPrompt.create({
          data: {
            category: promptData.category,
            subcategory: promptData.subcategory,
            name: promptData.name,
            description: promptData.description,
            content: promptData.content,
            version: newVersion,
            isActive: true,
            metadata: {},
            createdBy: existingPrompt.createdBy,
            updatedBy: existingPrompt.createdBy
          }
        });
        
        console.log(`✅ Updated prompt: ${promptData.name} (v${newVersion})`);
      } else {
        console.log(`⚠️  No existing prompt found for: ${promptData.name}`);
      }
    }

    console.log('🎉 System prompts update completed!');
  } catch (error) {
    console.error('❌ Error updating system prompts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSystemPrompts(); 