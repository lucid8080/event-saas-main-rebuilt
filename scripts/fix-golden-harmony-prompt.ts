import { prisma } from "../lib/db";

async function fixGoldenHarmonyPrompt() {
  try {
    console.log("🎨 Fixing Golden Harmony style preset prompt...\n");

    // Get HERO user for updating prompt (since no ADMIN users exist)
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

    // Fixed prompt with quality control phrases restored
    const fixedPrompt = "elegant celebration design with soft neutral tones, gold accents, and warm lighting, sophisticated and luxurious atmosphere with harmonious color balance, refined and upscale aesthetic with golden highlights and elegant composition, no text unless otherwise specified, no blur, no distortion, high quality, premium celebration design";

    console.log("🔧 Fixed Golden Harmony prompt:");
    console.log(fixedPrompt);
    console.log(`Length: ${fixedPrompt.length} characters\n`);

    // Update the prompt
    const updatedPrompt = await prisma.systemPrompt.update({
      where: { id: goldenHarmonyPrompt.id },
      data: {
        content: fixedPrompt,
        version: goldenHarmonyPrompt.version + 1,
        updatedBy: heroUser.id,
        updatedAt: new Date()
      }
    });

    console.log("✅ Golden Harmony prompt updated successfully!");
    console.log(`New version: ${updatedPrompt.version}`);
    console.log(`Updated at: ${updatedPrompt.updatedAt}`);
    console.log(`Characters added: ${fixedPrompt.length - goldenHarmonyPrompt.content.length}`);

    // Test the prompt generation
    console.log("\n🧪 Testing prompt generation...");
    
    // Simulate a wedding event with Golden Harmony style
    const testEventType = 'WEDDING';
    const testEventDetails = {
      style: 'modern',
      colors: 'white and gold',
      venue: 'garden'
    };
    const testStyleName = 'Golden Harmony';
    
    // Import the function
    const { generateEnhancedPromptWithSystemPrompts } = await import('../lib/prompt-generator');
    
    const testPrompt = await generateEnhancedPromptWithSystemPrompts(
      "no text unless otherwise specified, no blur, no distortion, high quality, professional event flyer design",
      testEventType,
      testEventDetails,
      testStyleName
    );

    console.log("🎯 Test generated prompt:");
    console.log(testPrompt);
    console.log(`Length: ${testPrompt.length} characters`);

  } catch (error) {
    console.error('❌ Error fixing Golden Harmony prompt:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixGoldenHarmonyPrompt(); 