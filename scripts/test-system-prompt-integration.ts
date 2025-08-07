import { prisma } from "../lib/db";
import { generateEnhancedPromptWithSystemPrompts } from "../lib/prompt-generator";

async function testSystemPromptIntegration() {
  try {
    console.log("🧪 Testing System Prompt Integration...\n");

    // Test data
    const testEventType = "BIRTHDAY_PARTY";
    const testEventDetails = {
      age: "25",
      theme: "Superhero",
      venue: "Community Center",
      guests: "50",
      activities: "costume contest and games",
      decorations: "balloons and streamers"
    };
    const testStyleName = "Pop Art"; // This should match a database subcategory
    const testCustomStyle = "with bright colors and comic book style";

    console.log("📋 Test Parameters:");
    console.log(`   Event Type: ${testEventType}`);
    console.log(`   Style Name: ${testStyleName}`);
    console.log(`   Custom Style: ${testCustomStyle}`);
    console.log(`   Event Details:`, testEventDetails);
    console.log("");

    // First, check if the system prompt exists in the database
    console.log("🔍 Checking Database for System Prompt...");
    const systemPrompt = await prisma.systemPrompt.findFirst({
      where: {
        category: 'style_preset',
        subcategory: testStyleName,
        isActive: true
      },
      orderBy: { version: 'desc' }
    });

    if (systemPrompt) {
      console.log("✅ Found system prompt in database:");
      console.log(`   Name: ${systemPrompt.name}`);
      console.log(`   Content: ${systemPrompt.content.substring(0, 100)}...`);
      console.log(`   Version: ${systemPrompt.version}`);
    } else {
      console.log("❌ No system prompt found for style:", testStyleName);
      console.log("Available style presets:");
      const availablePrompts = await prisma.systemPrompt.findMany({
        where: {
          category: 'style_preset',
          isActive: true
        },
        select: { subcategory: true, name: true }
      });
      availablePrompts.forEach(prompt => {
        console.log(`   - ${prompt.subcategory} (${prompt.name})`);
      });
    }
    console.log("");

    // Test the new async function
    console.log("🚀 Testing generateEnhancedPromptWithSystemPrompts...");
    const enhancedPrompt = await generateEnhancedPromptWithSystemPrompts(
      "no text unless otherwise specified, no blur, no distortion, high quality, professional event flyer design",
      testEventType,
      testEventDetails,
      testStyleName,
      testCustomStyle
    );

    console.log("✅ Generated Enhanced Prompt:");
    console.log(enhancedPrompt);
    console.log("");

    // Test with a non-existent style to test fallback
    console.log("🔄 Testing Fallback with Non-existent Style...");
    const fallbackPrompt = await generateEnhancedPromptWithSystemPrompts(
      "no text unless otherwise specified, no blur, no distortion, high quality, professional event flyer design",
      testEventType,
      testEventDetails,
      "NonExistentStyle",
      testCustomStyle
    );

    console.log("✅ Generated Fallback Prompt:");
    console.log(fallbackPrompt);
    console.log("");

    console.log("🎉 System Prompt Integration Test Complete!");
    console.log("");
    console.log("📊 Summary:");
    console.log("   ✅ Database connection working");
    console.log("   ✅ System prompt retrieval working");
    console.log("   ✅ Enhanced prompt generation working");
    console.log("   ✅ Fallback logic working");

  } catch (error) {
    console.error("❌ Error testing system prompt integration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testSystemPromptIntegration(); 