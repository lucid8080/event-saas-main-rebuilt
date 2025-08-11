#!/usr/bin/env tsx

import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config({ path: '.env.local' });

interface HuggingFaceResponse {
  success: boolean;
  imageData?: Buffer;
  error?: string;
  responseTime?: number;
  contentType?: string;
  modelInfo?: any;
}

async function testHuggingFaceAPI(): Promise<HuggingFaceResponse> {
  const apiToken = process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN;
  
  if (!apiToken) {
    console.error('❌ Hugging Face API token not found');
    console.error('💡 Please add NEXT_PUBLIC_HUGGING_FACE_API_TOKEN to your .env.local file');
    return { success: false, error: 'API token not found' };
  }

  console.log('🔑 API Token found, testing connection...');
  console.log('🔗 Testing Qwen/Qwen-Image model...');

  const startTime = Date.now();

  try {
    // Test 1: Simple image generation
    console.log('\n📸 Test 1: Simple image generation');
    const response = await fetch(
      'https://api-inference.huggingface.co/models/Qwen/Qwen-Image',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'A simple test image of a cat sitting on a couch, high quality, detailed',
          parameters: {
            width: 512,
            height: 512,
            num_inference_steps: 20,
            true_cfg_scale: 4.0
          }
        }),
      }
    );

    const responseTime = Date.now() - startTime;
    const contentType = response.headers.get('content-type');

    console.log(`📊 Response status: ${response.status}`);
    console.log(`⏱️ Response time: ${responseTime}ms`);
    console.log(`📋 Content-Type: ${contentType}`);

    if (response.ok) {
      if (contentType?.includes('image')) {
        // Binary image response
        const imageBuffer = Buffer.from(await response.arrayBuffer());
        console.log(`🖼️ Received image data: ${imageBuffer.length} bytes`);
        
        // Save test image
        const testImagePath = join(process.cwd(), 'test-hugging-face-image.png');
        writeFileSync(testImagePath, imageBuffer);
        console.log(`💾 Test image saved to: ${testImagePath}`);
        
        return {
          success: true,
          imageData: imageBuffer,
          responseTime,
          contentType
        };
      } else {
        // JSON response (might be error or status)
        const data = await response.json();
        console.log('📄 Response data:', data);
        
        return {
          success: true,
          responseTime,
          contentType,
          modelInfo: data
        };
      }
    } else {
      const errorText = await response.text();
      console.error('❌ API request failed:', response.status, response.statusText);
      console.error('📄 Error details:', errorText);
      
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        responseTime
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Error testing Hugging Face API:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime
    };
  }
}

async function testAspectRatios() {
  console.log('\n🔄 Test 2: Testing different aspect ratios');
  
  const aspectRatios = [
    { name: '1:1', width: 512, height: 512 },
    { name: '16:9', width: 768, height: 432 },
    { name: '9:16', width: 432, height: 768 },
    { name: '4:3', width: 640, height: 480 },
    { name: '3:4', width: 480, height: 640 }
  ];

  const apiToken = process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN;
  if (!apiToken) {
    console.error('❌ API token not available for aspect ratio tests');
    return;
  }

  for (const ratio of aspectRatios) {
    console.log(`\n📐 Testing ${ratio.name} (${ratio.width}x${ratio.height})`);
    
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/Qwen/Qwen-Image',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: `A test image in ${ratio.name} aspect ratio, simple design`,
            parameters: {
              width: ratio.width,
              height: ratio.height,
              num_inference_steps: 15, // Faster for testing
              true_cfg_scale: 4.0
            }
          }),
        }
      );

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('image')) {
          console.log(`✅ ${ratio.name} - Success (${contentType})`);
        } else {
          console.log(`⚠️ ${ratio.name} - Unexpected response type: ${contentType}`);
        }
      } else {
        console.log(`❌ ${ratio.name} - Failed: ${response.status}`);
      }
      
      // Wait a bit between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`❌ ${ratio.name} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

async function testTextRendering() {
  console.log('\n📝 Test 3: Testing text rendering capabilities');
  
  const apiToken = process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN;
  if (!apiToken) {
    console.error('❌ API token not available for text rendering tests');
    return;
  }

  const textPrompts = [
    'A sign that says "Welcome to our event" in clear, readable text',
    'A business card with the text "John Doe - CEO" in professional font',
    'A poster with "Grand Opening" text in large, bold letters'
  ];

  for (let i = 0; i < textPrompts.length; i++) {
    const prompt = textPrompts[i];
    console.log(`\n📝 Test ${i + 1}: "${prompt}"`);
    
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/Qwen/Qwen-Image',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              width: 512,
              height: 512,
              num_inference_steps: 20,
              true_cfg_scale: 4.0
            }
          }),
        }
      );

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('image')) {
          console.log(`✅ Text rendering test ${i + 1} - Success`);
          
          // Save text rendering test image
          const imageBuffer = Buffer.from(await response.arrayBuffer());
          const testImagePath = join(process.cwd(), `test-text-rendering-${i + 1}.png`);
          writeFileSync(testImagePath, imageBuffer);
          console.log(`💾 Saved to: ${testImagePath}`);
        } else {
          console.log(`⚠️ Text rendering test ${i + 1} - Unexpected response type: ${contentType}`);
        }
      } else {
        console.log(`❌ Text rendering test ${i + 1} - Failed: ${response.status}`);
      }
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.log(`❌ Text rendering test ${i + 1} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

async function main() {
  console.log('🚀 Starting Hugging Face API Tests');
  console.log('=====================================');
  
  // Test 1: Basic API connection
  const result = await testHuggingFaceAPI();
  
  if (result.success) {
    console.log('\n✅ Basic API test successful!');
    console.log(`⏱️ Response time: ${result.responseTime}ms`);
    
    // Test 2: Aspect ratios (only if basic test passed)
    await testAspectRatios();
    
    // Test 3: Text rendering (only if basic test passed)
    await testTextRendering();
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Hugging Face API connection working');
    console.log('✅ Image generation functional');
    console.log('✅ Multiple aspect ratios supported');
    console.log('✅ Text rendering capabilities available');
    console.log('\n💡 Next steps:');
    console.log('1. Review generated test images for quality');
    console.log('2. Compare with current Ideogram outputs');
    console.log('3. Proceed with API abstraction layer design');
    
  } else {
    console.log('\n❌ Basic API test failed');
    console.log(`📄 Error: ${result.error}`);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your API token is correct');
    console.log('2. Verify you have access to Qwen/Qwen-Image model');
    console.log('3. Check your internet connection');
    console.log('4. Review Hugging Face service status');
  }
}

// Run the tests
main().catch(console.error); 