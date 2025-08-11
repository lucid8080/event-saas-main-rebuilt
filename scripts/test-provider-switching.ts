#!/usr/bin/env tsx

/**
 * Test script for provider switching functionality
 * Tests the new provider selector and management system
 */

import { imageProviders } from "../lib/providers";

async function testProviderSwitching() {
  console.log("🚀 Testing Provider Switching System\n");

  try {
    // Test 1: Get available providers
    console.log("📋 Test 1: Available Providers");
    const availableProviders = imageProviders.getAvailableProviders();
    console.log(`   Available providers: ${availableProviders.join(", ")}`);
    console.log(`   Total available: ${availableProviders.length}`);
    
    if (availableProviders.length === 0) {
      console.log("   ❌ No providers available - check environment variables");
      return;
    }

    // Test 2: Provider health check
    console.log("\n🏥 Test 2: Provider Health Check");
    const healthStatus = await imageProviders.getProvidersHealth();
    
    for (const [provider, status] of Object.entries(healthStatus)) {
      const icon = status.healthy ? "✅" : "❌";
      console.log(`   ${icon} ${provider}: ${status.healthy ? "Healthy" : "Unhealthy"}`);
      if (!status.healthy && status.lastError) {
        console.log(`      Error: ${status.lastError}`);
      }
    }

    // Test 3: Circuit breaker status
    console.log("\n🔄 Test 3: Circuit Breaker Status");
    const circuitStatus = imageProviders.getCircuitBreakerStatus();
    
    for (const [provider, status] of Object.entries(circuitStatus)) {
      const icon = status.isOpen ? "🔴" : "🟢";
      console.log(`   ${icon} ${provider}: ${status.isOpen ? "Open" : "Closed"} (failures: ${status.failures})`);
    }

    // Test 4: Provider capabilities
    console.log("\n⚙️ Test 4: Provider Capabilities");
    for (const providerType of availableProviders) {
      try {
        const provider = imageProviders.getProvider(providerType);
        const capabilities = provider.getCapabilities();
        
        console.log(`   📊 ${providerType}:`);
        console.log(`      Aspect ratios: ${capabilities.supportedAspectRatios.length}`);
        console.log(`      Qualities: ${capabilities.supportedQualities.join(", ")}`);
        console.log(`      Max prompt length: ${capabilities.maxPromptLength}`);
        console.log(`      Supports seeds: ${capabilities.supportsSeeds}`);
        console.log(`      Cost per image: $${capabilities.pricing.costPerImage}`);
        
      } catch (error) {
        console.log(`   ❌ ${providerType}: Failed to get capabilities - ${error}`);
      }
    }

    // Test 5: Default provider
    console.log("\n🎯 Test 5: Default Provider");
    try {
      const defaultProvider = imageProviders.getDefaultProvider();
      console.log(`   Default provider: ${defaultProvider.getProviderType()}`);
    } catch (error) {
      console.log(`   ❌ Failed to get default provider: ${error}`);
    }

    // Test 6: Test provider switching
    console.log("\n🔄 Test 6: Provider Switching");
    for (const providerType of availableProviders.slice(0, 2)) { // Test first 2 providers
      try {
        const provider = imageProviders.getProvider(providerType);
        console.log(`   ✅ Successfully switched to ${providerType}`);
        
        // Test validation
        const testParams = {
          prompt: "Test prompt for provider switching",
          aspectRatio: "1:1" as const,
          userId: "test-user"
        };
        
        provider.validateParams(testParams);
        console.log(`   ✅ ${providerType}: Parameter validation passed`);
        
      } catch (error) {
        console.log(`   ❌ ${providerType}: Switch failed - ${error}`);
      }
    }

    console.log("\n🎉 Provider switching tests completed!");
    console.log("\n📊 Summary:");
    console.log(`   • ${availableProviders.length} providers available`);
    console.log(`   • ${Object.values(healthStatus).filter(s => s.healthy).length} providers healthy`);
    console.log(`   • ${Object.values(circuitStatus).filter(s => !s.isOpen).length} circuits closed`);

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Environment check
console.log("🔧 Environment Configuration:");
console.log(`   IDEOGRAM_API_KEY: ${process.env.NEXT_PUBLIC_IDEOGRAM_API_KEY ? "✅ Set" : "❌ Missing"}`);
console.log(`   HUGGING_FACE_TOKEN: ${process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN ? "✅ Set" : "❌ Missing"}`);
console.log("");

testProviderSwitching();
