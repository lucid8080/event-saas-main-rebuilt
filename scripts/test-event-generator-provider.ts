/**
 * Test script to verify Event Generator provider selection
 * This script tests the generateImageV2 action with the new provider selection logic
 */

import { prisma } from '../lib/db';
import { imageProviders } from '../lib/providers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testEventGeneratorProvider() {
  console.log('🧪 Testing Event Generator Provider Selection...\n');

  try {
    // 1. Check what provider is currently set as default in the database
    console.log('1. Checking database for default provider...');
    const defaultProviderSettings = await prisma.providerSettings.findFirst({
      where: {
        isDefault: true,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (defaultProviderSettings) {
      console.log(`✅ Found default provider in database: ${defaultProviderSettings.providerId}`);
      console.log(`   Name: ${defaultProviderSettings.name}`);
      console.log(`   Is Active: ${defaultProviderSettings.isActive}`);
      console.log(`   Is Default: ${defaultProviderSettings.isDefault}`);
    } else {
      console.log('❌ No default provider found in database');
    }

    // 2. Check what the system default provider is
    console.log('\n2. Checking system default provider...');
    const systemDefault = imageProviders.getDefaultProvider();
    if (systemDefault) {
      console.log(`✅ System default provider: ${systemDefault.getProviderType()}`);
    } else {
      console.log('❌ No system default provider configured');
    }

    // 3. Simulate the provider selection logic from generateImageV2
    console.log('\n3. Simulating generateImageV2 provider selection logic...');
    let actualProvider: string;
    
    try {
      // Directly query the database for the default provider settings (same as generateImageV2)
      const defaultProviderSettings2 = await prisma.providerSettings.findFirst({
        where: {
          isDefault: true,
          isActive: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      if (defaultProviderSettings2?.providerId) {
        actualProvider = defaultProviderSettings2.providerId;
        console.log(`✅ Using admin-configured default provider: ${actualProvider}`);
      } else {
        // No admin default configured, use system default
        actualProvider = imageProviders.getDefaultProvider()?.getProviderType() || "qwen";
        console.log(`⚠️  No admin default provider configured, using system default: ${actualProvider}`);
      }
    } catch (error) {
      // Error querying database, use system default
      actualProvider = imageProviders.getDefaultProvider()?.getProviderType() || "qwen";
      console.log(`❌ Error querying database for default provider, using system default: ${actualProvider}`);
    }

         // 4. Check if the selected provider is available
     console.log('\n4. Checking provider availability...');
     try {
       const provider = imageProviders.getProvider(actualProvider as any);
       if (provider) {
         console.log(`✅ Provider ${actualProvider} is available`);
         const capabilities = provider.getCapabilities();
         console.log(`   Type: ${provider.getProviderType()}`);
         console.log(`   Supports Seeds: ${capabilities.supportsSeeds}`);
         console.log(`   Cost per Image: $${capabilities.pricing.costPerImage}`);
         console.log(`   Max Prompt Length: ${capabilities.maxPromptLength} characters`);
       } else {
         console.log(`❌ Provider ${actualProvider} is not available`);
       }
     } catch (error) {
       console.log(`❌ Error getting provider ${actualProvider}:`, error);
     }

    // 5. Summary
    console.log('\n📋 Summary:');
    console.log(`   Database Default: ${defaultProviderSettings?.providerId || 'None'}`);
    console.log(`   System Default: ${systemDefault?.getProviderType() || 'None'}`);
    console.log(`   Event Generator Will Use: ${actualProvider}`);
    
    if (actualProvider === 'fal-ideogram') {
      console.log('🎉 SUCCESS: Event Generator will use fal-ideogram!');
    } else if (actualProvider === 'fal-qwen') {
      console.log('⚠️  WARNING: Event Generator will still use fal-qwen');
      if (!defaultProviderSettings) {
        console.log('   Reason: No default provider configured in database');
      } else if (defaultProviderSettings.providerId !== 'fal-ideogram') {
        console.log(`   Reason: Database default is set to ${defaultProviderSettings.providerId}, not fal-ideogram`);
      }
    } else {
      console.log(`ℹ️  INFO: Event Generator will use ${actualProvider}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testEventGeneratorProvider().catch(console.error);
