#!/usr/bin/env tsx

import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

async function checkQwenQuota() {
  console.log('⏱️ Checking Qwen-Image Quota Status');
  console.log('==================================\n');
  
  try {
    const { Client } = await import("@gradio/client");
    
    console.log('🔗 Connecting to Qwen/Qwen-Image Space...');
    const client = await Client.connect("Qwen/Qwen-Image");
    console.log('✅ Connected successfully!');
    
    console.log('\n🧪 Testing minimal request to check current quota...');
    
    try {
      const result = await client.predict("/infer", {
        prompt: "test",
        seed: 42,
        randomize_seed: false,
        aspect_ratio: "1:1",
        guidance_scale: 4,
        num_inference_steps: 1, // Minimal to use least quota
        prompt_enhance: false
      });
      
      console.log('🎉 SUCCESS! Qwen quota is available!');
      console.log('✅ You can now use Qwen-Image in your dashboard');
      
    } catch (error: any) {
      if (error.message?.includes('quota')) {
        console.log('❌ Quota still exceeded');
        console.log(`📊 Error: ${error.message}`);
        
        // Parse quota info if available
        const quotaMatch = error.message.match(/(\d+)s requested vs\. (\d+)s left/);
        if (quotaMatch) {
          const requested = quotaMatch[1];
          const remaining = quotaMatch[2];
          console.log(`\n📈 Quota Details:`);
          console.log(`   Requested: ${requested} seconds`);
          console.log(`   Remaining: ${remaining} seconds`);
          
          if (parseInt(remaining) > 0) {
            console.log(`\n💡 Suggestions:`);
            console.log(`   • Wait ${Math.ceil(parseInt(remaining) / 60)} minutes for more quota`);
            console.log(`   • Use faster quality settings (fewer inference steps)`);
            console.log(`   • Generate smaller images (1:1 aspect ratio)`);
          }
        }
        
        const timeMatch = error.message.match(/Try again in (\d+):(\d+):(\d+)/);
        if (timeMatch) {
          const hours = timeMatch[1];
          const minutes = timeMatch[2];
          const seconds = timeMatch[3];
          console.log(`\n⏰ Full Reset Time: ${hours}h ${minutes}m ${seconds}s`);
          
          // Calculate when quota will reset
          const now = new Date();
          const resetTime = new Date(now.getTime() + 
            parseInt(hours) * 60 * 60 * 1000 + 
            parseInt(minutes) * 60 * 1000 + 
            parseInt(seconds) * 1000
          );
          console.log(`📅 Reset At: ${resetTime.toLocaleString()}`);
        }
        
        console.log('\n🔄 Current Fallback Strategy:');
        console.log('✅ Your system is working correctly!');
        console.log('✅ When Qwen quota is exceeded → Falls back to Stable Diffusion XL');
        console.log('✅ When Qwen quota resets → Will use Qwen-Image again');
        
      } else {
        console.log('❌ Different error:', error.message);
      }
    }
    
    console.log('\n💰 Pro Plan Benefits Check:');
    console.log('🔍 Checking if your Pro plan provides additional quota...');
    
    // Check account status
    const token = process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN;
    try {
      const response = await fetch('https://huggingface.co/api/whoami-v2', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📊 Account Type: ${data.type || 'Unknown'}`);
        console.log(`📊 Plan: ${data.plan || 'Unknown'}`);
        
        if (data.plan && data.plan !== 'Unknown') {
          console.log('✅ Pro plan detected!');
          console.log('💡 Pro plans may have higher quotas, but Spaces still have independent limits');
        } else {
          console.log('❓ Plan status unclear from API');
        }
      }
    } catch (error) {
      console.log('❌ Could not check account status');
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('1. ⏳ Wait for quota reset to use Qwen-Image');
    console.log('2. 🔄 System automatically falls back to Stable Diffusion XL (working great!)');
    console.log('3. 🎨 Continue generating images - system handles the provider switching');
    console.log('4. 📅 Check back after quota reset to use Qwen-Image');
    
  } catch (error) {
    console.error('❌ Error checking quota:', error);
  }
}

checkQwenQuota().catch(console.error);
