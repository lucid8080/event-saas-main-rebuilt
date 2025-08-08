import { prisma } from "../lib/db";

async function testFullPromptGeneration() {
  try {
    console.log("🧪 Testing Full Prompt Generation...\n");

    // Import the functions
    const { generateEnhancedPromptWithSystemPrompts, generateFullPromptWithSystemPrompts } = await import('../lib/prompt-generator');
    
    // Test data
    const eventType = 'WEDDING';
    const eventDetails = {
      style: 'modern',
      colors: 'white and gold',
      venue: 'garden',
      season: 'spring'
    };
    const styleName = 'Golden Harmony';
    const basePrompt = "no text unless otherwise specified, no blur, no distortion, high quality, professional event flyer design";

    console.log("📋 Test Configuration:");
    console.log(`Event Type: ${eventType}`);
    console.log(`Event Details:`, eventDetails);
    console.log(`Style Preset: ${styleName}`);
    console.log(`Base Prompt: ${basePrompt}\n`);

    // Generate standard prompt
    console.log("🔄 Generating Standard Prompt...");
    const standardPrompt = await generateEnhancedPromptWithSystemPrompts(
      basePrompt,
      eventType,
      eventDetails,
      styleName
    );

    console.log("📝 Standard Prompt:");
    console.log(standardPrompt);
    console.log(`Length: ${standardPrompt.length} characters\n`);

    // Generate full prompt
    console.log("🔄 Generating Full Prompt...");
    const fullPrompt = await generateFullPromptWithSystemPrompts(
      basePrompt,
      eventType,
      eventDetails,
      styleName
    );

    console.log("📝 Full Prompt:");
    console.log(fullPrompt);
    console.log(`Length: ${fullPrompt.length} characters\n`);

    // Compare the two
    console.log("📊 Comparison:");
    console.log(`Standard prompt: ${standardPrompt.length} characters`);
    console.log(`Full prompt: ${fullPrompt.length} characters`);
    console.log(`Difference: ${fullPrompt.length - standardPrompt.length} characters (${Math.round((fullPrompt.length / standardPrompt.length - 1) * 100)}% longer)`);

    // Check if full prompt contains the database prompts
    const hasEventTypePrompt = fullPrompt.includes('[EVENT TYPE PROMPT:');
    const hasStylePrompt = fullPrompt.includes('[STYLE PRESET PROMPT:');

    console.log(`\n✅ Contains Event Type Prompt: ${hasEventTypePrompt ? 'YES' : 'NO'}`);
    console.log(`✅ Contains Style Preset Prompt: ${hasStylePrompt ? 'YES' : 'NO'}`);

    if (hasEventTypePrompt && hasStylePrompt) {
      console.log("\n🎉 Full Prompt Mode is working correctly!");
      console.log("The full prompt includes complete database prompts for testing.");
    } else {
      console.log("\n❌ Full Prompt Mode may have issues:");
      if (!hasEventTypePrompt) console.log("- Missing event type prompt from database");
      if (!hasStylePrompt) console.log("- Missing style preset prompt from database");
    }

  } catch (error) {
    console.error('❌ Error testing full prompt generation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
testFullPromptGeneration();