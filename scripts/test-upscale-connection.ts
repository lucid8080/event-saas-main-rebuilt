#!/usr/bin/env tsx

import { env } from "../env.mjs";

async function testUpscaleConnection() {
  console.log("🔍 Testing Upscale Connection");
  console.log("============================\n");

  try {
    // Check if FAL_KEY is available
    console.log("1. FAL API Key Check:");
    if (env.FAL_KEY) {
      console.log("   ✅ FAL_KEY is configured");
      console.log(`   Key length: ${env.FAL_KEY.length} characters`);
      console.log(`   Key starts with: ${env.FAL_KEY.substring(0, 8)}...`);
    } else {
      console.log("   ❌ FAL_KEY is not configured");
      console.log("   Please check your .env.local file");
      return;
    }
    console.log("");

    // Test FAL API connectivity
    console.log("2. FAL API Connectivity Test:");
    try {
      const testResponse = await fetch("https://fal.run/fal-ai/clarity-upscaler", {
        method: "POST",
        headers: {
          "Authorization": `Key ${env.FAL_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: "https://via.placeholder.com/512x512.png",
          prompt: "test",
          upscale_factor: 2
        })
      });

      if (testResponse.ok) {
        console.log("   ✅ FAL API is accessible and responding");
        const responseData = await testResponse.json();
        console.log("   Response received successfully");
      } else {
        const errorText = await testResponse.text();
        console.log(`   ❌ FAL API error: ${testResponse.status} - ${errorText}`);
      }
    } catch (error) {
      console.log(`   ❌ FAL API connection failed: ${error}`);
    }
    console.log("");

    console.log("3. Environment Summary:");
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`   Next.js will load .env.local automatically`);
    console.log("");

    console.log("✅ Test Complete");
    console.log("===============");
    console.log("If FAL_KEY is configured and API is accessible,");
    console.log("upscaling should work properly in your application.");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testUpscaleConnection().catch(console.error);
