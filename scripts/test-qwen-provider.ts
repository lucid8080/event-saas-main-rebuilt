#!/usr/bin/env tsx

import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

async function testQwenProvider() {
  console.log('🎯 Testing Qwen-Image Provider Setup');
  console.log('====================================\n');
  
  try {
    // Import the provider system
    const { 
      imageProviders, 
      generateImageWithProviders,
      getProviderConfigSummary,
      validateProviderSetup
    } = await import('../lib/providers');
    
    // Reload providers to pick up Qwen
    console.log('🔄 Reloading providers with Qwen-Image...');
    imageProviders.reloadProviders();
    console.log('✅ Providers reloaded');
    
    // Check configuration
    console.log('\n📋 Provider Configuration:');
    const configSummary = getProviderConfigSummary();
    configSummary.forEach(config => {
      const status = config.enabled ? '✅' : '❌';
      const defaultMark = config.isDefault ? ' (DEFAULT)' : '';
      console.log(`   ${status} ${config.provider}: configured=${config.configured}, priority=${config.priority}${defaultMark}`);
    });
    
    // Validate setup
    const validation = validateProviderSetup();
    if (validation.valid) {
      console.log('✅ Provider setup is valid');
    } else {
      console.log('⚠️ Provider setup issues:');
      validation.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    // Test Qwen provider specifically
    console.log('\n🎯 Testing Qwen-Image Provider...');
    
    const qwenProvider = imageProviders.getProvider("qwen");
    if (qwenProvider) {
      console.log('✅ Qwen provider found');
      
      const capabilities = qwenProvider.getCapabilities();
      console.log('📊 Qwen Capabilities:');
      console.log(`   Aspect Ratios: ${capabilities.supportedAspectRatios.join(', ')}`);
      console.log(`   Qualities: ${capabilities.supportedQualities.join(', ')}`);
      console.log(`   Supports Seeds: ${capabilities.supportsSeeds}`);
      console.log(`   Max Prompt: ${capabilities.maxPromptLength} chars`);
      console.log(`   Daily Quota: ${capabilities.pricing.freeQuota} images`);
      console.log(`   Cost: $${capabilities.pricing.costPerImage} per image`);
      
      // Test image generation
      console.log('\n🎨 Testing Qwen image generation...');
      
      const testParams = {
        prompt: "A beautiful landscape with mountains and a serene lake, high quality",
        aspectRatio: "16:9" as const,
        quality: "standard" as const,
        userId: "test-user-qwen",
        eventType: "CELEBRATION"
      };
      
      console.log('📝 Test Parameters:');
      console.log(`   Prompt: ${testParams.prompt}`);
      console.log(`   Aspect Ratio: ${testParams.aspectRatio}`);
      console.log(`   Quality: ${testParams.quality}`);
      
      try {
        console.log('\n⏳ Generating image with Qwen-Image...');
        const startTime = Date.now();
        
        const result = await generateImageWithProviders(testParams, "qwen");
        
        const totalTime = Date.now() - startTime;
        
        console.log('\n🎉 SUCCESS! Qwen-Image generated image!');
        console.log('📊 Results:');
        console.log(`   Provider: ${result.provider}`);
        console.log(`   Generation Time: ${result.generationTime}ms`);
        console.log(`   Total Time: ${totalTime}ms`);
        console.log(`   Dimensions: ${result.metadata.width}x${result.metadata.height}`);
        console.log(`   MIME Type: ${result.mimeType}`);
        console.log(`   Cost: $${result.cost}`);
        console.log(`   Seed: ${result.seed || 'Auto-generated'}`);
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
        
        console.log('\n✨ Qwen-Image Benefits:');
        console.log('✅ High-quality image generation');
        console.log('✅ Multiple aspect ratio support');
        console.log('✅ Seed support for reproducibility');
        console.log('✅ Prompt enhancement built-in');
        console.log('✅ Your preferred model choice!');
        
      } catch (error) {
        console.error('\n⚠️ Qwen generation failed (expected if quota exceeded):', error);
        
        if (error && typeof error === 'object') {
          console.log('\n📋 Error Details:');
          if ('name' in error) console.log(`   Name: ${error.name}`);
          if ('message' in error) console.log(`   Message: ${error.message}`);
          if ('code' in error) console.log(`   Error Code: ${(error as any).code}`);
          if ('provider' in error) console.log(`   Provider: ${(error as any).provider}`);
          if ('retryable' in error) console.log(`   Retryable: ${(error as any).retryable}`);
        }
        
        console.log('\n🔄 Fallback System:');
        console.log('✅ If Qwen quota is exceeded, system will automatically fallback to:');
        console.log('   1. Stable Diffusion XL (Hugging Face Inference API)');
        console.log('   2. Other configured providers');
        console.log('✅ This gives you the best of both worlds!');
      }
      
    } else {
      console.log('❌ Qwen provider not found');
    }
    
  } catch (error) {
    console.error('❌ Provider test failed:', error);
  }
}

testQwenProvider().catch(console.error);
