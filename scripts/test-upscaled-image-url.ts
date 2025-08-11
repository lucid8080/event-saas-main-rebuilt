#!/usr/bin/env tsx

import { prisma } from "../lib/db";

async function testUpscaledImageUrl() {
  console.log("🔍 Testing Upscaled Image URL");
  console.log("============================\n");

  try {
    // Get the most recent upscaled image
    const upscaledImage = await prisma.generatedImage.findFirst({
      where: {
        isUpscaled: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        url: true,
        r2Key: true,
        eventType: true,
        createdAt: true,
        originalImageId: true
      }
    });

    if (!upscaledImage) {
      console.log("❌ No upscaled images found in database");
      return;
    }

    console.log("1. Upscaled Image Details:");
    console.log(`   ID: ${upscaledImage.id}`);
    console.log(`   Event Type: ${upscaledImage.eventType}`);
    console.log(`   Created: ${upscaledImage.createdAt.toISOString()}`);
    console.log(`   Original Image ID: ${upscaledImage.originalImageId}`);
    console.log(`   R2 Key: ${upscaledImage.r2Key ? '✅ Present' : '❌ Missing'}`);
    console.log(`   URL: ${upscaledImage.url.substring(0, 100)}...`);
    console.log("");

    // Test the upscaled image URL
    console.log("2. Testing Upscaled Image URL:");
    try {
      const response = await fetch(upscaledImage.url);
      
      if (response.ok) {
        console.log("   ✅ Upscaled image URL is accessible");
        console.log(`   Status: ${response.status}`);
        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
        console.log(`   Content-Length: ${response.headers.get('content-length')} bytes`);
        
        // Check if it's actually an image
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.startsWith('image/')) {
          console.log("   ✅ URL returns a valid image");
        } else {
          console.log("   ❌ URL does not return an image");
        }
      } else {
        console.log(`   ❌ Upscaled image URL failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ Error accessing upscaled image URL: ${error}`);
    }
    console.log("");

    // Get the original image for comparison
    if (upscaledImage.originalImageId) {
      const originalImage = await prisma.generatedImage.findUnique({
        where: {
          id: upscaledImage.originalImageId
        },
        select: {
          id: true,
          url: true,
          r2Key: true
        }
      });

      if (originalImage) {
        console.log("3. Original Image Comparison:");
        console.log(`   Original ID: ${originalImage.id}`);
        console.log(`   Original URL: ${originalImage.url.substring(0, 100)}...`);
        console.log(`   Original R2 Key: ${originalImage.r2Key ? '✅ Present' : '❌ Missing'}`);
        console.log("");

        // Test the original image URL
        console.log("4. Testing Original Image URL:");
        try {
          const response = await fetch(originalImage.url);
          
          if (response.ok) {
            console.log("   ✅ Original image URL is accessible");
            console.log(`   Status: ${response.status}`);
            console.log(`   Content-Type: ${response.headers.get('content-type')}`);
            console.log(`   Content-Length: ${response.headers.get('content-length')} bytes`);
          } else {
            console.log(`   ❌ Original image URL failed: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.log(`   ❌ Error accessing original image URL: ${error}`);
        }
      }
    }

    console.log("");
    console.log("✅ Test Complete");
    console.log("===============");
    console.log("If both URLs are accessible and return images,");
    console.log("the slim bar issue might be a display/layout problem.");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testUpscaledImageUrl().catch(console.error);
