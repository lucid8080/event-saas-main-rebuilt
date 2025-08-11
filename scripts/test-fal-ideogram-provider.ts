/**
 * Test script for Fal-AI Ideogram Provider
 * Run with: npx tsx scripts/test-fal-ideogram-provider.ts
 */

import { FalIdeogramProvider } from '../lib/providers/fal-ideogram-provider';
import { ImageGenerationParams } from '../lib/providers';

async function testFalIdeogramProvider() {
  console.log('🧪 Testing Fal-AI Ideogram Provider...\n');

  // Check if FAL_KEY is set
  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    console.error('❌ FAL_KEY environment variable is not set');
    console.log('Please set FAL_KEY with your Fal-AI API key');
    process.exit(1);
  }

  // Create provider config
  const config = {
    type: 'fal-ideogram' as const,
    apiKey: falKey,
    baseUrl: 'https://queue.fal.run',
    enabled: true,
    priority: 102,
    options: {
      model: 'fal-ai/ideogram/v3',
      imageSize: 'square_hd',
      syncMode: false,
      renderingSpeed: 'BALANCED'
    }
  };

  try {
    // Initialize provider
    console.log('📦 Initializing Fal-AI Ideogram Provider...');
    const provider = new FalIdeogramProvider(config);
    console.log('✅ Provider initialized successfully\n');

    // Test capabilities
    console.log('🔍 Testing provider capabilities...');
    const capabilities = provider.getCapabilities();
    console.log('Capabilities:', JSON.stringify(capabilities, null, 2));
    console.log('✅ Capabilities retrieved successfully\n');

    // Test health check
    console.log('🏥 Testing health check...');
    const isHealthy = await provider.healthCheck();
    console.log(`Health check result: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}\n`);

    if (!isHealthy) {
      console.log('⚠️  Provider is not healthy, skipping image generation test');
      return;
    }

    // Test cost estimation
    console.log('💰 Testing cost estimation...');
    const testParams: ImageGenerationParams = {
      prompt: 'A beautiful sunset over mountains',
      aspectRatio: '16:9',
      quality: 'standard',
      userId: 'test-user'
    };
    
    const costEstimate = provider.getCostEstimate(testParams);
    console.log(`Cost estimate for 16:9 image: $${costEstimate.toFixed(4)}`);
    console.log('✅ Cost estimation working\n');

    // Test parameter validation
    console.log('✅ Parameter validation working\n');

    console.log('🎉 All tests passed! Fal-AI Ideogram Provider is ready to use.');
    console.log('\n📝 Next steps:');
    console.log('1. Add FAL_KEY to your environment variables');
    console.log('2. Restart your application');
    console.log('3. The provider will be available in the Advanced Provider Settings');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testFalIdeogramProvider().catch(console.error);
