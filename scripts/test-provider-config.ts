import { providerConfig } from '../lib/providers/config';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testProviderConfig() {
  console.log('🧪 Testing Provider Configuration...\n');

  try {
    // 1. Check if FAL_KEY is available
    console.log('1. Checking FAL_KEY...');
    const falKey = process.env.FAL_KEY;
    if (falKey) {
      console.log('✅ FAL_KEY is available');
    } else {
      console.log('❌ FAL_KEY is not available');
      return;
    }

    // 2. Check fal-ideogram config
    console.log('\n2. Checking fal-ideogram config...');
    const falIdeogramConfig = providerConfig.getProviderConfig("fal-ideogram");
    if (falIdeogramConfig) {
      console.log('✅ fal-ideogram config found');
      console.log('   Enabled:', falIdeogramConfig.enabled);
      console.log('   Priority:', falIdeogramConfig.priority);
      console.log('   Has API Key:', !!falIdeogramConfig.apiKey);
    } else {
      console.log('❌ fal-ideogram config not found');
    }

    // 3. Check fal-qwen config
    console.log('\n3. Checking fal-qwen config...');
    const falQwenConfig = providerConfig.getProviderConfig("fal-qwen");
    if (falQwenConfig) {
      console.log('✅ fal-qwen config found');
      console.log('   Enabled:', falQwenConfig.enabled);
      console.log('   Priority:', falQwenConfig.priority);
      console.log('   Has API Key:', !!falQwenConfig.apiKey);
    } else {
      console.log('❌ fal-qwen config not found');
    }

    // 4. Check all available providers
    console.log('\n4. Checking all available providers...');
    const availableProviders = providerConfig.getAvailableProviders();
    console.log('Available providers:', availableProviders);

    // 5. Check default provider
    console.log('\n5. Checking default provider...');
    const defaultProvider = providerConfig.getDefaultProvider();
    console.log('Default provider:', defaultProvider);

    // 6. Reload configurations and check again
    console.log('\n6. Reloading configurations...');
    providerConfig.reloadConfigurations();
    
    const falIdeogramConfig2 = providerConfig.getProviderConfig("fal-ideogram");
    if (falIdeogramConfig2) {
      console.log('✅ fal-ideogram config found after reload');
      console.log('   Enabled:', falIdeogramConfig2.enabled);
    } else {
      console.log('❌ fal-ideogram config still not found after reload');
    }

    const availableProviders2 = providerConfig.getAvailableProviders();
    console.log('Available providers after reload:', availableProviders2);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProviderConfig().catch(console.error);
