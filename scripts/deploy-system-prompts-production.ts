import { prisma } from "../lib/db";

// Import the production prompts data
const productionPrompts = [
  // This will be populated with the actual prompts from your local database
  // For now, this is a template that you can fill with the actual data
];

async function deploySystemPromptsToProduction() {
  try {
    console.log("🚀 Deploying system prompts to production database...\n");

    // Check if prompts already exist
    const existingCount = await prisma.systemPrompt.count();
    console.log(`📊 Found ${existingCount} existing prompts in production database`);

    if (existingCount > 0) {
      console.log("⚠️  Production database already has prompts.");
      console.log("💡 This script will add new prompts but won't overwrite existing ones.");
      console.log("");
    }

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

    let createdCount = 0;
    let skippedCount = 0;

    // Deploy each prompt
    for (const promptData of productionPrompts) {
      try {
        // Check if prompt already exists
        const existingPrompt = await prisma.systemPrompt.findFirst({
          where: {
            category: promptData.category,
            subcategory: promptData.subcategory || null,
            name: promptData.name
          }
        });

        if (existingPrompt) {
          console.log(`   ⏭️  Skipped: ${promptData.name} (already exists)`);
          skippedCount++;
          continue;
        }

        // Create the prompt
        const prompt = await prisma.systemPrompt.create({
          data: {
            category: promptData.category,
            subcategory: promptData.subcategory || null,
            name: promptData.name,
            description: promptData.description || null,
            content: promptData.content,
            version: promptData.version || 1,
            isActive: promptData.isActive !== false,
            metadata: promptData.metadata || {},
            createdBy: adminUser.id,
            updatedBy: adminUser.id
          }
        });

        console.log(`   ✅ Created: ${prompt.name} (${prompt.category})`);
        createdCount++;
      } catch (error) {
        console.error(`   ❌ Failed to create prompt ${promptData.name}:`, error);
      }
    }

    console.log("\n🎉 System prompts deployment completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Created: ${createdCount} prompts`);
    console.log(`   - Skipped: ${skippedCount} prompts (already existed)`);
    console.log(`   - Total in database: ${await prisma.systemPrompt.count()}`);

    // Verify deployment
    console.log("\n🔍 Verification:");
    const activePrompts = await prisma.systemPrompt.count({
      where: { isActive: true }
    });
    console.log(`   - Active prompts: ${activePrompts}`);

    const categories = await prisma.systemPrompt.groupBy({
      by: ['category'],
      _count: { category: true }
    });

    console.log("   - Prompts by category:");
    categories.forEach(cat => {
      console.log(`     ${cat.category}: ${cat._count.category}`);
    });

  } catch (error) {
    console.error("❌ Error deploying system prompts:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the deployment
deploySystemPromptsToProduction(); 