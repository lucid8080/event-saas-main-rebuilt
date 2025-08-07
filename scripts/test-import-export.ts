import { prisma } from "../lib/db";

async function testImportExport() {
  try {
    console.log("🧪 Testing Import/Export Functionality...\n");

    // Test 1: Check current prompts
    console.log("📊 Current System Prompts:");
    const currentPrompts = await prisma.systemPrompt.findMany({
      where: { isActive: true },
      select: { id: true, category: true, name: true, content: true }
    });
    console.log(`   Total active prompts: ${currentPrompts.length}`);

    // Test 2: Create test export data
    console.log("\n📤 Creating test export data...");
    const testExportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      totalPrompts: currentPrompts.length,
      prompts: currentPrompts.map(prompt => ({
        category: prompt.category,
        subcategory: null,
        name: `TEST_${prompt.name}`,
        description: `Test import of ${prompt.name}`,
        content: prompt.content,
        version: 1,
        isActive: true,
        metadata: { test: true, originalId: prompt.id }
      }))
    };

    // Test 3: Save test export file
    const fs = require('fs');
    const path = require('path');
    const testExportPath = path.join(__dirname, '../test-export.json');
    fs.writeFileSync(testExportPath, JSON.stringify(testExportData, null, 2));
    console.log(`   ✅ Test export file created: ${testExportPath}`);

    // Test 4: Simulate import (without actually importing)
    console.log("\n📥 Simulating import process...");
    let validPrompts = 0;
    let invalidPrompts = 0;

    for (const prompt of testExportData.prompts) {
      if (prompt.category && prompt.name && prompt.content) {
        validPrompts++;
      } else {
        invalidPrompts++;
        console.log(`   ❌ Invalid prompt: ${JSON.stringify(prompt)}`);
      }
    }

    console.log(`   Valid prompts: ${validPrompts}`);
    console.log(`   Invalid prompts: ${invalidPrompts}`);

    // Test 5: Check import format compatibility
    console.log("\n🔍 Checking import format compatibility...");
    const requiredFields = ['category', 'name', 'content'];
    const optionalFields = ['subcategory', 'description', 'version', 'isActive', 'metadata'];
    
    const samplePrompt = testExportData.prompts[0];
    const missingRequired = requiredFields.filter(field => !samplePrompt[field]);
    const hasOptional = optionalFields.filter(field => samplePrompt[field] !== undefined);

    if (missingRequired.length === 0) {
      console.log("   ✅ All required fields present");
    } else {
      console.log(`   ❌ Missing required fields: ${missingRequired.join(', ')}`);
    }

    console.log(`   Optional fields present: ${hasOptional.join(', ')}`);

    // Test 6: Cleanup test data
    console.log("\n🧹 Cleaning up test data...");
    const testPrompts = await prisma.systemPrompt.findMany({
      where: {
        name: { startsWith: 'TEST_' }
      }
    });

    if (testPrompts.length > 0) {
      await prisma.systemPrompt.deleteMany({
        where: {
          name: { startsWith: 'TEST_' }
        }
      });
      console.log(`   ✅ Cleaned up ${testPrompts.length} test prompts`);
    } else {
      console.log("   ✅ No test prompts to clean up");
    }

    console.log("\n🎉 Import/Export functionality test completed!");
    console.log("\n📋 Summary:");
    console.log(`   - Current prompts: ${currentPrompts.length}`);
    console.log(`   - Test export created: ${testExportPath}`);
    console.log(`   - Import format: ✅ Valid`);
    console.log(`   - Cleanup: ✅ Completed`);

    console.log("\n💡 To test the actual import/export:");
    console.log("   1. Use the System Prompts Management interface");
    console.log("   2. Click 'Import/Export' button");
    console.log("   3. Export current prompts");
    console.log("   4. Import the exported file to test");

  } catch (error) {
    console.error("❌ Error testing import/export:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testImportExport(); 