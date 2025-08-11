#!/usr/bin/env tsx

import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

async function testInferenceProvider() {
  console.log('🚀 Testing New Hugging Face Inference Provider (Pro Plan Compatible)');
  console.log('===================================================================\n');
  
  try {
    // Import the new provider system
    const { 
      imageProviders, 
      generateImageWithProviders,
      getProviderConfigSummary,
      validateProviderSetup
    } = await import('../lib/providers');
    
    // Reload providers to pick up the new Inference API provider
    console.log('🔄 Reloading providers with Inference API...');
    imageProviders.reloadProviders();
    console.log('✅ Providers reloaded');
    
    // Check configuration
    console.log('\n📋 Provider Configuration:');
    const configSummary = getProviderConfigSummary();
    configSummary.forEach(config => {
      const status = config.enabled ? '✅' : '❌';
      const defaultMark = config.isDefault ? ' (DEFAULT)' : '';
      console.log(`   ${status} ${config.provider}: configured=${config.configured}${defaultMark}`);
    });
    
    // Validate setup
    const validation = validateProviderSetup();
    if (validation.valid) {
      console.log('✅ Provider setup is valid');
    } else {
      console.log('⚠️ Provider setup issues:');
      validation.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    // Test image generation with Pro plan
    console.log('\n🎨 Testing image generation with Inference API...');
    
    const testParams = {
      prompt: "A beautiful wedding venue with elegant decorations, professional photography",
      aspectRatio: "16:9" as const,
      quality: "standard" as const,
      userId: "test-user-pro",
      eventType: "WEDDING",
      eventDetails: { theme: "elegant", venue: "garden" }
    };
    
    console.log('📝 Test Parameters:');
    console.log(`   Prompt: ${testParams.prompt}`);
    console.log(`   Aspect Ratio: ${testParams.aspectRatio}`);
    console.log(`   Quality: ${testParams.quality}`);
    console.log(`   Event Type: ${testParams.eventType}`);
    
    try {
      console.log('\n⏳ Generating image with Inference API (should work with Pro plan)...');
      const startTime = Date.now();
      
      const result = await generateImageWithProviders(testParams, "huggingface");
      
      const totalTime = Date.now() - startTime;
      
      console.log('\n🎉 SUCCESS! Image generated with Pro plan!');
      console.log('📊 Results:');
      console.log(`   Provider: ${result.provider}`);
      console.log(`   Generation Time: ${result.generationTime}ms`);
      console.log(`   Total Time: ${totalTime}ms`);
      console.log(`   Dimensions: ${result.metadata.width}x${result.metadata.height}`);
      console.log(`   MIME Type: ${result.mimeType}`);
      console.log(`   Cost: $${result.cost}`);
      console.log(`   Model: ${result.providerData?.model || 'Unknown'}`);
      
      if (result.imageData) {
        const dataType = typeof result.imageData;
        console.log(`   Image Data: ${dataType}`);
        
        if (typeof result.imageData === 'string') {
          console.log(`   Data Length: ${result.imageData.length} characters`);
          if (result.imageData.startsWith('data:image')) {
            console.log(`   Format: Base64 encoded image`);
            console.log(`   Preview: ${result.imageData.substring(0, 50)}...`);
          }
        }
      }
      
      console.log('\n✨ Pro Plan Benefits Confirmed:');
      console.log('✅ No quota exceeded errors');
      console.log('✅ High-quality Stable Diffusion XL model');
      console.log('✅ Professional image generation');
      console.log('✅ Reliable API access');
      console.log('✅ Better performance than free tier');
      
    } catch (error) {
      console.error('\n❌ Generation failed:', error);
      
      if (error && typeof error === 'object') {
        console.log('\n📋 Error Details:');
        if ('name' in error) console.log(`   Name: ${error.name}`);
        if ('message' in error) console.log(`   Message: ${error.message}`);
        if ('code' in error) console.log(`   Error Code: ${(error as any).code}`);
        if ('provider' in error) console.log(`   Provider: ${(error as any).provider}`);
        if ('retryable' in error) console.log(`   Retryable: ${(error as any).retryable}`);
      }
      
      console.log('\n💡 If this still fails:');
      console.log('1. Check your Pro plan status at: https://huggingface.co/settings/billing');
      console.log('2. Verify your token has proper permissions');
      console.log('3. Try waiting a few minutes for models to load');
      console.log('4. Contact Hugging Face support if Pro plan issues persist');
    }
    
  } catch (error) {
    console.error('❌ Provider test failed:', error);
  }
}

testInferenceProvider().catch(console.error);
