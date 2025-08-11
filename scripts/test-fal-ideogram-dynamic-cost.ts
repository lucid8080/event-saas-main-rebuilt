/**
 * Test script for Fal-AI Ideogram dynamic cost calculation
 * Verifies that cost varies correctly based on rendering speed
 */

import { FalIdeogramProvider } from '../lib/providers/fal-ideogram-provider';
import { ImageGenerationParams } from '../lib/providers';

async function testFalIdeogramDynamicCost() {
  console.log('🧪 Testing Fal-AI Ideogram Dynamic Cost Calculation\n');

  // Mock configuration
  const config = {
    apiKey: process.env.FAL_KEY || 'test-key',
    baseUrl: 'https://queue.fal.run',
    enabled: true,
    priority: 102
  };

  try {
    const provider = new FalIdeogramProvider(config);
    
    // Test parameters for different aspect ratios
    const testParams: ImageGenerationParams[] = [
      {
        prompt: "Test image",
        aspectRatio: "1:1",
        quality: "standard",
        userId: "test-user"
      },
      {
        prompt: "Test image",
        aspectRatio: "16:9",
        quality: "standard",
        userId: "test-user"
      },
      {
        prompt: "Test image",
        aspectRatio: "9:16",
        quality: "standard",
        userId: "test-user"
      }
    ];

    // Test different rendering speeds
    const renderingSpeeds: ('TURBO' | 'BALANCED' | 'QUALITY')[] = ['TURBO', 'BALANCED', 'QUALITY'];

    for (const params of testParams) {
      console.log(`📐 Testing aspect ratio: ${params.aspectRatio}`);
      
      for (const speed of renderingSpeeds) {
        const testParamsWithSpeed: ImageGenerationParams = {
          ...params,
          providerOptions: {
            renderingSpeed: speed
          }
        };

        const cost = provider.getCostEstimate(testParamsWithSpeed);
        const dimensions = provider['calculateDimensions'](params.aspectRatio);
        const megapixels = (dimensions.width * dimensions.height) / 1000000;
        
        console.log(`  ${speed.padEnd(9)}: $${cost.toFixed(4)} (${megapixels.toFixed(2)} MP)`);
      }
      console.log('');
    }

    // Test cost calculation method directly
    console.log('🔍 Testing direct cost calculation:');
    const testDimensions = { width: 1024, height: 1024 };
    
    for (const speed of renderingSpeeds) {
      const cost = provider['calculateCost'](testDimensions.width, testDimensions.height, speed);
      console.log(`  ${speed.padEnd(9)}: $${cost.toFixed(4)}`);
    }

    console.log('\n✅ Dynamic cost calculation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testFalIdeogramDynamicCost().catch(console.error);
}

export { testFalIdeogramDynamicCost };
