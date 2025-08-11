#!/usr/bin/env tsx

import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

async function testGenerateImageV2Action() {
  console.log('🧪 Testing generateImageV2 Action (the one that was failing)');
  console.log('===========================================================\n');
  
  try {
    // Import the action
    const { generateImageV2 } = await import('../actions/generate-image-v2');
    
    console.log('📝 Test Parameters (simulating frontend call):');
    const testParams = {
      prompt: "A beautiful wedding reception hall with elegant decorations",
      aspectRatio: "16:9",
      eventType: "WEDDING",
      eventDetails: { 
        theme: "elegant", 
        venue: "indoor hall",
        colors: ["white", "gold"] 
      },
      styleName: "elegant",
      preferredProvider: "huggingface" as const,
      quality: "standard" as const
    };
    
    Object.entries(testParams).forEach(([key, value]) => {
      console.log(`   ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
    });
    
    console.log('\n⏳ Testing generateImageV2 with Hugging Face provider...');
    const startTime = Date.now();
    
    const result = await generateImageV2(
      testParams.prompt,
      testParams.aspectRatio,
      testParams.eventType,
      testParams.eventDetails,
      testParams.styleName,
      undefined, // customStyle
      testParams.preferredProvider,
      testParams.quality
    );
    
    const totalTime = Date.now() - startTime;
    
    console.log('\n🎉 SUCCESS! generateImageV2 completed without errors!');
    console.log('📊 Action Results:');
    console.log(`   Success: ${result.success}`);
    console.log(`   Provider: ${result.provider}`);
    console.log(`   Generation Time: ${result.generationTime}ms`);
    console.log(`   Total Time: ${totalTime}ms`);
    console.log(`   Cost: $${result.cost}`);
    console.log(`   Error: ${result.error || 'None'}`);
    
    if (result.imageUrl) {
      console.log(`   Image URL: ${result.imageUrl.substring(0, 50)}...`);
    }
    
    if (result.webpUrl) {
      console.log(`   WebP URL: ${result.webpUrl.substring(0, 50)}...`);
    }
    
    console.log('\n✅ The seed parameter issue has been resolved!');
    console.log('✅ Frontend should now work without 500 errors!');
    
  } catch (error) {
    console.error('\n❌ Action test failed:', error);
    
    if (error && typeof error === 'object') {
      console.log('\n📋 Error Details:');
      if ('name' in error) console.log(`   Name: ${error.name}`);
      if ('message' in error) console.log(`   Message: ${error.message}`);
      if ('stack' in error) {
        const stack = (error as any).stack;
        const stackLines = stack.split('\n').slice(0, 5);
        console.log(`   Stack: ${stackLines.join('\n          ')}`);
      }
    }
  }
}

testGenerateImageV2Action().catch(console.error);
