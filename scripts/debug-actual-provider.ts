#!/usr/bin/env tsx

/**
 * Debug script to determine which provider is actually being used
 */

import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

async function debugActualProvider() {
  console.log('🔍 Debugging Actual Provider Usage');
  console.log('=================================\n');

  try {
    // Import provider system
    const { imageProviders } = await import('../lib/providers');
    
    console.log('📋 Provider Configuration Status:');
    console.log('=================================');
    
    // Check each provider
    const providers = ['fal-qwen', 'qwen', 'huggingface', 'ideogram'];
    
    for (const providerType of providers) {
      try {
        const provider = imageProviders.getProvider(providerType as any);
        if (provider) {
          const capabilities = provider.getCapabilities();
          console.log(`✅ ${providerType}: Available (${capabilities.name})`);
        }
      } catch (error) {
        console.log(`❌ ${providerType}: ${error.message}`);
      }
    }
    
    console.log('\n🎯 Default Provider:');
    console.log('===================');
    try {
      const defaultProvider = imageProviders.getDefaultProvider();
      if (defaultProvider) {
        const providerType = defaultProvider.getProviderType();
        const capabilities = defaultProvider.getCapabilities();
        console.log(`Default: ${providerType} (${capabilities.name})`);
        
        // Test parameter conversion for 9:16
        console.log('\n🧪 Testing 9:16 Quality Compensation:');
        console.log('====================================');
        
        const testParams = {
          prompt: "test wedding scene",
          aspectRatio: "9:16" as any,
          quality: "standard" as any,
          userId: "test-user"
        };
        
        if (providerType === 'fal-qwen') {
          console.log('✅ Fal-Qwen detected - Quality compensation should be active');
          console.log('Expected: 25 base steps × 1.5 compensation = 38 final steps');
        } else if (providerType === 'ideogram') {
          console.log('ℹ️  Ideogram detected - Using normalized dimensions but no step compensation');
          console.log('Dimensions: 992x1768 (1.75 MP)');
        } else {
          console.log(`ℹ️  ${providerType} detected - Check if it has quality compensation`);
        }
        
      } else {
        console.log('❌ No default provider available');
      }
    } catch (error) {
      console.log(`❌ Error getting default provider: ${error.message}`);
    }
    
    console.log('\n🔧 Environment Check:');
    console.log('=====================');
    console.log(`FAL_KEY: ${process.env.FAL_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`NEXT_PUBLIC_IDEOGRAM_API_KEY: ${process.env.NEXT_PUBLIC_IDEOGRAM_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`NEXT_PUBLIC_HUGGING_FACE_API_TOKEN: ${process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN ? '✅ Configured' : '❌ Missing'}`);
    console.log(`QWEN_INFERENCE_API_KEY: ${process.env.QWEN_INFERENCE_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  }
}

debugActualProvider().then(() => {
  console.log('\n🏁 Provider debugging completed!');
}).catch(console.error);
