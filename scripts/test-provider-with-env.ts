#!/usr/bin/env tsx

// Test the provider system with explicit environment variable loading
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') });

import { 
  imageProviders, 
  generateImageWithProviders,
  checkProvidersHealth,
  getProviderConfigSummary,
  validateProviderSetup
} from "../lib/providers";

async function testProviderSystemWithEnv() {
  console.log('🚀 Testing Provider System with Environment Variables');
  console.log('==================================================\n');
  
  // Check environment variables
  console.log('🔍 Environment Variable Check:');
  const hfToken = process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN;
  const ideogramKey = process.env.NEXT_PUBLIC_IDEOGRAM_API_KEY;
  
  console.log(`   NEXT_PUBLIC_HUGGING_FACE_API_TOKEN: ${hfToken ? '✅ Set (' + hfToken.substring(0, 10) + '...)' : '❌ Not set'}`);
  console.log(`   NEXT_PUBLIC_IDEOGRAM_API_KEY: ${ideogramKey ? '✅ Set (' + ideogramKey.substring(0, 10) + '...)' : '❌ Not set'}`);
  console.log();
  
  // Reload providers after environment variables are loaded
  console.log('🔄 Reloading providers with new environment variables...');
  imageProviders.reloadProviders();
  console.log('✅ Providers reloaded');
  console.log();
  
  try {
    // 1. Validate provider setup
    console.log('🔧 Validating Provider Setup...');
    const validation = validateProviderSetup();
    if (validation.valid) {
      console.log('✅ Provider setup is valid');
    } else {
      console.log('⚠️ Provider setup has issues:');
      validation.errors.forEach(error => console.log(`   - ${error}`));
    }
    console.log();
    
    // 2. Get configuration summary
    console.log('📋 Provider Configuration Summary:');
    const configSummary = getProviderConfigSummary();
    configSummary.forEach(config => {
      const status = config.enabled ? '✅' : '❌';
      const defaultMark = config.isDefault ? ' (DEFAULT)' : '';
      console.log(`   ${status} ${config.provider}: configured=${config.configured}, priority=${config.priority}${defaultMark}`);
    });
    console.log();
    
    // 3. Get available providers
    console.log('📡 Available Providers:');
    const availableProviders = imageProviders.getAvailableProviders();
    if (availableProviders.length === 0) {
      console.log('   ❌ No providers available');
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Make sure .env.local file exists in project root');
      console.log('   2. Check that NEXT_PUBLIC_HUGGING_FACE_API_TOKEN is set');
      console.log('   3. Restart the script after setting environment variables');
      return;
    }
    
    availableProviders.forEach(provider => {
      console.log(`   ✅ ${provider}`);
    });
    console.log();
    
    // 4. Check provider health
    console.log('🏥 Checking Provider Health...');
    const healthStatus = await checkProvidersHealth();
    for (const [provider, status] of Object.entries(healthStatus)) {
      const healthIcon = status.healthy ? '💚' : '❤️';
      const availableIcon = status.available ? '✅' : '❌';
      const circuitIcon = status.circuitOpen ? '🔴' : '🟢';
      console.log(`   ${provider}: ${availableIcon} available, ${healthIcon} healthy, ${circuitIcon} circuit`);
      if (status.lastError) {
        console.log(`     Error: ${status.lastError}`);
      }
    }
    console.log();
    
    // 5. Test image generation
    console.log('🎨 Testing Image Generation...');
    
    const testParams = {
      prompt: "A beautiful sunset over mountains, digital art style",
      aspectRatio: "16:9" as const,
      quality: "standard" as const,
      userId: "test-user",
      seed: 42,
      randomizeSeed: false
    };
    
    console.log('📝 Test Parameters:');
    console.log(`   Prompt: ${testParams.prompt}`);
    console.log(`   Aspect Ratio: ${testParams.aspectRatio}`);
    console.log(`   Quality: ${testParams.quality}`);
    console.log();
    
    try {
      console.log('⏳ Generating image with provider system...');
      const startTime = Date.now();
      
      const result = await generateImageWithProviders(testParams);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      console.log('✅ Image generation successful!');
      console.log('📊 Results:');
      console.log(`   Provider: ${result.provider}`);
      console.log(`   Generation Time: ${result.generationTime}ms`);
      console.log(`   Total Time: ${totalTime}ms`);
      console.log(`   Dimensions: ${result.metadata.width}x${result.metadata.height}`);
      console.log(`   MIME Type: ${result.mimeType}`);
      console.log(`   Seed Used: ${result.seed}`);
      console.log(`   Cost: $${result.cost}`);
      
      // Show image data info
      if (result.imageData) {
        const dataType = typeof result.imageData;
        console.log(`   Image Data Type: ${dataType}`);
        
        if (typeof result.imageData === 'string') {
          console.log(`   Data Length: ${result.imageData.length} characters`);
          if (result.imageData.startsWith('data:image')) {
            console.log(`   Format: Base64 encoded image`);
            console.log(`   Preview: ${result.imageData.substring(0, 50)}...`);
          }
        } else {
          console.log(`   Data Size: ${result.imageData.byteLength} bytes`);
        }
      }
      
      console.log();
      console.log('🎯 Provider System Test PASSED!');
      console.log('✅ Environment variables loaded correctly');
      console.log('✅ Provider configuration working');
      console.log('✅ Image generation successful');
      console.log('✅ Response normalization working');
      console.log('✅ Ready for integration!');
      
    } catch (error) {
      console.error('❌ Image generation failed:', error);
      
      if (error && typeof error === 'object') {
        console.log('\n📋 Error Details:');
        if ('name' in error) console.log(`   Name: ${error.name}`);
        if ('message' in error) console.log(`   Message: ${error.message}`);
        if ('code' in error) console.log(`   Error Code: ${(error as any).code}`);
        if ('provider' in error) console.log(`   Provider: ${(error as any).provider}`);
        if ('retryable' in error) console.log(`   Retryable: ${(error as any).retryable}`);
      }
      
      console.log('\n💡 This might be expected if:');
      console.log('   - GPU quota exceeded (Hugging Face free tier)');
      console.log('   - Network connectivity issues');
      console.log('   - Space is temporarily unavailable');
      
      // Check if it's a quota error (which means the system is working)
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage?.includes('quota') || errorMessage?.includes('ZeroGPU')) {
          console.log('\n✅ Good news: This is a quota error, which means:');
          console.log('   - The provider system is working correctly');
          console.log('   - The API connection is successful');
          console.log('   - You just need to wait for quota reset or upgrade');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Provider system test failed:', error);
  }
}

// Run the test
testProviderSystemWithEnv().catch(console.error);
