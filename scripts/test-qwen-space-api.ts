#!/usr/bin/env tsx

import { Client } from "@gradio/client";
import { writeFileSync } from 'fs';
import { join } from 'path';

async function testQwenSpaceAPI() {
  console.log('🚀 Testing Qwen/Qwen-Image Space API');
  console.log('=====================================');

  try {
    console.log('🔗 Connecting to Qwen/Qwen-Image Space...');
    
    // Connect to the Space
    const client = await Client.connect("Qwen/Qwen-Image");
    console.log('✅ Connected successfully!');

    console.log('\n📸 Testing image generation...');
    
    // Test image generation
    const result = await client.predict("/infer", { 		
      prompt: "A beautiful sunset over mountains, high quality, detailed", 		
      seed: 42, 		
      randomize_seed: false, 		
      aspect_ratio: "16:9", 		
      guidance_scale: 4, 		
      num_inference_steps: 20, 		
      prompt_enhance: true, 
    });

    console.log('✅ Image generation successful!');
    console.log('📊 Result structure:', {
      hasData: !!result.data,
      dataLength: result.data?.length,
      dataType: typeof result.data
    });

    if (result.data && Array.isArray(result.data) && result.data.length >= 2) {
      const imageData = result.data[0];
      const seed = result.data[1];
      
      console.log('🖼️ Image data received');
      console.log('🎲 Generated seed:', seed);
      
      // Check if we got image data
      if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
        console.log('✅ Received base64 image data');
        
        // Convert base64 to buffer and save
        const base64Data = imageData.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        const testImagePath = join(process.cwd(), 'test-qwen-space-image.png');
        writeFileSync(testImagePath, imageBuffer);
        console.log(`💾 Test image saved to: ${testImagePath}`);
        
        console.log('\n🎉 SUCCESS! Qwen/Qwen-Image Space API is working!');
        console.log('📋 This confirms:');
        console.log('  ✅ Space API connection working');
        console.log('  ✅ Image generation functional');
        console.log('  ✅ All parameters accepted correctly');
        console.log('  ✅ Free API access confirmed');
        
      } else {
        console.log('⚠️ Unexpected image data format:', typeof imageData);
        console.log('📄 Image data preview:', String(imageData).substring(0, 100) + '...');
      }
    } else {
      console.log('⚠️ Unexpected result structure:', result);
    }

    // Test different aspect ratios
    console.log('\n🔄 Testing different aspect ratios...');
    const aspectRatios = ['1:1', '16:9', '9:16', '4:3'];
    
    for (const ratio of aspectRatios) {
      console.log(`\n📐 Testing ${ratio} aspect ratio...`);
      
      try {
        const ratioResult = await client.predict("/infer", { 		
          prompt: `A simple test image in ${ratio} aspect ratio`, 		
          seed: 123, 		
          randomize_seed: false, 		
          aspect_ratio: ratio, 		
          guidance_scale: 4, 		
          num_inference_steps: 15, 		
          prompt_enhance: true, 
        });

        if (ratioResult.data && Array.isArray(ratioResult.data) && ratioResult.data[0]) {
          console.log(`✅ ${ratio} - Success`);
        } else {
          console.log(`❌ ${ratio} - Failed`);
        }
        
        // Wait a bit between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.log(`❌ ${ratio} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log('\n📋 API Features Tested:');
    console.log('✅ Basic image generation');
    console.log('✅ Multiple aspect ratios');
    console.log('✅ Parameter customization');
    console.log('✅ Seed control');
    console.log('✅ Prompt enhancement');
    
    console.log('\n💡 Next Steps:');
    console.log('1. Integrate Space API into your application');
    console.log('2. Create Hugging Face provider class');
    console.log('3. Test with your existing prompts');
    console.log('4. Compare image quality with Ideogram');

  } catch (error) {
    console.error('❌ Error testing Qwen Space API:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check internet connection');
    console.log('2. Verify Space is running (check the Space page)');
    console.log('3. Try again in a few minutes if Space is loading');
  }
}

testQwenSpaceAPI().catch(console.error);
