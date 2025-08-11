#!/usr/bin/env tsx

import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config({ path: '.env.local' });

async function testWorkingModel() {
  const apiToken = process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN;
  
  if (!apiToken) {
    console.error('❌ Hugging Face API token not found');
    return;
  }

  console.log('🔑 Testing with a known working model...');

  // Test with Stable Diffusion v1.5 (known to work with Inference API)
  const modelUrl = 'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5';
  
  try {
    console.log('📸 Generating test image with Stable Diffusion...');
    
    const response = await fetch(modelUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: 'A beautiful sunset over mountains, high quality, detailed',
      }),
    });

    console.log(`📊 Response status: ${response.status}`);
    console.log(`📋 Content-Type: ${response.headers.get('content-type')}`);

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('image')) {
        const imageBuffer = Buffer.from(await response.arrayBuffer());
        console.log(`🖼️ Received image data: ${imageBuffer.length} bytes`);
        
        // Save test image
        const testImagePath = join(process.cwd(), 'test-stable-diffusion-image.png');
        writeFileSync(testImagePath, imageBuffer);
        console.log(`💾 Test image saved to: ${testImagePath}`);
        
        console.log('\n✅ SUCCESS! Hugging Face Inference API is working!');
        console.log('📋 This confirms:');
        console.log('  ✅ Your API token is valid');
        console.log('  ✅ You have access to the Inference API');
        console.log('  ✅ Image generation is working');
        console.log('\n💡 The issue is that Qwen/Qwen-Image is not available via Inference API');
        console.log('🔍 We need to find an alternative approach for Qwen/Qwen-Image');
        
      } else {
        const data = await response.json();
        console.log('📄 Response data:', data);
      }
    } else {
      const errorText = await response.text();
      console.error('❌ API request failed:', response.status, response.statusText);
      console.error('📄 Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Error testing working model:', error);
  }
}

testWorkingModel().catch(console.error);
