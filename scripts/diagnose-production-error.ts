#!/usr/bin/env tsx

import { prisma } from "../lib/db";
import { env } from "../env.mjs";

async function diagnoseProductionError() {
  console.log("🔍 Production Error Diagnosis");
  console.log("=============================\n");

  try {
    // 1. Check environment variables
    console.log("1. Environment Variables Check:");
    console.log(`   NEXT_PUBLIC_IDEOGRAM_API_KEY: ${env.NEXT_PUBLIC_IDEOGRAM_API_KEY ? "✅ Set" : "❌ Missing"}`);
    console.log(`   FAL_KEY: ${env.FAL_KEY ? "✅ Set" : "❌ Missing"}`);
    console.log(`   DATABASE_URL: ${env.DATABASE_URL ? "✅ Set" : "❌ Missing"}`);
    console.log(`   R2_ACCESS_KEY_ID: ${env.R2_ACCESS_KEY_ID ? "✅ Set" : "❌ Missing"}`);
    console.log(`   R2_SECRET_ACCESS_KEY: ${env.R2_SECRET_ACCESS_KEY ? "✅ Set" : "❌ Missing"}`);
    console.log(`   R2_BUCKET_NAME: ${env.R2_BUCKET_NAME ? "✅ Set" : "❌ Missing"}`);
    console.log(`   R2_ENDPOINT: ${env.R2_ENDPOINT ? "✅ Set" : "❌ Missing"}`);
    console.log("");

    // 2. Test database connection
    console.log("2. Database Connection Test:");
    try {
      await prisma.$connect();
      console.log("   ✅ Database connection successful");
      
      // Test a simple query
      const userCount = await prisma.user.count();
      console.log(`   ✅ Database query successful - ${userCount} users found`);
    } catch (error) {
      console.log("   ❌ Database connection failed:", error);
    }
    console.log("");

    // 3. Test R2 connection
    console.log("3. R2 Storage Test:");
    try {
      const { S3Client, ListBucketsCommand } = await import("@aws-sdk/client-s3");
      const s3Client = new S3Client({
        region: "auto",
        endpoint: env.R2_ENDPOINT,
        credentials: {
          accessKeyId: env.R2_ACCESS_KEY_ID,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        },
      });
      
      const command = new ListBucketsCommand({});
      await s3Client.send(command);
      console.log("   ✅ R2 connection successful");
    } catch (error) {
      console.log("   ❌ R2 connection failed:", error);
    }
    console.log("");

    // 4. Test Ideogram API key
    console.log("4. Ideogram API Key Test:");
    if (env.NEXT_PUBLIC_IDEOGRAM_API_KEY) {
      try {
        const response = await fetch("https://api.ideogram.ai/v1/ideogram-v3/generate", {
          method: "POST",
          headers: {
            "Api-Key": env.NEXT_PUBLIC_IDEOGRAM_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: "test",
            aspect_ratio: "1x1",
            rendering_speed: "TURBO"
          }),
        });
        
        if (response.status === 401) {
          console.log("   ❌ Ideogram API key is invalid");
        } else if (response.status === 400) {
          console.log("   ✅ Ideogram API key is valid (400 is expected for test request)");
        } else {
          console.log(`   ⚠️  Ideogram API returned status ${response.status}`);
        }
      } catch (error) {
        console.log("   ❌ Ideogram API test failed:", error);
      }
    } else {
      console.log("   ❌ Ideogram API key not configured");
    }
    console.log("");

    // 5. Check provider configuration
    console.log("5. Provider Configuration Test:");
    try {
      const { ProviderManager } = await import("../lib/providers/fallback");
      const providerManager = new ProviderManager();
      console.log("   ✅ Provider manager initialized successfully");
    } catch (error) {
      console.log("   ❌ Provider manager initialization failed:", error);
    }
    console.log("");

    // 6. Test prompt generator
    console.log("6. Prompt Generator Test:");
    try {
      const { generateEnhancedPromptWithSystemPrompts } = await import("../lib/prompt-generator");
      const testPrompt = await generateEnhancedPromptWithSystemPrompts(
        "test prompt",
        "WEDDING",
        { eventName: "Test Wedding", description: "Test description" },
        "default",
        "test style"
      );
      console.log("   ✅ Prompt generator working");
      console.log(`   Sample prompt: ${testPrompt.substring(0, 100)}...`);
    } catch (error) {
      console.log("   ❌ Prompt generator failed:", error);
    }
    console.log("");

    // 7. Test WebP integration
    console.log("7. WebP Integration Test:");
    try {
      const { uploadImageWithWebP } = await import("../lib/webp-integration");
      console.log("   ✅ WebP integration module loaded");
    } catch (error) {
      console.log("   ❌ WebP integration failed:", error);
    }
    console.log("");

    // 8. Test enhanced image naming
    console.log("8. Enhanced Image Naming Test:");
    try {
      const { generatePromptHash } = await import("../lib/enhanced-image-naming");
      const hash = generatePromptHash("test prompt");
      console.log("   ✅ Enhanced image naming working");
      console.log(`   Sample hash: ${hash}`);
    } catch (error) {
      console.log("   ❌ Enhanced image naming failed:", error);
    }
    console.log("");

    console.log("🎯 Diagnosis Complete!");
    console.log("If any tests failed above, those are likely the cause of the production error.");

  } catch (error) {
    console.error("❌ Diagnosis failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseProductionError();
