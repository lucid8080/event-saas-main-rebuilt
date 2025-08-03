import { prisma } from "../lib/db";
import { getDefaultPrompts } from "../lib/system-prompts";

async function fixEventTypePrompts() {
  try {
    console.log("🔧 Fixing event type prompts categorization...\n");

    // Get all current prompts
    const currentPrompts = await prisma.systemPrompt.findMany({
      where: { category: 'event_type' }
    });

    console.log(`📋 Current event type prompts: ${currentPrompts.length}`);
    currentPrompts.forEach(prompt => {
      console.log(`   • ${prompt.name} (${prompt.subcategory})`);
    });

    // Get default prompts
    const defaultPrompts = getDefaultPrompts();
    
    // Define all event types that should exist
    const eventTypes = [
      'BIRTHDAY_PARTY',
      'WEDDING', 
      'CORPORATE_EVENT',
      'HOLIDAY_CELEBRATION',
      'CONCERT',
      'SPORTS_EVENT',
      'NIGHTLIFE',
      'FAMILY_GATHERING',
      'BBQ',
      'PARK_GATHERING',
      'COMMUNITY_EVENT',
      'FUNDRAISER',
      'WORKSHOP',
      'MEETUP',
      'CELEBRATION',
      'REUNION',
      'POTLUCK',
      'GAME_NIGHT',
      'BOOK_CLUB',
      'ART_CLASS',
      'FITNESS_CLASS',
      'BREAKDANCING',
      'POTTERY',
      'OTHER'
    ];

    console.log(`\n📝 Expected event types: ${eventTypes.length}`);
    eventTypes.forEach(type => {
      console.log(`   • ${type}`);
    });

    // Get admin user for creating prompts
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    });

    if (!adminUser) {
      console.log("❌ No admin user found. Cannot create prompts.");
      return;
    }

    const createdPrompts = [];
    const updatedPrompts = [];

    // Process each event type
    for (const eventType of eventTypes) {
      try {
        // Check if prompt already exists for this event type
        const existingPrompt = await prisma.systemPrompt.findFirst({
          where: {
            category: 'event_type',
            subcategory: eventType
          }
        });

        if (existingPrompt) {
          console.log(`✅ Already exists: ${eventType}`);
          continue;
        }

        // Get the prompt content from default prompts
        const promptContent = defaultPrompts[eventType];
        
        if (!promptContent) {
          console.log(`⚠️  No default prompt found for: ${eventType}`);
          continue;
        }

        // Create the prompt
        const prompt = await prisma.systemPrompt.create({
          data: {
            category: 'event_type',
            subcategory: eventType,
            name: `${eventType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())} Event`,
            description: `Default prompt for ${eventType.replace(/_/g, ' ').toLowerCase()} events`,
            content: promptContent,
            version: 1,
            isActive: true,
            metadata: {
              source: 'default',
              seeded: true,
              originalKey: eventType
            },
            createdBy: adminUser.id,
            updatedBy: adminUser.id
          }
        });

        createdPrompts.push(prompt);
        console.log(`✅ Created: ${eventType}`);

      } catch (error) {
        console.error(`❌ Error creating prompt for ${eventType}:`, error);
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 FIX SUMMARY:");
    console.log(`   • Created: ${createdPrompts.length} new event type prompts`);
    console.log(`   • Updated: ${updatedPrompts.length} existing prompts`);
    console.log(`   • Total event type prompts: ${await prisma.systemPrompt.count({ where: { category: 'event_type' } })}`);
    console.log("");

    if (createdPrompts.length > 0) {
      console.log("✅ Successfully fixed event type prompts!");
      console.log("🎉 All event types should now be available in the System Prompts Management.");
    }

  } catch (error) {
    console.error("❌ Error fixing event type prompts:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixEventTypePrompts(); 