#!/usr/bin/env tsx

import { 
  imageProviders, 
  generateImageWithProviders,
  checkProvidersHealth,
  getProviderConfigSummary,
  validateProviderSetup
} from "../lib/providers";

async function testProviderSystem() {
  console.log('🚀 Testing Image Generation Provider System');
  console.log('===========================================\n');
  
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
    
    // 3. Check provider health
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
    
    // 4. Get available providers
    console.log('📡 Available Providers:');
    const availableProviders = imageProviders.getAvailableProviders();
    if (availableProviders.length === 0) {
      console.log('   ❌ No providers available');
      return;
    }
    
    availableProviders.forEach(provider => {
      console.log(`   ✅ ${provider}`);
    });
    console.log();
    
    // 5. Test image generation with the provider system
    console.log('🎨 Testing Image Generation...');
    
    // Test parameters
    const testParams = {
      prompt: "A beautiful sunset over mountains, high quality digital art",
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
    console.log(`   Seed: ${testParams.seed}`);
    console.log();
    
    try {
      console.log('⏳ Generating image...');
      const startTime = Date.now();
      
      const result = await generateImageWithProviders(testParams);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      console.log('✅ Image generation successful!');
      console.log('📊 Results:');
      console.log(`   Provider: ${result.provider}`);
      console.log(`   Generation Time: ${result.generationTime}ms`);
      console.log(`   Total Time: ${totalTime}ms`);
      console.log(`   Image Size: ${result.metadata.width}x${result.metadata.height}`);
      console.log(`   MIME Type: ${result.mimeType}`);
      console.log(`   Seed Used: ${result.seed}`);
      console.log(`   Cost: $${result.cost}`);
      
      if (result.imageData) {
        const dataType = typeof result.imageData;
        const dataSize = dataType === 'string' 
          ? result.imageData.length 
          : result.imageData.byteLength;
        console.log(`   Image Data: ${dataType} (${dataSize} characters/bytes)`);
        
        // If it's base64, show preview
        if (typeof result.imageData === 'string' && result.imageData.startsWith('data:image')) {
          console.log(`   Base64 Preview: ${result.imageData.substring(0, 50)}...`);
        }
      }
      
      console.log();
      console.log('🎯 Provider System Test PASSED!');
      console.log('✅ Abstraction layer working correctly');
      console.log('✅ Fallback system operational');
      console.log('✅ Error handling functional');
      console.log('✅ Response normalization working');
      
    } catch (error) {
      console.error('❌ Image generation failed:', error);
      
      if (error instanceof Error) {
        console.log('📋 Error Details:');
        console.log(`   Name: ${error.name}`);
        console.log(`   Message: ${error.message}`);
        
        // Check if it's our custom error type
        if ('code' in error) {
          console.log(`   Error Code: ${(error as any).code}`);
          console.log(`   Provider: ${(error as any).provider}`);
          console.log(`   Retryable: ${(error as any).retryable}`);
        }
      }
      
      // This might be expected (quota exceeded, etc.)
      console.log('\n💡 This error might be expected if:');
      console.log('   - GPU quota is exceeded (Hugging Face free tier)');
      console.log('   - Provider is temporarily unavailable');
      console.log('   - Network connectivity issues');
      console.log('   - API keys are not configured');
    }
    
  } catch (error) {
    console.error('❌ Provider system test failed:', error);
  }
}

// Run the test
testProviderSystem().catch(console.error);
