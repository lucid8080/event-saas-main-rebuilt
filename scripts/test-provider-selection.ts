/**
 * Test script to verify provider selection logic
 * This script tests the new admin-configured default provider functionality
 */

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function testProviderSelection() {
  try {
    console.log('🧪 Testing Provider Selection Logic...\n');

    // 1. Check current default provider settings
    console.log('1. Checking current default provider settings...');
    const defaultSettings = await prisma.providerSettings.findFirst({
      where: { isDefault: true, isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    if (defaultSettings) {
      console.log(`✅ Found default provider: ${defaultSettings.providerId}`);
      console.log(`   Name: ${defaultSettings.name}`);
      console.log(`   Is Active: ${defaultSettings.isActive}`);
      console.log(`   Is Default: ${defaultSettings.isDefault}`);
    } else {
      console.log('❌ No default provider settings found');
    }

    // 2. Check all provider settings
    console.log('\n2. Checking all provider settings...');
    const allSettings = await prisma.providerSettings.findMany({
      where: { isActive: true },
      orderBy: [
        { isDefault: 'desc' },
        { providerId: 'asc' }
      ]
    });

    console.log(`📊 Found ${allSettings.length} active provider settings:`);
    allSettings.forEach(setting => {
      console.log(`   - ${setting.providerId}: ${setting.name} ${setting.isDefault ? '(DEFAULT)' : ''}`);
    });

    // 3. Test the API endpoint logic
    console.log('\n3. Testing API endpoint logic...');
    
    // Simulate the logic from generateImageV2
    const defaultProvider = defaultSettings?.providerId || 'qwen';
    console.log(`   Simulated default provider: ${defaultProvider}`);

    // 4. Check if the provider is available in the system
    console.log('\n4. Checking provider availability...');
    
    // Import the provider system and reload providers
    const { imageProviders } = await import('../lib/providers');
    
    // Reload providers to ensure environment variables are loaded
    console.log('\n4a. Reloading providers...');
    imageProviders.reloadProviders();
    
    // Check provider configuration
    console.log('\n4b. Checking provider configuration...');
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
    
    const ideogramConfig = providerConfig.getProviderConfig('ideogram');
    console.log('   ideogram config:', {
      exists: !!ideogramConfig,
      enabled: ideogramConfig?.enabled,
      hasApiKey: !!ideogramConfig?.apiKey,
      priority: ideogramConfig?.priority
    });
    
    // Check available providers
    console.log('\n4c. Checking available providers...');
    const availableProviders = imageProviders.getAvailableProviders();
    console.log(`   Available providers: ${availableProviders.join(', ')}`);
    
    // Try to get each provider individually
    console.log('\n4d. Testing individual provider access...');
    ['fal-ideogram', 'fal-qwen', 'ideogram', 'qwen'].forEach(providerType => {
      try {
        const provider = imageProviders.getProvider(providerType as any);
        const capabilities = provider?.getCapabilities();
        console.log(`   ✅ ${providerType}: Available`);
        console.log(`      Type: ${provider.getProviderType()}`);
        console.log(`      Supports Seeds: ${capabilities?.supportsSeeds || false}`);
      } catch (error) {
        console.log(`   ❌ ${providerType}: Not available - ${error.message}`);
      }
    });
    
    const systemDefault = imageProviders.getDefaultProvider()?.getProviderType();
    console.log(`\n   System default provider: ${systemDefault}`);

    console.log('\n🎉 Provider selection test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testProviderSelection();
