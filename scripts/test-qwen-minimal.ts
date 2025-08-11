#!/usr/bin/env tsx

import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

async function testQwenMinimal() {
  console.log('🎯 Testing Qwen with Minimal Settings');
  console.log('===================================\n');
  
  try {
    const { Client } = await import("@gradio/client");
    
    console.log('🔗 Connecting to Qwen/Qwen-Image Space...');
    const client = await Client.connect("Qwen/Qwen-Image");
    
    console.log('📝 Testing with ultra-minimal settings...');
    
    try {
      const result = await client.predict("/infer", {
        prompt: "cat",
        seed: 42,
        randomize_seed: false,
        aspect_ratio: "1:1", // Smallest aspect ratio
        guidance_scale: 4,
        num_inference_steps: 5, // Ultra minimal
        prompt_enhance: false
      });
      
      console.log('🎉 SUCCESS! Qwen worked with minimal settings!');
      console.log('📊 Result:', result.data);
      
      // Check if we got an image
      if (result.data && result.data[0]) {
        console.log('✅ Image URL received:', result.data[0].substring(0, 50) + '...');
        console.log('✅ This confirms Qwen is working when quota allows!');
      }
      
    } catch (error: any) {
      if (error.message?.includes('quota')) {
        console.log('❌ Still quota exceeded even with minimal settings');
        console.log(`📊 Error: ${error.message}`);
        
        console.log('\n🔍 Analysis:');
        console.log('• Even 5 inference steps require too much GPU time');
        console.log('• Qwen Space has very limited free quota');
        console.log('• Your only options are:');
        console.log('  1. Wait for quota reset (7+ hours)');
        console.log('  2. Use the excellent fallback (Stable Diffusion XL)');
        
      } else {
        console.log('❌ Different error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error);
  }
}

testQwenMinimal().catch(console.error);
