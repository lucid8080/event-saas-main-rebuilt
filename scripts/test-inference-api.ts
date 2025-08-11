#!/usr/bin/env tsx

import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

async function testInferenceAPI() {
  console.log('🧪 Testing Hugging Face Inference API (Alternative to Space)');
  console.log('=========================================================\n');
  
  const token = process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN;
  
  if (!token) {
    console.log('❌ No Hugging Face token found');
    return;
  }
  
  // Try different models/approaches
  const testCases = [
    {
      name: "Stable Diffusion XL",
      model: "stabilityai/stable-diffusion-xl-base-1.0",
      endpoint: "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
    },
    {
      name: "Stable Diffusion 2.1",
      model: "stabilityai/stable-diffusion-2-1",
      endpoint: "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1"
    },
    {
      name: "FLUX.1 (if available)",
      model: "black-forest-labs/FLUX.1-schnell",
      endpoint: "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🔍 Testing ${testCase.name}...`);
    
    try {
      const response = await fetch(testCase.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: "A beautiful sunset over mountains, high quality",
          parameters: {
            guidance_scale: 7.5,
            num_inference_steps: 20
          }
        })
      });
      
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('image')) {
          console.log('   ✅ Success! Image generated');
          console.log('   📊 This model works with your Pro plan');
        } else {
          const text = await response.text();
          console.log(`   📄 Response: ${text.substring(0, 100)}...`);
        }
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Error: ${errorText.substring(0, 200)}...`);
        
        if (errorText.includes('quota') || errorText.includes('limit')) {
          console.log('   ⚠️ Quota issue detected');
        } else if (errorText.includes('loading')) {
          console.log('   ⏳ Model is loading (try again in a few minutes)');
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Network error: ${error}`);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎯 Recommendations:');
  console.log('1. If any model worked ✅: Use that one instead of Qwen Space');
  console.log('2. If all failed with quota ❌: Pro plan might not be active yet');
  console.log('3. Check billing page: https://huggingface.co/settings/billing');
  console.log('4. Contact HF support: https://huggingface.co/support');
  
  console.log('\n💡 Alternative Solution:');
  console.log('We can modify our provider to use Inference API instead of Space API');
  console.log('This might respect your Pro plan quotas better.');
}

testInferenceAPI().catch(console.error);
