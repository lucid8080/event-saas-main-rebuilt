#!/usr/bin/env tsx

/**
 * Debug script to check provider priority and configuration
 */

import { providerConfig } from "@/lib/providers/config";

console.log("🔍 Debugging Provider Priority and Configuration\n");

// Get all configurations
const configs = [
  { type: "ideogram", config: providerConfig.getProviderConfig("ideogram") },
  { type: "fal-qwen", config: providerConfig.getProviderConfig("fal-qwen") },
  { type: "qwen", config: providerConfig.getProviderConfig("qwen") },
  { type: "huggingface", config: providerConfig.getProviderConfig("huggingface") },
  { type: "stability", config: providerConfig.getProviderConfig("stability") }
];

console.log("📋 All Provider Configurations:");
console.log("=".repeat(80));

for (const { type, config } of configs) {
  if (config) {
    console.log(`${type.toUpperCase().padEnd(12)} | Priority: ${config.priority.toString().padStart(3)} | Enabled: ${config.enabled ? '✅' : '❌'} | Has API Key: ${config.apiKey ? '✅' : '❌'}`);
    console.log(`${' '.repeat(15)}Base URL: ${config.baseUrl}`);
    if (config.options) {
      console.log(`${' '.repeat(15)}Options: ${JSON.stringify(config.options)}`);
    }
    console.log("");
  } else {
    console.log(`${type.toUpperCase().padEnd(12)} | ❌ Not configured`);
    console.log("");
  }
}

// Check environment variables
console.log("🔑 Environment Variables Check:");
console.log("=".repeat(50));
console.log(`NEXT_PUBLIC_IDEOGRAM_API_KEY: ${process.env.NEXT_PUBLIC_IDEOGRAM_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`FAL_KEY: ${process.env.FAL_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`NEXT_PUBLIC_HUGGING_FACE_API_TOKEN: ${process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN ? '✅ Set' : '❌ Missing'}`);
console.log(`STABILITY_API_KEY: ${process.env.STABILITY_API_KEY ? '✅ Set' : '❌ Missing'}`);

// Simulate the default provider selection logic
console.log("\n🎯 Default Provider Selection Logic:");
console.log("=".repeat(50));

const availableProviders = configs
  .filter(({ config }) => config?.enabled)
  .map(({ type, config }) => ({ type, priority: config!.priority, hasApiKey: !!config!.apiKey }));

console.log("Available providers (enabled only):");
availableProviders.forEach(({ type, priority, hasApiKey }) => {
  console.log(`   ${type.padEnd(12)} | Priority: ${priority} | API Key: ${hasApiKey ? '✅' : '❌'}`);
});

// Sort by priority (highest first)
availableProviders.sort((a, b) => b.priority - a.priority);

console.log("\nSorted by priority (highest first):");
availableProviders.forEach(({ type, priority, hasApiKey }) => {
  console.log(`   ${type.padEnd(12)} | Priority: ${priority} | API Key: ${hasApiKey ? '✅' : '❌'}`);
});

const topProvider = availableProviders[0];
console.log(`\n🏆 Selected Default Provider: ${topProvider?.type || 'None'}`);

// Get the actual default
try {
  const actualDefault = providerConfig.getDefaultProvider();
  console.log(`📌 Actual Configured Default: ${actualDefault}`);
} catch (error) {
  console.log(`❌ Error getting default: ${error}`);
}
