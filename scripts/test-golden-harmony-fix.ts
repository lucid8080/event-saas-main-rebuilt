import { prisma } from "../lib/db";

async function testGoldenHarmonyFix() {
  try {
    console.log("🧪 Testing Golden Harmony prompt fix...\n");

    // Import the function
    const { generateEnhancedPromptWithSystemPrompts } = await import('../lib/prompt-generator');
    
    // Test cases
    const testCases = [
      {
        name: "Wedding with Golden Harmony",
        eventType: 'WEDDING',
        eventDetails: {
          style: 'modern',
          colors: 'white and gold',
          venue: 'garden'
        },
        styleName: 'Golden Harmony'
      },
      {
        name: "Birthday with Golden Harmony", 
        eventType: 'BIRTHDAY_PARTY',
        eventDetails: {
          age: '30',
          theme: 'elegant',
          venue: 'ballroom'
        },
        styleName: 'Golden Harmony'
      },
      {
        name: "Corporate Event with Golden Harmony",
        eventType: 'CORPORATE_EVENT',
        eventDetails: {
          eventType: 'gala',
          industry: 'luxury',
          venue: 'hotel'
        },
        styleName: 'Golden Harmony'
      }
    ];

    for (const testCase of testCases) {
      console.log(`📝 Test Case: ${testCase.name}`);
      console.log(`Event Type: ${testCase.eventType}`);
      console.log(`Event Details:`, testCase.eventDetails);
      console.log(`Style: ${testCase.styleName}\n`);
      
      const enhancedPrompt = await generateEnhancedPromptWithSystemPrompts(
        "no text unless otherwise specified, no blur, no distortion, high quality, professional event flyer design",
        testCase.eventType,
        testCase.eventDetails,
        testCase.styleName
      );

      console.log(`🎯 Generated Prompt:`);
      console.log(enhancedPrompt);
      console.log(`Length: ${enhancedPrompt.length} characters`);
      console.log('\n' + '='.repeat(80) + '\n');
    }

    // Also test the current Golden Harmony prompt in database
    console.log("📋 Current Golden Harmony prompt in database:");
    const goldenHarmonyPrompt = await prisma.systemPrompt.findFirst({
      where: {
        category: 'style_preset',
        subcategory: 'Golden Harmony',
        isActive: true
      }
    });

    if (goldenHarmonyPrompt) {
      console.log(goldenHarmonyPrompt.content);
      console.log(`Length: ${goldenHarmonyPrompt.content.length} characters`);
      console.log(`Version: ${goldenHarmonyPrompt.version}`);
    }

  } catch (error) {
    console.error('❌ Error testing Golden Harmony fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
testGoldenHarmonyFix(); 