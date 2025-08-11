#!/usr/bin/env tsx

import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

async function testQwenWithDimensions() {
  console.log('🔧 Testing Qwen with Width/Height Parameters');
  console.log('=============================================\n');
  
  try {
    const { InferenceClient } = await import("@huggingface/inference");
    
    const token = process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN;
    const client = new InferenceClient(token);
    
    // Test if Qwen accepts width/height parameters
    console.log('🧪 Testing Qwen with explicit width/height parameters:');
    
    const testCases = [
      { name: "Portrait 4:5", width: 1024, height: 1280, ratio: "4:5" },
      { name: "Story 9:16", width: 768, height: 1344, ratio: "9:16" },
      { name: "Square 1:1", width: 1024, height: 1024, ratio: "1:1" },
      { name: "Landscape 16:9", width: 1344, height: 768, ratio: "16:9" }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📐 Testing ${testCase.name} (${testCase.width}x${testCase.height}):`);
      
      try {
        const image = await client.textToImage({
          provider: "auto",
          model: "Qwen/Qwen-Image",
          inputs: `test image for ${testCase.ratio} aspect ratio`,
          parameters: { 
            num_inference_steps: 10,
            guidance_scale: 4.0,
            width: testCase.width,
            height: testCase.height
          },
        });
        
        console.log(`   ✅ Success with dimensions! Size: ${image.size} bytes`);
        
        // Different file sizes might indicate different dimensions
        if (image.size > 800000) {
          console.log(`   📊 Large file - likely high resolution`);
        } else if (image.size > 600000) {
          console.log(`   📊 Medium file - standard resolution`);
        } else {
          console.log(`   📊 Small file - possibly compressed or square`);
        }
        
      } catch (error: any) {
        if (error.message?.includes('quota')) {
          console.log(`   ⏰ Quota exceeded`);
        } else if (error.message?.includes('width') || error.message?.includes('height')) {
          console.log(`   ❌ Dimensions not supported: ${error.message}`);
        } else {
          console.log(`   ❌ Error: ${error.message}`);
        }
      }
    }
    
    console.log('\n🔍 Alternative: Testing FLUX model for comparison:');
    
    try {
      const fluxImage = await client.textToImage({
        provider: "auto",
        model: "black-forest-labs/FLUX.1-schnell",
        inputs: "test portrait image",
        parameters: { 
          num_inference_steps: 5,
          width: 1024,
          height: 1280
        },
      });
      
      console.log(`   ✅ FLUX with dimensions: ${fluxImage.size} bytes`);
      console.log('   📊 FLUX might support explicit dimensions!');
      
    } catch (error: any) {
      if (error.message?.includes('quota')) {
        console.log(`   ⏰ FLUX quota exceeded`);
      } else {
        console.log(`   ❌ FLUX error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testQwenWithDimensions().catch(console.error);
