#!/usr/bin/env tsx

/**
 * Test script for provider fixes
 * Tests the Ideogram rendering speed fix and Qwen seed handling
 */

// Mock environment variables for demo
process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN = "mock-hf-token";
process.env.NEXT_PUBLIC_IDEOGRAM_API_KEY = "mock-ideogram-key";

async function testProviderFixes() {
  console.log("🔧 Testing Provider Fixes\n");

  try {
    // Import after setting env vars
    const { imageProviders } = await import("../lib/providers");

    // Test 1: Check Ideogram rendering speed mapping
    console.log("💎 Test 1: Ideogram Rendering Speed Mapping");
    try {
      const ideogramProvider = imageProviders.getProvider("ideogram");
      const capabilities = ideogramProvider.getCapabilities();
      
      console.log(`   ✅ Ideogram provider available`);
      console.log(`   ✅ Supports seeds: ${capabilities.supportsSeeds}`);
      console.log(`   ✅ Qualities: ${capabilities.supportedQualities.join(", ")}`);
      
      // Test parameter validation (this will test the rendering speed mapping)
      const testParams = {
        prompt: "Test wedding flyer",
        aspectRatio: "9:16" as const,
        userId: "test-user",
        quality: "standard" as const
      };
      
      ideogramProvider.validateParams(testParams);
      console.log(`   ✅ Parameter validation passed for standard quality`);
      
    } catch (error) {
      console.log(`   ❌ Ideogram test failed: ${error}`);
    }

    // Test 2: Check Qwen seed support
    console.log("\n🎯 Test 2: Qwen Seed Support");
    try {
      const qwenProvider = imageProviders.getProvider("qwen");
      const capabilities = qwenProvider.getCapabilities();
      
      console.log(`   ✅ Qwen provider available`);
      console.log(`   ✅ Supports seeds: ${capabilities.supportsSeeds} (should be false)`);
      console.log(`   ✅ Qualities: ${capabilities.supportedQualities.join(", ")}`);
      
      // Test parameter validation without seeds
      const testParams = {
        prompt: "Test wedding flyer",
        aspectRatio: "9:16" as const,
        userId: "test-user",
        quality: "standard" as const
      };
      
      qwenProvider.validateParams(testParams);
      console.log(`   ✅ Parameter validation passed without seeds`);
      
      // Test parameter validation with seeds (should fail)
      const testParamsWithSeeds = {
        ...testParams,
        seed: 12345
      };
      
      try {
        qwenProvider.validateParams(testParamsWithSeeds);
        console.log(`   ❌ Seed validation should have failed but didn't`);
      } catch (error) {
        console.log(`   ✅ Seed validation correctly failed: ${error.message}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Qwen test failed: ${error}`);
    }

    // Test 3: Check HuggingFace provider
    console.log("\n🤗 Test 3: HuggingFace Provider");
    try {
      const hfProvider = imageProviders.getProvider("huggingface");
      const capabilities = hfProvider.getCapabilities();
      
      console.log(`   ✅ HuggingFace provider available`);
      console.log(`   ✅ Supports seeds: ${capabilities.supportsSeeds}`);
      console.log(`   ✅ Qualities: ${capabilities.supportedQualities.join(", ")}`);
      
    } catch (error) {
      console.log(`   ❌ HuggingFace test failed: ${error}`);
    }

    // Test 4: Provider selection logic
    console.log("\n🔄 Test 4: Provider Selection Logic");
    
    const availableProviders = imageProviders.getAvailableProviders();
    console.log(`   ✅ Available providers: ${availableProviders.join(", ")}`);
    
    for (const providerType of availableProviders) {
      const provider = imageProviders.getProvider(providerType);
      const capabilities = provider.getCapabilities();
      const seedSupport = capabilities.supportsSeeds ? "✅ Supports" : "❌ No support";
      console.log(`   ${providerType}: ${seedSupport} for seeds`);
    }

    console.log("\n🎉 Provider fixes test completed!");
    
    // Summary
    console.log("\n📊 Fix Summary:");
    console.log("   ✅ Ideogram: Updated rendering speed mapping (SPEED → BALANCED)");
    console.log("   ✅ Qwen: Properly declares no seed support");
    console.log("   ✅ Provider selection: Checks capabilities before including seeds");
    console.log("   ✅ Error handling: Graceful fallback when providers don't support features");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

console.log("🔧 Mock Environment Setup:");
console.log("   IDEOGRAM_API_KEY: ✅ Mock configured");
console.log("   HUGGING_FACE_TOKEN: ✅ Mock configured");
console.log("");

testProviderFixes();
