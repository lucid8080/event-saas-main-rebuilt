#!/usr/bin/env tsx

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function testToken() {
  const apiToken = process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN;
  
  if (!apiToken) {
    console.error('❌ Hugging Face API token not found');
    console.error('💡 Please add NEXT_PUBLIC_HUGGING_FACE_API_TOKEN to your .env.local file');
    return;
  }

  console.log('🔑 API Token found, testing basic authentication...');
  console.log(`📝 Token starts with: ${apiToken.substring(0, 10)}...`);

  try {
    // Test 1: Check if token is valid by accessing user info
    console.log('\n🔍 Test 1: Checking token validity...');
    const userResponse = await fetch('https://huggingface.co/api/whoami', {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ Token is valid!');
      console.log('👤 User info:', userData);
    } else {
      console.log('❌ Token validation failed:', userResponse.status);
      const errorText = await userResponse.text();
      console.log('📄 Error details:', errorText);
    }

    // Test 2: Check model access
    console.log('\n🔍 Test 2: Checking model access...');
    const modelResponse = await fetch('https://huggingface.co/api/models/Qwen/Qwen-Image', {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
    });

    if (modelResponse.ok) {
      const modelData = await modelResponse.json();
      console.log('✅ Model access successful!');
      console.log('📋 Model info:', {
        id: modelData.id,
        author: modelData.author,
        tags: modelData.tags?.slice(0, 5) || []
      });
    } else {
      console.log('❌ Model access failed:', modelResponse.status);
      const errorText = await modelResponse.text();
      console.log('📄 Error details:', errorText);
    }

    // Test 3: Try a different model to see if it's a general API issue
    console.log('\n🔍 Test 3: Testing with a different model...');
    const testResponse = await fetch(
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

    console.log('📊 Test model response status:', testResponse.status);
    if (testResponse.ok) {
      console.log('✅ Test model works - issue is specific to Qwen/Qwen-Image');
    } else {
      const errorText = await testResponse.text();
      console.log('❌ Test model also failed:', errorText);
    }

  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

testToken().catch(console.error);
