#!/usr/bin/env tsx

import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

async function checkHFAccountStatus() {
  console.log('🔍 Checking Hugging Face Account Status');
  console.log('=====================================\n');
  
  const token = process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN;
  
  if (!token) {
    console.log('❌ No Hugging Face token found');
    return;
  }
  
  console.log(`🔑 Token: ${token.substring(0, 10)}...`);
  
  try {
    // Check account info
    console.log('\n📊 Checking account information...');
    const response = await fetch('https://huggingface.co/api/whoami-v2', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Account info retrieved:');
      console.log(`   Name: ${data.name || 'Unknown'}`);
      console.log(`   Type: ${data.type || 'Unknown'}`);
      console.log(`   Plan: ${data.plan || 'Unknown'}`);
      console.log(`   Email verified: ${data.emailVerified || 'Unknown'}`);
      
      if (data.orgs && data.orgs.length > 0) {
        console.log('   Organizations:');
        data.orgs.forEach((org: any) => {
          console.log(`     - ${org.name} (${org.roleInOrg})`);
        });
      }
    } else {
      console.log(`❌ Failed to get account info: ${response.status}`);
      const errorText = await response.text();
      console.log(`   Error: ${errorText}`);
    }
    
    // Check quotas specifically
    console.log('\n⏱️ Checking quota information...');
    
    // Try to get quota info from Spaces API
    try {
      const { Client } = await import("@gradio/client");
      console.log('🔗 Testing Space connection...');
      
      const client = await Client.connect("Qwen/Qwen-Image");
      console.log('✅ Space connected successfully');
      
      // Try a minimal request to see quota response
      console.log('🧪 Testing minimal generation request...');
      
      const result = await client.predict("/infer", {
        prompt: "test",
        seed: 42,
        randomize_seed: false,
        aspect_ratio: "1:1",
        guidance_scale: 4,
        num_inference_steps: 1, // Minimal steps
        prompt_enhance: false
      });
      
      console.log('✅ Generation test successful!');
      console.log('🎉 Your quota should be working now!');
      
    } catch (error: any) {
      if (error.message?.includes('quota')) {
        console.log('❌ Quota still exceeded:');
        console.log(`   ${error.message}`);
        
        // Parse quota info if available
        const quotaMatch = error.message.match(/(\d+)s requested vs\. (\d+)s left/);
        if (quotaMatch) {
          const requested = quotaMatch[1];
          const remaining = quotaMatch[2];
          console.log(`   Requested: ${requested}s`);
          console.log(`   Remaining: ${remaining}s`);
        }
        
        const timeMatch = error.message.match(/Try again in (\d+):(\d+):(\d+)/);
        if (timeMatch) {
          const hours = timeMatch[1];
          const minutes = timeMatch[2];
          const seconds = timeMatch[3];
          console.log(`   Reset in: ${hours}h ${minutes}m ${seconds}s`);
        }
      } else {
        console.log('❌ Other error:', error.message);
      }
    }
    
    console.log('\n💡 Troubleshooting Steps:');
    console.log('1. Check if you\'re on Hugging Face Pro at: https://huggingface.co/settings/billing');
    console.log('2. Verify your token has the right permissions');
    console.log('3. Check if quota resets are working properly');
    console.log('4. Consider using a different Space or model');
    console.log('5. Contact Hugging Face support if plan isn\'t reflecting');
    
  } catch (error) {
    console.error('❌ Error checking account status:', error);
  }
}

checkHFAccountStatus().catch(console.error);
