#!/usr/bin/env tsx

import { generateImageV2 } from "../actions/generate-image-v2";

async function testProductionFix() {
  console.log("🧪 Testing Production Fix");
  console.log("========================\n");

  try {
    console.log("Testing generateImageV2 with minimal parameters...");
    
    const result = await generateImageV2(
      "test prompt for production",
      "1:1",
      "WEDDING",
      { eventName: "Test Wedding", description: "Test description" },
      "default",
      "test style"
    );

    console.log("✅ Test completed successfully!");
    console.log("Result:", {
      success: result.success,
      imageUrl: result.imageUrl ? "Present" : "Missing",
      provider: result.provider,
      generationTime: result.generationTime,
      cost: result.cost
    });

  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
  }
}

testProductionFix();
