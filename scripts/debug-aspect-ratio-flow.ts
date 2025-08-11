#!/usr/bin/env tsx

import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

async function debugAspectRatioFlow() {
  console.log('🔍 Debugging Aspect Ratio Flow - End to End');
  console.log('============================================\n');
  
  try {
    // Test what the frontend would actually send
    console.log('1. Testing Frontend getAspectRatio Function:');
    
    // Simulate the shapes
    const shapes = [
      { id: 1, aspect: "16:9", name: "Landscape" },
      { id: 4, aspect: "9:16", name: "Instagram Story" },
      { id: 6, aspect: "4:5", name: "Instagram Portrait" },
      { id: 7, aspect: "5:7", name: "Greeting Card" },
    ];
    
    // Simulate the getAspectRatio function exactly as in frontend
    const getAspectRatio = (selectedShape: any) => {
      if (!selectedShape) return "1:1";
      if (selectedShape.aspect === "16:9") return "16:9";
      if (selectedShape.aspect === "4:3") return "4:3";
      if (selectedShape.aspect === "1:1") return "1:1";
      if (selectedShape.aspect === "9:16") return "9:16";
      if (selectedShape.aspect === "3:4") return "3:4";
      if (selectedShape.aspect === "4:5") return "4:5";
      if (selectedShape.aspect === "5:7") return "5:7";
      if (selectedShape.aspect === "2:3") return "2:3";
      return "1:1";
    };
    
    shapes.forEach(shape => {
      const result = getAspectRatio(shape);
      console.log(`   ${shape.name}: ${shape.aspect} → ${result}`);
    });
    
    console.log('\n2. Testing generateImageV2 Action:');
    
    // Import the actual action
    const { generateImageV2 } = await import('../actions/generate-image-v2');
    
    // Test with Instagram Portrait (4:5) - a commonly failing one
    const testShape = shapes.find(s => s.aspect === "4:5");
    const aspectRatio = getAspectRatio(testShape);
    
    console.log(`   Testing with: ${testShape?.name} (${aspectRatio})`);
    console.log(`   Calling generateImageV2 with aspectRatio: "${aspectRatio}"`);
    
    try {
      const result = await generateImageV2(
        "test image for aspect ratio debugging",
        aspectRatio, // This is what the frontend sends
        "CELEBRATION",
        { theme: "test" },
        "minimalist",
        undefined, // customStyle
        "qwen", // preferredProvider
        "fast" // quality
      );
      
      console.log('\n3. ✅ generateImageV2 Success:');
      console.log(`   Provider: ${result.provider}`);
      console.log(`   Success: ${result.success}`);
      console.log(`   Generation Time: ${result.generationTime}ms`);
      console.log(`   Cost: $${result.cost}`);
      
      if (result.imageUrl) {
        console.log(`   Image URL: ${result.imageUrl.substring(0, 50)}...`);
        console.log('   ✅ Image generated successfully!');
        
        // The key question: what dimensions did we actually get?
        console.log('\n4. 🎯 Critical Check - Actual Dimensions:');
        console.log('   Expected for 4:5: ~1024x1280');
        console.log('   Need to check actual image dimensions...');
        console.log('   (Check the generated image in your dashboard)');
        
      } else {
        console.log('   ❌ No image URL returned');
      }
      
    } catch (error: any) {
      console.error('\n❌ generateImageV2 failed:', error.message);
      
      if (error.message?.includes('quota')) {
        console.log('   This is just a quota issue, not an aspect ratio problem');
      }
    }
    
    console.log('\n5. 🔍 Checking Provider Capabilities:');
    const { imageProviders } = await import('../lib/providers');
    imageProviders.reloadProviders();
    
    const qwenProvider = imageProviders.getProvider("qwen");
    if (qwenProvider) {
      const capabilities = qwenProvider.getCapabilities();
      console.log(`   Qwen supports 4:5: ${capabilities.supportedAspectRatios.includes("4:5")}`);
      console.log(`   All supported ratios: ${capabilities.supportedAspectRatios.join(', ')}`);
    }
    
    console.log('\n6. 💡 Debugging Questions:');
    console.log('   ❓ Are you selecting the shape in the UI?');
    console.log('   ❓ Is the shape selection showing as selected (purple border)?');
    console.log('   ❓ When you generate, what dimensions do you actually get?');
    console.log('   ❓ Are you using Qwen as the provider (not falling back to SDXL)?');
    
    console.log('\n7. 🎯 Next Steps:');
    console.log('   1. Generate an image in the dashboard');
    console.log('   2. Check the browser console for the aspect ratio being sent');
    console.log('   3. Download the image and check its actual dimensions');
    console.log('   4. Verify which provider was actually used');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugAspectRatioFlow().catch(console.error);
