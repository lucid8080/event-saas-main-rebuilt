import { prisma } from "../lib/db";

async function enhanceGoldenHarmonyTextControl() {
  try {
    console.log("🎨 Enhancing Golden Harmony with comprehensive text quality control...\n");

    // Get HERO user for updating prompt
    const heroUser = await prisma.user.findFirst({
      where: { role: "HERO" }
    });

    if (!heroUser) {
      console.log("❌ No HERO user found. Cannot update prompt.");
      return;
    }

    console.log(`✅ Using HERO user: ${heroUser.email}\n`);

    // Find the Golden Harmony prompt
    const goldenHarmonyPrompt = await prisma.systemPrompt.findFirst({
      where: {
        category: 'style_preset',
        subcategory: 'Golden Harmony',
        isActive: true
      }
    });

    if (!goldenHarmonyPrompt) {
      console.log("❌ Golden Harmony prompt not found in database.");
      return;
    }

    console.log("📝 Current Golden Harmony prompt:");
    console.log(goldenHarmonyPrompt.content);
    console.log(`Length: ${goldenHarmonyPrompt.content.length} characters\n`);

    // Enhanced prompt with comprehensive text quality control
    const enhancedPrompt = "elegant celebration design with soft neutral tones, gold accents, and warm lighting, sophisticated and luxurious atmosphere with harmonious color balance, refined and upscale aesthetic with golden highlights and elegant composition, no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, premium celebration design";

    console.log("🔧 Enhanced Golden Harmony prompt:");
    console.log(enhancedPrompt);
    console.log(`Length: ${enhancedPrompt.length} characters\n`);

    // Calculate the difference
    const addedCharacters = enhancedPrompt.length - goldenHarmonyPrompt.content.length;
    console.log(`📊 Changes:`);
    console.log(`- Characters added: ${addedCharacters}`);
    console.log(`- Text quality phrases added: no gibberish text, no fake letters, no strange characters, only real readable words if text is included\n`);

    // Update the prompt
    const updatedPrompt = await prisma.systemPrompt.update({
      where: { id: goldenHarmonyPrompt.id },
      data: {
        content: enhancedPrompt,
        version: goldenHarmonyPrompt.version + 1,
        updatedBy: heroUser.id,
        updatedAt: new Date()
      }
    });

    console.log("✅ Golden Harmony prompt enhanced successfully!");
    console.log(`New version: ${updatedPrompt.version}`);
    console.log(`Updated at: ${updatedPrompt.updatedAt}`);

    // Test the prompt generation
    console.log("\n🧪 Testing enhanced prompt generation...");
    
    // Import the function
    const { generateEnhancedPromptWithSystemPrompts } = await import('../lib/prompt-generator');
    
    // Test cases
    const testCases = [
      {
        name: "Wedding with Enhanced Golden Harmony",
        eventType: 'WEDDING',
        eventDetails: {
          style: 'modern',
          colors: 'white and gold',
          venue: 'garden'
        },
        styleName: 'Golden Harmony'
      },
      {
        name: "Birthday with Enhanced Golden Harmony",
        eventType: 'BIRTHDAY_PARTY',
        eventDetails: {
          age: '30',
          theme: 'elegant',
          venue: 'ballroom'
        },
        styleName: 'Golden Harmony'
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n📝 Test Case: ${testCase.name}`);
      
      const testPrompt = await generateEnhancedPromptWithSystemPrompts(
        "no text unless otherwise specified, no blur, no distortion, high quality, professional event flyer design",
        testCase.eventType,
        testCase.eventDetails,
        testCase.styleName
      );

      console.log(`🎯 Generated Prompt:`);
      console.log(testPrompt);
      console.log(`Length: ${testPrompt.length} characters`);
      
      // Check if text quality phrases are included
      const hasTextQualityControl = testPrompt.includes('no gibberish text') && 
                                   testPrompt.includes('no fake letters') && 
                                   testPrompt.includes('no strange characters');
      
      console.log(`✅ Text quality control included: ${hasTextQualityControl ? 'YES' : 'NO'}`);
    }

    console.log("\n🎉 Enhancement complete! The Golden Harmony style should now generate images without gibberish text.");

  } catch (error) {
    console.error('❌ Error enhancing Golden Harmony text control:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
enhanceGoldenHarmonyTextControl(); 