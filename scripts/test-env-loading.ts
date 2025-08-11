/**
 * Test script to check environment variable loading
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function testEnvLoading() {
  console.log('🧪 Testing Environment Variable Loading...\n');

  console.log('1. Checking FAL_KEY:');
  console.log(`   FAL_KEY: ${process.env.FAL_KEY ? 'SET (' + process.env.FAL_KEY.substring(0, 10) + '...)' : 'NOT SET'}`);

  console.log('\n2. Checking other environment variables:');
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
  console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL ? 'SET' : 'NOT SET'}`);

  console.log('\n3. Testing provider configuration...');

  // Import the provider configuration
  const { providerConfig } = await import('../lib/providers/config');

  const falIdeogramConfig = providerConfig.getProviderConfig('fal-ideogram');
  console.log('   fal-ideogram config:', {
    exists: !!falIdeogramConfig,
    enabled: falIdeogramConfig?.enabled,
    hasApiKey: !!falIdeogramConfig?.apiKey,
    priority: falIdeogramConfig?.priority
  });

  const falQwenConfig = providerConfig.getProviderConfig('fal-qwen');
  console.log('   fal-qwen config:', {
    exists: !!falQwenConfig,
    enabled: falQwenConfig?.enabled,
    hasApiKey: !!falQwenConfig?.apiKey,
    priority: falQwenConfig?.priority
  });

  console.log('\n🎉 Environment variable test completed!');
}

// Run the test
testEnvLoading().catch(console.error);
