#!/usr/bin/env tsx

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function testEndpoints() {
  const apiToken = process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN;
  
  if (!apiToken) {
    console.error('❌ Hugging Face API token not found');
    return;
  }

  console.log('🔍 Testing different Hugging Face API endpoints...');

  const endpoints = [
    {
      name: 'Standard Inference API',
      url: 'https://api-inference.huggingface.co/models/Qwen/Qwen-Image',
      method: 'POST',
      body: {
        inputs: 'A simple test image',
        parameters: {
          width: 512,
          height: 512,
          num_inference_steps: 20,
          true_cfg_scale: 4.0
        }
      }
    },
    {
      name: 'Alternative Inference API',
      url: 'https://api-inference.huggingface.co/models/Qwen/Qwen-Image',
      method: 'POST',
      body: {
        inputs: 'A simple test image'
      }
    },
    {
      name: 'Model Info API',
      url: 'https://huggingface.co/api/models/Qwen/Qwen-Image',
      method: 'GET',
      body: null
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n🔗 Testing: ${endpoint.name}`);
    console.log(`📡 URL: ${endpoint.url}`);
    
    try {
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          ...(endpoint.method === 'POST' && { 'Content-Type': 'application/json' })
        },
        ...(endpoint.body && { body: JSON.stringify(endpoint.body) })
      });

      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        console.log(`📋 Content-Type: ${contentType}`);
        
        if (contentType?.includes('image')) {
          console.log('✅ Received image data!');
        } else if (contentType?.includes('json')) {
          const data = await response.json();
          console.log('📄 Response data:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
        } else {
          const text = await response.text();
          console.log('📄 Response text:', text.substring(0, 200) + '...');
        }
      } else {
        const errorText = await response.text();
        console.log('❌ Error:', errorText);
      }
      
    } catch (error) {
      console.log('❌ Request failed:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Test with a known working model for comparison
  console.log('\n🔗 Testing with known working model (Stable Diffusion)...');
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'A simple test image',
        }),
      }
    );

    console.log(`📊 Stable Diffusion Status: ${response.status} ${response.statusText}`);
    if (response.ok) {
      console.log('✅ Stable Diffusion works - Qwen-Image might have specific requirements');
    } else {
      const errorText = await response.text();
      console.log('❌ Stable Diffusion also failed:', errorText);
    }
  } catch (error) {
    console.log('❌ Stable Diffusion test failed:', error instanceof Error ? error.message : 'Unknown error');
  }
}

testEndpoints().catch(console.error);
