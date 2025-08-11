#!/usr/bin/env tsx

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function diagnoseAccess() {
  const apiToken = process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN;
  
  if (!apiToken) {
    console.error('❌ Hugging Face API token not found');
    return;
  }

  console.log('🔍 Comprehensive Hugging Face API Diagnosis');
  console.log('============================================');
  console.log(`🔑 Token starts with: ${apiToken.substring(0, 10)}...`);

  try {
    // Test 1: Check if token is valid
    console.log('\n🔍 Test 1: Token Validation');
    const userResponse = await fetch('https://huggingface.co/api/whoami', {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ Token is valid!');
      console.log('👤 User:', userData.name || userData.username);
      console.log('📧 Email:', userData.email);
    } else {
      console.log('❌ Token validation failed:', userResponse.status);
      const errorText = await userResponse.text();
      console.log('📄 Error:', errorText);
      return; // Stop here if token is invalid
    }

    // Test 2: Check what models are available via Inference API
    console.log('\n🔍 Test 2: Available Models via Inference API');
    
    const modelsToTest = [
      'runwayml/stable-diffusion-v1-5',
      'stabilityai/stable-diffusion-xl-base-1.0',
      'CompVis/stable-diffusion-v1-4',
      'Qwen/Qwen-Image'
    ];

    for (const model of modelsToTest) {
      console.log(`\n📋 Testing: ${model}`);
      
      try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
          },
        });

        console.log(`  Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`  ✅ Available via Inference API`);
          console.log(`  📊 Model info: ${data.id || 'Unknown'}`);
        } else if (response.status === 404) {
          console.log(`  ❌ Not available via Inference API (404)`);
        } else {
          const errorText = await response.text();
          console.log(`  ⚠️ Error: ${errorText.substring(0, 100)}...`);
        }
      } catch (error) {
        console.log(`  ❌ Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Test 3: Check Inference API status
    console.log('\n🔍 Test 3: Inference API Status');
    try {
      const statusResponse = await fetch('https://api-inference.huggingface.co/status', {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
      });

      console.log(`Status endpoint response: ${statusResponse.status}`);
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log('📊 API Status:', statusData);
      } else {
        const errorText = await statusResponse.text();
        console.log('❌ Status check failed:', errorText);
      }
    } catch (error) {
      console.log('❌ Status check failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 4: Check if we need to accept model terms
    console.log('\n🔍 Test 4: Model Access Check');
    try {
      const modelInfoResponse = await fetch('https://huggingface.co/api/models/Qwen/Qwen-Image', {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
      });

      if (modelInfoResponse.ok) {
        const modelInfo = await modelInfoResponse.json();
        console.log('✅ Can access model info');
        console.log('📋 Model details:', {
          id: modelInfo.id,
          author: modelInfo.author,
          tags: modelInfo.tags?.slice(0, 5) || [],
          downloads: modelInfo.downloads,
          likes: modelInfo.likes
        });
      } else {
        console.log('❌ Cannot access model info:', modelInfoResponse.status);
        const errorText = await modelInfoResponse.text();
        console.log('📄 Error:', errorText);
      }
    } catch (error) {
      console.log('❌ Model info check failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 5: Check token permissions
    console.log('\n🔍 Test 5: Token Permissions');
    try {
      const permissionsResponse = await fetch('https://huggingface.co/api/whoami', {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
      });

      if (permissionsResponse.ok) {
        const userInfo = await permissionsResponse.json();
        console.log('✅ Token permissions check passed');
        console.log('🔐 User roles:', userInfo.roles || 'No specific roles');
        console.log('📊 Pro status:', userInfo.pro || false);
      } else {
        console.log('❌ Token permissions check failed:', permissionsResponse.status);
      }
    } catch (error) {
      console.log('❌ Permissions check failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    console.log('\n📋 Diagnosis Summary:');
    console.log('=====================');
    console.log('Based on the tests above, here are the possible issues:');
    console.log('');
    console.log('1. 🔑 Token Issues:');
    console.log('   - Check if token has "Read" permissions');
    console.log('   - Verify token hasn\'t expired');
    console.log('   - Ensure token is copied correctly');
    console.log('');
    console.log('2. 🚫 Model Access Issues:');
    console.log('   - Some models may require explicit access approval');
    console.log('   - Check if you need to accept model terms');
    console.log('   - Verify model is available via Inference API');
    console.log('');
    console.log('3. 🔧 API Issues:');
    console.log('   - Inference API might be temporarily unavailable');
    console.log('   - Check Hugging Face service status');
    console.log('   - Verify API endpoint format');
    console.log('');
    console.log('💡 Next Steps:');
    console.log('1. Check your token permissions in Hugging Face settings');
    console.log('2. Try accepting model terms on the model page');
    console.log('3. Consider using a different model that\'s available via Inference API');
    console.log('4. Check Hugging Face service status');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  }
}

diagnoseAccess().catch(console.error);
