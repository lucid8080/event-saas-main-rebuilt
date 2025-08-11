#!/usr/bin/env tsx

import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

async function testQwenAspectRatioReality() {
  console.log('🔍 Testing Qwen Aspect Ratio Reality Check');
  console.log('==========================================\n');
  
  try {
    const { InferenceClient } = await import("@huggingface/inference");
    
    const token = process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN;
    const client = new InferenceClient(token);
    
    // Test different aspect ratios to see what Qwen actually generates
    const testCases = [
      { name: "Square", prompt: "test image, square format, Instagram post style", ratio: "1:1" },
      { name: "Portrait", prompt: "test image, tall portrait format, Instagram portrait style", ratio: "4:5" },
      { name: "Story", prompt: "test image, tall portrait format, vertical mobile screen", ratio: "9:16" },
      { name: "Landscape", prompt: "test image, wide landscape format, cinematic aspect ratio", ratio: "16:9" }
    ];
    
    console.log('🧪 Testing what Qwen actually generates:');
    
    for (const testCase of testCases) {
      console.log(`\n📱 Testing ${testCase.name} (${testCase.ratio}):`);
      console.log(`   Prompt: "${testCase.prompt}"`);
      
      try {
        const image = await client.textToImage({
          provider: "auto",
          model: "Qwen/Qwen-Image", 
          inputs: testCase.prompt,
          parameters: { 
            num_inference_steps: 10,
            guidance_scale: 4.0
          },
        });
        
        // Check actual image dimensions
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Try to determine image dimensions (this is tricky without image libraries)
        console.log(`   ✅ Generated image: ${image.size} bytes, ${image.type}`);
        console.log(`   📏 Image buffer length: ${buffer.length}`);
        
        // We can't easily get dimensions without loading the image
        // But we can see the file size patterns
        if (image.size > 800000) {
          console.log(`   📊 Large file (likely high-res or landscape)`);
        } else if (image.size > 600000) {
          console.log(`   📊 Medium file (likely standard resolution)`);
        } else {
          console.log(`   📊 Small file (likely square or compressed)`);
        }
        
      } catch (error: any) {
        if (error.message?.includes('quota')) {
          console.log(`   ⏰ Quota exceeded (expected)`);
        } else {
          console.log(`   ❌ Error: ${error.message}`);
        }
      }
    }
    
    console.log('\n💡 Key Insight:');
    console.log('🤔 Hugging Face Inference API for Qwen might not support aspect ratio control!');
    console.log('📝 It only accepts: model, inputs, and basic parameters');
    console.log('🎯 Aspect ratio might be controlled ONLY by prompt descriptions');
    
    console.log('\n🔍 Checking Inference API Documentation:');
    console.log('According to HF docs, textToImage parameters for most models:');
    console.log('- num_inference_steps ✅');
    console.log('- guidance_scale ✅');
    console.log('- negative_prompt ✅');
    console.log('- width/height ❓ (model dependent)');
    console.log('- aspect_ratio ❌ (not standard)');
    
    console.log('\n🎯 Potential Solutions:');
    console.log('1. 🔧 Add width/height parameters to Qwen requests');
    console.log('2. 🎨 Improve prompt-based aspect ratio hints');
    console.log('3. 🔄 Use a different model that supports explicit sizing');
    console.log('4. 📐 Post-process images to crop to desired aspect ratio');
    
    console.log('\n⚠️  The Real Issue:');
    console.log('Qwen-Image via Inference API might generate fixed-size images');
    console.log('regardless of our aspect ratio requests!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testQwenAspectRatioReality().catch(console.error);
