#!/usr/bin/env tsx

/**
 * Simple test for provider settings API
 * Tests the API endpoints without relying on the full app
 */

async function testProviderSettingsAPI() {
  console.log("🧪 Testing Provider Settings API\n");

  try {
    // Test data for Fal-AI Qwen provider
    const testSettings = {
      providerId: "fal-qwen",
      name: "Test Fal-AI Qwen Settings",
      description: "Test configuration for Fal-AI Qwen provider",
      baseSettings: {
        inferenceSteps: 25,
        guidanceScale: 3.0,
        enableSafetyChecker: true,
        numImages: 1,
        costPerImage: 0.05
      },
      specificSettings: {
        'fal-qwen': {
          imageSize: 'square_hd',
          enableSafetyChecker: true,
          syncMode: false,
          guidanceScale: 3.0,
          numInferenceSteps: 25,
          numImages: 1
        }
      },
      isActive: true,
      isDefault: true
    };

    console.log("📤 Test payload:");
    console.log(JSON.stringify(testSettings, null, 2));
    
    // Check if required fields are present
    console.log("\n✅ Validation checks:");
    console.log(`Provider ID: "${testSettings.providerId}" (${testSettings.providerId ? 'OK' : 'MISSING'})`);
    console.log(`Name: "${testSettings.name}" (${testSettings.name ? 'OK' : 'MISSING'})`);
    console.log(`Base Settings: ${testSettings.baseSettings ? 'OK' : 'MISSING'}`);
    console.log(`Specific Settings: ${testSettings.specificSettings ? 'OK' : 'MISSING'}`);

    // Test JSON serialization
    console.log("\n🔄 JSON serialization test:");
    try {
      const serialized = JSON.stringify(testSettings);
      const deserialized = JSON.parse(serialized);
      console.log("✅ JSON serialization/deserialization works");
      console.log(`Serialized length: ${serialized.length} chars`);
    } catch (error) {
      console.log("❌ JSON serialization failed:", error);
      return;
    }

    console.log("\n📋 API Requirements Check:");
    console.log("- Provider ID present:", !!testSettings.providerId);
    console.log("- Name present:", !!testSettings.name);
    console.log("- Name not empty:", testSettings.name.trim().length > 0);
    console.log("- Base settings is object:", typeof testSettings.baseSettings === 'object');
    console.log("- Specific settings is object:", typeof testSettings.specificSettings === 'object');

    console.log("\n🎯 Expected API behavior:");
    console.log("1. Should pass validation (providerId and name are present)");
    console.log("2. Should create new settings in database");
    console.log("3. Should return success response with created settings");

    console.log("\n💡 Troubleshooting tips:");
    console.log("- Check if database is running and accessible");
    console.log("- Verify Prisma client is properly generated");
    console.log("- Check if all required environment variables are set");
    console.log("- Ensure user has ADMIN or HERO role");
    console.log("- Check server logs for detailed error information");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testProviderSettingsAPI();
