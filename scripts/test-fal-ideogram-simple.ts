import { prisma } from '../lib/db';
import { imageProviders } from '../lib/providers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testFalIdeogramSimple() {
  console.log('🧪 Simple Fal-Ideogram Provider Test...\n');

  try {
    // 1. Check if fal-ideogram is in the providers map
    console.log('1. Checking providers map...');
    const availableProviders = imageProviders.getAvailableProviders();
    console.log('Available providers:', availableProviders);
    
    if (availableProviders.includes('fal-ideogram')) {
      console.log('✅ fal-ideogram is in available providers');
    } else {
      console.log('❌ fal-ideogram is NOT in available providers');
    }

    // 2. Try to get the provider directly
    console.log('\n2. Trying to get fal-ideogram provider...');
    try {
      const provider = imageProviders.getProvider('fal-ideogram');
      console.log('✅ Successfully got fal-ideogram provider');
      console.log('   Type:', provider.getProviderType());
      
      const capabilities = provider.getCapabilities();
      console.log('   Supports Seeds:', capabilities.supportsSeeds);
      console.log('   Cost per Image:', capabilities.pricing.costPerImage);
    } catch (error) {
      console.log('❌ Failed to get fal-ideogram provider:', error.message);
      
      // 2a. Let's check what providers are actually in the map
      console.log('\n2a. Debugging provider map...');
      console.log('Available providers from getAvailableProviders():', availableProviders);
      
      // Try to access the internal map (if possible)
      console.log('Trying to reload providers...');
      imageProviders.reloadProviders();
      
      const availableProviders2 = imageProviders.getAvailableProviders();
      console.log('Available providers after reload:', availableProviders2);
      
      if (availableProviders2.includes('fal-ideogram')) {
        console.log('✅ fal-ideogram is available after reload');
        try {
          const provider2 = imageProviders.getProvider('fal-ideogram');
          console.log('✅ Successfully got fal-ideogram provider after reload');
        } catch (error2) {
          console.log('❌ Still failed after reload:', error2.message);
        }
      } else {
        console.log('❌ fal-ideogram still not available after reload');
      }
    }

    // 3. Check what the default provider is
    console.log('\n3. Checking default provider...');
    try {
      const defaultProvider = imageProviders.getDefaultProvider();
      console.log('✅ Default provider:', defaultProvider.getProviderType());
    } catch (error) {
      console.log('❌ Failed to get default provider:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testFalIdeogramSimple().catch(console.error);
