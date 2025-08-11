#!/usr/bin/env tsx

/**
 * Test script to verify default provider selection
 */

import { imageProviders } from "@/lib/providers";
import { providerConfig } from "@/lib/providers/config";

console.log("🔍 Testing Default Provider Selection\n");

try {
  // Get all provider configurations
  const allProviders = providerConfig.getAvailableProviders();
  console.log("📋 Available Providers:");
  for (const provider of allProviders) {
    const config = providerConfig.getProviderConfig(provider.type);
    console.log(`   ${provider.type.padEnd(12)} | Priority: ${config?.priority || 0} | Enabled: ${config?.enabled ? '✅' : '❌'} | Configured: ${provider.configured ? '✅' : '❌'}`);
  }

  // Get the default provider
  const defaultProvider = providerConfig.getDefaultProvider();
  console.log(`\n🎯 Configured Default Provider: ${defaultProvider}`);

  // Test the provider factory
  const factoryDefault = imageProviders.getDefaultProvider();
  console.log(`🏭 Factory Default Provider: ${factoryDefault.getProviderType()}`);

  // Test aspect ratio handling for 9:16
  console.log(`\n📐 Testing 9:16 Aspect Ratio Conversion:`);
  
  const testParams = {
    prompt: "Test birthday party",
    aspectRatio: "9:16" as const,
    userId: "test-user",
    quality: "standard" as const
  };

  // Test Fal-AI provider specifically
  try {
    const falQwenProvider = imageProviders.getProvider("fal-qwen");
    console.log(`   ✅ Fal-AI Qwen provider found`);
    
    const capabilities = falQwenProvider.getCapabilities();
    console.log(`   🔧 Supports 9:16: ${capabilities.supportedAspectRatios.includes("9:16") ? '✅' : '❌'}`);
    console.log(`   📏 Supported ratios: ${capabilities.supportedAspectRatios.join(", ")}`);
    
  } catch (error) {
    console.log(`   ❌ Fal-AI Qwen provider error: ${error}`);
  }

  // Test regular qwen provider for comparison
  try {
    const qwenProvider = imageProviders.getProvider("qwen");
    console.log(`   ✅ Regular Qwen provider found`);
    
    const capabilities = qwenProvider.getCapabilities();
    console.log(`   🔧 Supports 9:16: ${capabilities.supportedAspectRatios.includes("9:16") ? '✅' : '❌'}`);
    
  } catch (error) {
    console.log(`   ❌ Regular Qwen provider error: ${error}`);
  }

  console.log(`\n💡 Summary:`);
  console.log(`   - Default provider should be: fal-qwen (priority 101)`);
  console.log(`   - 9:16 aspect ratio should map to: portrait_16_9`);
  console.log(`   - When no provider is specified, fal-qwen should be used`);

} catch (error) {
  console.error("❌ Test failed:", error);
}
