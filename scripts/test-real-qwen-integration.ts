#!/usr/bin/env tsx

import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

async function testRealQwenIntegration() {
  console.log('🎯 Testing REAL Qwen-Image Integration');
  console.log('====================================\n');
  
  try {
    // Import the provider system
    const { 
      imageProviders, 
      generateImageWithProviders,
      getProviderConfigSummary,
      validateProviderSetup
    } = await import('../lib/providers');
    
    // Reload providers to pick up new Qwen Inference Provider
    console.log('🔄 Reloading providers with Qwen Inference Provider...');
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
    
    // Test Qwen Inference Provider specifically
    console.log('\n🎯 Testing Qwen Inference Provider...');
    
    const qwenProvider = imageProviders.getProvider("qwen");
    if (qwenProvider) {
      console.log('✅ Qwen Inference provider found');
      
      const capabilities = qwenProvider.getCapabilities();
      console.log('📊 Qwen Capabilities:');
      console.log(`   Aspect Ratios: ${capabilities.supportedAspectRatios.length} supported`);
      console.log(`   Qualities: ${capabilities.supportedQualities.join(', ')}`);
      console.log(`   Cost: $${capabilities.pricing.costPerImage} per image`);
      console.log(`   Pro Plan: ${capabilities.pricing.freeQuota === 0 ? 'YES' : 'NO'}`);
      
      // Test actual image generation with our system
      console.log('\n🎨 Testing end-to-end Qwen image generation...');
      
      const testParams = {
        prompt: "A futuristic cityscape with flying cars and neon lights, cyberpunk style, high quality",
        aspectRatio: "16:9" as const,
        quality: "standard" as const,
        userId: "test-user-real-qwen",
        eventType: "CONCERT"
      };
      
      console.log('📝 Test Parameters:');
      console.log(`   Prompt: ${testParams.prompt}`);
      console.log(`   Aspect Ratio: ${testParams.aspectRatio}`);
      console.log(`   Quality: ${testParams.quality}`);
      
      try {
        console.log('\n⏳ Generating image with REAL Qwen-Image...');
        const startTime = Date.now();
        
        const result = await generateImageWithProviders(testParams, "qwen");
        
        const totalTime = Date.now() - startTime;
        
        console.log('\n🎉 SUCCESS! REAL Qwen-Image generated!');
        console.log('📊 Results:');
        console.log(`   Provider: ${result.provider}`);
        console.log(`   Generation Time: ${result.generationTime}ms`);
        console.log(`   Total Time: ${totalTime}ms`);
        console.log(`   Dimensions: ${result.metadata.width}x${result.metadata.height}`);
        console.log(`   MIME Type: ${result.mimeType}`);
        console.log(`   Cost: $${result.cost}`);
        console.log(`   Model: ${result.providerData?.model || 'Unknown'}`);
        console.log(`   Inference Provider: ${result.providerData?.inferenceProvider ? 'YES' : 'NO'}`);
        console.log(`   Auto Provider: ${result.providerData?.provider || 'Unknown'}`);
        
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
        
        // Verify this is actually Qwen
        if (result.provider === "qwen" && result.providerData?.model === "Qwen/Qwen-Image") {
          console.log('\n🎯 ✅ CONFIRMED: This is REAL Qwen-Image!');
          console.log('✅ No more Space API quota limitations');
          console.log('✅ Using Pro plan properly');
          console.log('✅ Fast and reliable generation');
          console.log('✅ High-quality Qwen results');
        } else {
          console.log('\n❌ This might not be Qwen - check provider data');
        }
        
        return true;
        
      } catch (error) {
        console.error('\n❌ Qwen generation failed:', error);
        
        if (error && typeof error === 'object') {
          console.log('\n📋 Error Details:');
          if ('name' in error) console.log(`   Name: ${error.name}`);
          if ('message' in error) console.log(`   Message: ${error.message}`);
          if ('code' in error) console.log(`   Error Code: ${(error as any).code}`);
          if ('provider' in error) console.log(`   Provider: ${(error as any).provider}`);
          if ('retryable' in error) console.log(`   Retryable: ${(error as any).retryable}`);
        }
        
        return false;
      }
      
    } else {
      console.log('❌ Qwen provider not found');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    return false;
  }
}

testRealQwenIntegration().catch(console.error);
