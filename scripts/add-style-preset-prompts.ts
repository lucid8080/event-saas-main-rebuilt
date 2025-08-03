import { prisma } from "../lib/db";

async function addStylePresetPrompts() {
  try {
    console.log("🎨 Adding style preset prompts...\n");

    // Get admin user for creating prompts
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    });

    if (!adminUser) {
      console.log("❌ No admin user found. Cannot create prompts.");
      return;
    }

    // Define all style presets with their prompts
    const stylePresetPrompts = {
      'Wild Card': 'unique and unpredictable artistic interpretation with creative freedom, experimental composition and unconventional visual elements, artistic and innovative style with unexpected color combinations and abstract elements, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, creative artistic design',
      'Pop Art': 'vibrant pop art style reminiscent of Roy Lichtenstein and Andy Warhol, bold colors, comic book dots, and graphic design elements, retro pop culture aesthetic with bright primary colors and bold outlines, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, authentic pop art design',
      'Children Book': 'whimsical children book illustration style with soft colors, friendly characters, and playful elements, warm and inviting atmosphere perfect for family events, gentle and approachable aesthetic with rounded shapes and cheerful colors, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, family-friendly design',
      'Golden Harmony': 'elegant celebration design with soft neutral tones, gold accents, and warm lighting, sophisticated and luxurious atmosphere with harmonious color balance, refined and upscale aesthetic with golden highlights and elegant composition, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, premium celebration design',
      'Vintage Film Poster': 'vintage action movie poster style with bold colors, dramatic lighting, and 80s retro aesthetic, cinematic and dramatic atmosphere with vintage typography and film poster composition, nostalgic and energetic style with retro color palettes and dramatic shadows, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, authentic vintage poster design',
      'Retro Game': 'retro game theme with pixel art graphics, 16-bit aesthetic, and nostalgic gaming elements, vintage video game atmosphere with pixelated textures and retro color palettes, nostalgic and playful style with classic gaming visual elements, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, authentic retro game design',
      'Cyberpunk': 'futuristic cyberpunk style with neon lighting, technological elements, and urban dystopia aesthetic, high-tech and edgy atmosphere with neon colors and futuristic design elements, modern and cutting-edge style with cyberpunk visual language, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, authentic cyberpunk design',
      'Origami': 'low-poly 3D character design in geometric, faceted style with warm shades, minimalist and modern aesthetic with clean geometric forms, contemporary and artistic style with polygonal shapes and warm color palette, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, modern geometric design',
      'Fantasy World': 'magical and enchanting fantasy realm with mystical elements, ethereal lighting, and otherworldly atmosphere, dreamlike and fantastical aesthetic with magical visual effects and fantasy creatures, whimsical and imaginative style with fantasy world elements, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, enchanting fantasy design',
      'Street Art': 'urban street art style with bold graffiti elements, contemporary urban culture, and vibrant street aesthetics, edgy and urban atmosphere with graffiti techniques and street art visual language, modern and rebellious style with urban artistic elements, limited text and faces unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, authentic street art design',
      'Political Satire': 'detailed political caricature with formal government office backdrop, satirical and humorous political commentary, sophisticated and witty aesthetic with political symbolism and formal setting, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, professional political satire design'
    };

    console.log(`🎨 Processing ${Object.keys(stylePresetPrompts).length} style presets...\n`);

    const createdPrompts = [];
    const skippedPrompts = [];

    // Process each style preset
    for (const [styleName, promptContent] of Object.entries(stylePresetPrompts)) {
      try {
        // Check if prompt already exists for this style preset
        const existingPrompt = await prisma.systemPrompt.findFirst({
          where: {
            category: 'style_preset',
            subcategory: styleName
          }
        });

        if (existingPrompt) {
          console.log(`✅ Already exists: ${styleName}`);
          skippedPrompts.push(styleName);
          continue;
        }

        // Create the prompt
        const prompt = await prisma.systemPrompt.create({
          data: {
            category: 'style_preset',
            subcategory: styleName,
            name: `${styleName} Style`,
            description: `Default prompt for ${styleName} style preset`,
            content: promptContent,
            version: 1,
            isActive: true,
            metadata: {
              source: 'comprehensive_seeding',
              seeded: true,
              originalKey: styleName
            },
            createdBy: adminUser.id,
            updatedBy: adminUser.id
          }
        });

        createdPrompts.push(prompt);
        console.log(`✅ Created: ${styleName}`);

      } catch (error) {
        console.error(`❌ Error creating prompt for ${styleName}:`, error);
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("🎨 STYLE PRESET SEEDING SUMMARY:");
    console.log(`   • Created: ${createdPrompts.length} new style preset prompts`);
    console.log(`   • Skipped: ${skippedPrompts.length} existing prompts`);
    console.log(`   • Total style preset prompts: ${await prisma.systemPrompt.count({ where: { category: 'style_preset' } })}`);
    console.log("");

    if (createdPrompts.length > 0) {
      console.log("✅ Successfully added all style preset prompts!");
      console.log("🎉 All style presets should now be available in the System Prompts Management.");
    }

  } catch (error) {
    console.error("❌ Error adding style preset prompts:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addStylePresetPrompts(); 