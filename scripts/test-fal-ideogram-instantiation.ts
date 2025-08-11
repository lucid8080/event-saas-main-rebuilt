import { FalIdeogramProvider } from '../lib/providers/fal-ideogram-provider';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testFalIdeogramInstantiation() {
  console.log('🧪 Testing FalIdeogramProvider Instantiation...\n');

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

    // 2. Create a simple config
    console.log('\n2. Creating provider config...');
    const config = {
      type: "fal-ideogram" as const,
      apiKey: falKey,
      baseUrl: "https://queue.fal.run",
      enabled: true,
      priority: 102,
      options: {
        model: "fal-ai/ideogram/v3",
        imageSize: "square_hd",
        syncMode: false,
        renderingSpeed: "BALANCED"
      }
    };
    console.log('✅ Config created');

    // 3. Try to instantiate the provider
    console.log('\n3. Instantiating FalIdeogramProvider...');
    try {
      const provider = new FalIdeogramProvider(config);
      console.log('✅ FalIdeogramProvider instantiated successfully');
      
      // 4. Test basic methods
      console.log('\n4. Testing provider methods...');
      console.log('   Type:', provider.getProviderType());
      
      const capabilities = provider.getCapabilities();
      console.log('   Supports Seeds:', capabilities.supportsSeeds);
      console.log('   Cost per Image:', capabilities.pricing.costPerImage);
      console.log('   Max Prompt Length:', capabilities.maxPromptLength);
      
      console.log('✅ All provider methods working correctly');
      
    } catch (error) {
      console.log('❌ Failed to instantiate FalIdeogramProvider:', error);
      console.log('   Error details:', error.message);
      if (error.stack) {
        console.log('   Stack trace:', error.stack);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFalIdeogramInstantiation().catch(console.error);
