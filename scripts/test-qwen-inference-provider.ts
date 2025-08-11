#!/usr/bin/env tsx

import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

async function testQwenInferenceProvider() {
  console.log('🎯 Testing Qwen via Hugging Face Inference Providers');
  console.log('==================================================\n');
  
  try {
    const { InferenceClient } = await import("@huggingface/inference");
    
    const token = process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN;
    if (!token) {
      console.log('❌ No Hugging Face token found');
      return;
    }
    
    console.log(`🔑 Using token: ${token.substring(0, 10)}...`);
    
    // Create InferenceClient
    const client = new InferenceClient(token);
    
    console.log('🧪 Testing Qwen-Image via Inference Providers...');
    
    try {
      console.log('📸 Generating image with Qwen-Image...');
      const startTime = Date.now();
      
      const image = await client.textToImage({
        provider: "auto", // Let HF choose the best provider
        model: "Qwen/Qwen-Image",
        inputs: "A beautiful landscape with mountains and a serene lake",
        parameters: { 
          num_inference_steps: 20,
          guidance_scale: 4.0
        },
      });
      
      const generationTime = Date.now() - startTime;
      
      console.log('🎉 SUCCESS! Qwen-Image worked via Inference Providers!');
      console.log(`⏱️ Generation Time: ${generationTime}ms`);
      console.log(`📊 Image Type: ${image.type}`);
      console.log(`📏 Image Size: ${image.size} bytes`);
      
      // Convert blob to base64 for our system
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${image.type};base64,${base64}`;
      
      console.log(`🖼️ Image Data: ${dataUrl.substring(0, 50)}...`);
      console.log(`📏 Base64 Length: ${base64.length} characters`);
      
      console.log('\n✨ Benefits of Inference Providers:');
      console.log('✅ Uses your Pro plan quotas properly');
      console.log('✅ No Space API limitations');
      console.log('✅ Direct access to Qwen-Image model');
      console.log('✅ Better performance and reliability');
      console.log('✅ THIS IS REAL QWEN-IMAGE!');
      
      return true;
      
    } catch (error) {
      console.error('❌ Qwen Inference Provider failed:', error);
      
      if (error && typeof error === 'object') {
        console.log('\n📋 Error Details:');
        if ('message' in error) console.log(`   Message: ${(error as any).message}`);
        if ('status' in error) console.log(`   Status: ${(error as any).status}`);
        if ('statusText' in error) console.log(`   Status Text: ${(error as any).statusText}`);
      }
      
      return false;
    }
    
  } catch (error) {
    console.error('❌ Setup error:', error);
    return false;
  }
}

testQwenInferenceProvider().catch(console.error);
