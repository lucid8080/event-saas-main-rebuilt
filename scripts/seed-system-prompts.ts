import { prisma } from "../lib/db";
import { getDefaultPrompts } from "../lib/system-prompts";

async function seedSystemPrompts() {
  try {
    console.log("🌱 Seeding system prompts into database...\n");

    // Check if prompts already exist
    const existingCount = await prisma.systemPrompt.count();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing prompts in database.`);
      console.log("💡 This script will add new prompts but won't overwrite existing ones.");
      console.log("");
    }

    // Get default prompts
    const defaultPrompts = getDefaultPrompts();
    const promptEntries = Object.entries(defaultPrompts);

    console.log(`📋 Found ${promptEntries.length} default prompts to seed:`);
    promptEntries.forEach(([key, content], index) => {
      console.log(`   ${index + 1}. ${key}`);
    });
    console.log("");

    // Create admin user for seeding (if needed)
    let adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    });

    if (!adminUser) {
      console.log("⚠️  No admin user found. Creating a temporary admin user for seeding...");
      adminUser = await prisma.user.create({
        data: {
          name: "System Seeder",
          email: "system-seeder@eventcraftai.com",
          role: "ADMIN"
        }
      });
      console.log(`✅ Created temporary admin user: ${adminUser.id}`);
    }

    const createdPrompts = [];
    const skippedPrompts = [];

    // Seed each prompt
    for (const [key, content] of promptEntries) {
      try {
        // Determine category and subcategory from key
        let category = 'system_default';
        let subcategory = null;
        let name = key;

        if (key.includes('_')) {
          const parts = key.split('_');
          if (parts[0] === 'text' && parts[1] === 'generation') {
            category = 'text_generation';
            subcategory = parts[2]; // header, body, cta
            name = `${parts[2]} text generation`;
          } else if (key === 'carousel_background_base') {
            category = 'carousel_background';
            subcategory = 'base';
            name = 'Carousel Background Base';
          } else {
            // Event types
            category = 'event_type';
            subcategory = key;
            name = `${key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())} Event`;
          }
        }

        // Check if prompt already exists
        const existingPrompt = await prisma.systemPrompt.findFirst({
          where: {
            category,
            subcategory: subcategory || null,
            name
          }
        });

        if (existingPrompt) {
          skippedPrompts.push({ key, reason: 'Already exists' });
          continue;
        }

        // Create the prompt
        const prompt = await prisma.systemPrompt.create({
          data: {
            category,
            subcategory: subcategory || null,
            name,
            description: `Default ${category} prompt for ${subcategory || 'general use'}`,
            content,
            version: 1,
            isActive: true,
            metadata: {
              source: 'default',
              seeded: true,
              originalKey: key
            },
            createdBy: adminUser.id,
            updatedBy: adminUser.id
          }
        });

        createdPrompts.push(prompt);
        console.log(`✅ Created: ${name} (${category}/${subcategory || 'none'})`);

      } catch (error) {
        console.error(`❌ Error creating prompt ${key}:`, error);
        skippedPrompts.push({ key, reason: 'Error' });
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 SEEDING SUMMARY:");
    console.log(`   • Created: ${createdPrompts.length} prompts`);
    console.log(`   • Skipped: ${skippedPrompts.length} prompts`);
    console.log(`   • Total in database: ${await prisma.systemPrompt.count()}`);
    console.log("");

    if (createdPrompts.length > 0) {
      console.log("✅ Successfully seeded system prompts!");
      console.log("🎉 The System Prompts Management should now work properly.");
    }

    if (skippedPrompts.length > 0) {
      console.log("⚠️  Skipped prompts:");
      skippedPrompts.forEach(({ key, reason }) => {
        console.log(`   • ${key}: ${reason}`);
      });
    }

    // Clean up temporary admin user if created
    if (adminUser.email === "system-seeder@eventcraftai.com") {
      await prisma.user.delete({
        where: { id: adminUser.id }
      });
      console.log("🧹 Cleaned up temporary admin user.");
    }

  } catch (error) {
    console.error("❌ Error seeding system prompts:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
seedSystemPrompts(); 