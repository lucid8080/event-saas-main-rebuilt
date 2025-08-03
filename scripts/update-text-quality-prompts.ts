import { prisma } from '../lib/prisma';

const enhancedPrompts = [
  // Event Type Prompts - Enhanced with Text Quality Control
  {
    category: 'event_type',
    subcategory: 'BIRTHDAY_PARTY',
    content: 'vibrant birthday party celebration with colorful balloons, confetti, and festive decorations, warm and joyful atmosphere with bright lighting, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional event flyer design'
  },
  {
    category: 'event_type',
    subcategory: 'WEDDING',
    content: 'elegant wedding celebration with romantic floral arrangements, soft lighting, and sophisticated decor, timeless and romantic atmosphere with warm golden tones, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional wedding flyer design'
  },
  {
    category: 'event_type',
    subcategory: 'CORPORATE_EVENT',
    content: 'professional corporate event with modern business aesthetics, clean lines, and sophisticated design elements, professional and trustworthy atmosphere with corporate color schemes, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional business flyer design'
  },
  {
    category: 'event_type',
    subcategory: 'HOLIDAY_CELEBRATION',
    content: 'festive holiday celebration with seasonal decorations, warm lighting, and traditional holiday elements, joyful and celebratory atmosphere with holiday color palettes, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional holiday flyer design'
  },
  {
    category: 'event_type',
    subcategory: 'CONCERT',
    content: 'dynamic concert event with energetic lighting, stage effects, and musical atmosphere, exciting and vibrant mood with dramatic lighting and performance energy, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional concert flyer design'
  },
  {
    category: 'event_type',
    subcategory: 'SPORTS_EVENT',
    content: 'action-packed sports event with dynamic movement, competitive energy, and athletic atmosphere, energetic and competitive mood with sports equipment and arena elements, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional sports flyer design'
  },
  {
    category: 'event_type',
    subcategory: 'NIGHTLIFE',
    content: 'vibrant nightlife event with neon lighting, urban atmosphere, and contemporary club aesthetics, exciting and energetic mood with modern urban elements and nightlife energy, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional nightlife flyer design'
  },
  {
    category: 'event_type',
    subcategory: 'OTHER',
    content: 'versatile event design with adaptable styling, welcoming atmosphere, and inclusive visual elements, friendly and approachable mood with universal appeal and flexible design elements, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional event flyer design'
  },

  // Style Preset Prompts - Enhanced with Text Quality Control
  {
    category: 'style_preset',
    subcategory: 'Wild Card',
    content: 'unique and unpredictable artistic interpretation with creative freedom, experimental composition and unconventional visual elements, artistic and innovative style with unexpected color combinations and abstract elements, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, creative artistic design'
  },
  {
    category: 'style_preset',
    subcategory: 'Pop Art',
    content: 'vibrant pop art style reminiscent of Roy Lichtenstein and Andy Warhol, bold colors, comic book dots, and graphic design elements, retro pop culture aesthetic with bright primary colors and bold outlines, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, authentic pop art design'
  },
  {
    category: 'style_preset',
    subcategory: 'Children Book',
    content: 'whimsical children book illustration style with soft colors, friendly characters, and playful elements, warm and inviting atmosphere perfect for family events, gentle and approachable aesthetic with rounded shapes and cheerful colors, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, family-friendly design'
  },
  {
    category: 'style_preset',
    subcategory: 'Golden Harmony',
    content: 'elegant celebration design with soft neutral tones, gold accents, and warm lighting, sophisticated and luxurious atmosphere with harmonious color balance, refined and upscale aesthetic with golden highlights and elegant composition, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, premium celebration design'
  },
  {
    category: 'style_preset',
    subcategory: 'Vintage Film Poster',
    content: 'vintage action movie poster style with bold colors, dramatic lighting, and 80s retro aesthetic, cinematic and dramatic atmosphere with vintage typography and film poster composition, nostalgic and energetic style with retro color palettes and dramatic shadows, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, authentic vintage poster design'
  },
  {
    category: 'style_preset',
    subcategory: 'Retro Game',
    content: 'retro game theme with pixel art graphics, 16-bit aesthetic, and nostalgic gaming elements, vintage video game atmosphere with pixelated textures and retro color palettes, nostalgic and playful style with classic gaming visual elements, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, authentic retro game design'
  },
  {
    category: 'style_preset',
    subcategory: 'Cyberpunk',
    content: 'futuristic cyberpunk style with neon lighting, technological elements, and urban dystopia aesthetic, high-tech and edgy atmosphere with neon colors and futuristic design elements, modern and cutting-edge style with cyberpunk visual language, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, authentic cyberpunk design'
  },
  {
    category: 'style_preset',
    subcategory: 'Origami',
    content: 'low-poly 3D character design in geometric, faceted style with warm shades, minimalist and modern aesthetic with clean geometric forms, contemporary and artistic style with polygonal shapes and warm color palette, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, modern geometric design'
  },
  {
    category: 'style_preset',
    subcategory: 'Fantasy World',
    content: 'magical and enchanting fantasy realm with mystical elements, ethereal lighting, and otherworldly atmosphere, dreamlike and fantastical aesthetic with magical visual effects and fantasy creatures, whimsical and imaginative style with fantasy world elements, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, enchanting fantasy design'
  },
  {
    category: 'style_preset',
    subcategory: 'Street Art',
    content: 'urban street art style with bold graffiti elements, contemporary urban culture, and vibrant street aesthetics, edgy and urban atmosphere with graffiti techniques and street art visual language, modern and rebellious style with urban artistic elements, limited text and faces unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, authentic street art design'
  },
  {
    category: 'style_preset',
    subcategory: 'Political Satire',
    content: 'detailed political caricature with formal government office backdrop, satirical and humorous political commentary, sophisticated and witty aesthetic with political symbolism and formal setting, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional political satire design'
  },

  // Text Generation Prompts - Enhanced with Text Quality Control
  {
    category: 'text_generation',
    subcategory: 'header',
    content: 'Generate a compelling header text for a carousel slide that is attention-grabbing and clearly communicates the main message. The text should be concise (3-7 words), impactful, use strong action words, and create immediate visual impact. Focus on clarity, brevity, and emotional resonance. Use only real, readable English words - no gibberish, no fake letters, no strange characters. Ensure proper spelling and grammar.'
  },
  {
    category: 'text_generation',
    subcategory: 'body',
    content: 'Generate informative body text that provides details and context for the carousel content. The text should be clear, engaging, provide valuable information to the reader, and maintain consistent tone. Keep it concise (1-2 sentences) while being informative and compelling. Use only real, readable English words - no gibberish, no fake letters, no strange characters. Ensure proper spelling and grammar.'
  },
  {
    category: 'text_generation',
    subcategory: 'cta',
    content: 'Generate a clear call-to-action text that encourages engagement or next steps. The text should be action-oriented, compelling, create urgency or excitement, and use strong verbs. Keep it short (2-4 words) and make it impossible to ignore. Use only real, readable English words - no gibberish, no fake letters, no strange characters. Ensure proper spelling and grammar.'
  }
];

