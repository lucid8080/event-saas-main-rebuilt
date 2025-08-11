#!/usr/bin/env tsx

import { prisma } from "../lib/db";
import { env } from "../env.mjs";

async function diagnoseUpscaleIssue() {
  console.log("🔍 Upscale Issue Diagnosis");
  console.log("========================\n");

  try {
    // 1. Check environment variables
    console.log("1. Environment Variables Check:");
    console.log(`   FAL_KEY: ${env.FAL_KEY ? "✅ Set" : "❌ Missing"}`);
    console.log(`   R2_ACCESS_KEY_ID: ${env.R2_ACCESS_KEY_ID ? "✅ Set" : "❌ Missing"}`);
    console.log(`   R2_SECRET_ACCESS_KEY: ${env.R2_SECRET_ACCESS_KEY ? "✅ Set" : "❌ Missing"}`);
    console.log(`   R2_BUCKET_NAME: ${env.R2_BUCKET_NAME ? "✅ Set" : "❌ Missing"}`);
    console.log(`   R2_ENDPOINT: ${env.R2_ENDPOINT ? "✅ Set" : "❌ Missing"}`);
    console.log("");

    // 2. Check for HOLIDAY_CELEBRATION images
    console.log("2. HOLIDAY_CELEBRATION Images Check:");
    const holidayImages = await prisma.generatedImage.findMany({
      where: {
        eventType: "HOLIDAY_CELEBRATION"
      },
      select: {
        id: true,
        userId: true,
        url: true,
        r2Key: true,
        isUpscaled: true,
        originalImageId: true,
        upscaledImageId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    });

    if (holidayImages.length === 0) {
      console.log("   ❌ No HOLIDAY_CELEBRATION images found");
    } else {
      console.log(`   ✅ Found ${holidayImages.length} HOLIDAY_CELEBRATION images`);
      holidayImages.forEach((image, index) => {
        console.log(`   ${index + 1}. ID: ${image.id}`);
        console.log(`      User ID: ${image.userId}`);
        console.log(`      Is Upscaled: ${image.isUpscaled}`);
        console.log(`      Has Original: ${!!image.originalImageId}`);
        console.log(`      Has Upscaled: ${!!image.upscaledImageId}`);
        console.log(`      R2 Key: ${image.r2Key ? "✅" : "❌"}`);
        console.log(`      Created: ${image.createdAt.toISOString()}`);
        console.log("");
      });
    }

    // 3. Check user credits
    console.log("3. User Credits Check:");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        credits: true,
        role: true
      },
      orderBy: {
        credits: "desc"
      },
      take: 5
    });

    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role}): ${user.credits} credits`);
    });
    console.log("");

    // 4. Check recent upscale attempts
    console.log("4. Recent Upscale Activity:");
    const recentUpscaled = await prisma.generatedImage.findMany({
      where: {
        isUpscaled: true,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      select: {
        id: true,
        userId: true,
        eventType: true,
        createdAt: true,
        provider: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    });

    if (recentUpscaled.length === 0) {
      console.log("   ❌ No recent upscale activity in last 24 hours");
    } else {
      console.log(`   ✅ Found ${recentUpscaled.length} recent upscales`);
      recentUpscaled.forEach((upscale, index) => {
        console.log(`   ${index + 1}. ${upscale.eventType} - ${upscale.provider} - ${upscale.createdAt.toISOString()}`);
      });
    }
    console.log("");

    // 5. Check for any upscale errors in database
    console.log("5. Database Health Check:");
    const totalImages = await prisma.generatedImage.count();
    const upscaledImages = await prisma.generatedImage.count({
      where: { isUpscaled: true }
    });
    const originalImages = await prisma.generatedImage.count({
      where: { isUpscaled: false }
    });

    console.log(`   Total Images: ${totalImages}`);
    console.log(`   Original Images: ${originalImages}`);
    console.log(`   Upscaled Images: ${upscaledImages}`);
    console.log(`   Upscale Rate: ${((upscaledImages / totalImages) * 100).toFixed(1)}%`);
    console.log("");

    // 6. Check for orphaned upscaled images
    console.log("6. Orphaned Images Check:");
    const orphanedUpscaled = await prisma.generatedImage.findMany({
      where: {
        isUpscaled: true,
        originalImageId: null
      },
      select: {
        id: true,
        userId: true,
        eventType: true,
        createdAt: true
      }
    });

    if (orphanedUpscaled.length === 0) {
      console.log("   ✅ No orphaned upscaled images found");
    } else {
      console.log(`   ⚠️  Found ${orphanedUpscaled.length} orphaned upscaled images`);
      orphanedUpscaled.forEach((image, index) => {
        console.log(`   ${index + 1}. ${image.eventType} - ${image.createdAt.toISOString()}`);
      });
    }
    console.log("");

    // 7. Test FAL API connectivity
    console.log("7. FAL API Connectivity Test:");
    if (env.FAL_KEY) {
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
          console.log("   ✅ FAL API is accessible");
        } else {
          const errorText = await testResponse.text();
          console.log(`   ❌ FAL API error: ${testResponse.status} - ${errorText}`);
        }
      } catch (error) {
        console.log(`   ❌ FAL API connection failed: ${error}`);
      }
    } else {
      console.log("   ❌ FAL_KEY not configured");
    }
    console.log("");

    console.log("🔍 Diagnosis Complete");
    console.log("===================");
    console.log("If you're experiencing upscaling issues, check the following:");
    console.log("1. Ensure you have sufficient credits");
    console.log("2. Verify the image belongs to your account");
    console.log("3. Check that FAL API key is configured");
    console.log("4. Ensure R2 storage is properly configured");
    console.log("5. Check browser console for any JavaScript errors");

  } catch (error) {
    console.error("❌ Diagnosis failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the diagnosis
diagnoseUpscaleIssue().catch(console.error);