async function updateTextQualityPrompts() {
  try {
    console.log('🔄 Updating system prompts with enhanced text quality controls...');

    for (const promptData of enhancedPrompts) {
      // Find the latest active prompt for this category/subcategory
      const existingPrompt = await prisma.systemPrompt.findFirst({
        where: {
          category: promptData.category,
          subcategory: promptData.subcategory,
          isActive: true
        },
        orderBy: { version: 'desc' }
      });

      if (existingPrompt) {
        // Create a new version with updated content
        const newVersion = existingPrompt.version + 1;
        
        await prisma.systemPrompt.create({
          data: {
            category: existingPrompt.category,
            subcategory: existingPrompt.subcategory,
            name: existingPrompt.name,
            description: existingPrompt.description,
            content: promptData.content,
            version: newVersion,
            isActive: true,
            metadata: existingPrompt.metadata,
            createdBy: existingPrompt.createdBy,
            updatedBy: existingPrompt.updatedBy
          }
        });

        console.log(`✅ Updated prompt: ${existingPrompt.name} (v${newVersion})`);
      } else {
        console.log(`⚠️  No existing prompt found for: ${promptData.category}/${promptData.subcategory}`);
      }
    }

    console.log('🎉 Text quality prompt updates completed!');
  } catch (error) {
    console.error('❌ Error updating text quality prompts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTextQualityPrompts(); 