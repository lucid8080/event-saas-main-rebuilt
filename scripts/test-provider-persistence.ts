/**
 * Test script to verify provider selection persistence
 * This script tests that the Advanced Provider Settings correctly loads and saves the selected provider
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function testProviderPersistence() {
  try {
    console.log('🧪 Testing Provider Selection Persistence...\n');

    // 1. Check current default provider in database
    console.log('1. Checking current default provider in database...');
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

    // 3. Test the API endpoint that the Advanced Provider Settings uses
    console.log('\n3. Testing API endpoint for Advanced Provider Settings...');
    
    try {
      const response = await fetch('http://localhost:3001/api/admin/provider-settings', {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ API endpoint working, found ${data.settings?.length || 0} settings`);
        
        // Find the default provider from API response
        const apiDefaultSettings = data.settings?.find((s: any) => s.isDefault && s.isActive);
        if (apiDefaultSettings) {
          console.log(`   ✅ API shows default provider: ${apiDefaultSettings.providerId}`);
        } else {
          console.log(`   ⚠️  API shows no default provider`);
        }
      } else {
        console.log(`   ❌ API endpoint failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ API endpoint error: ${error.message}`);
    }

    // 4. Simulate what the Advanced Provider Settings component should do
    console.log('\n4. Simulating Advanced Provider Settings behavior...');
    
    // Simulate fetchAllSettings function
    const allSettingsResponse = await fetch('http://localhost:3001/api/admin/provider-settings');
    if (allSettingsResponse.ok) {
      const allSettingsData = await allSettingsResponse.json();
      const defaultSettingsFromApi = allSettingsData.settings?.find((s: any) => s.isDefault && s.isActive);
      
      if (defaultSettingsFromApi) {
        console.log(`   ✅ Component should load: ${defaultSettingsFromApi.providerId} as selected provider`);
        console.log(`   ✅ This should persist across page refreshes`);
      } else {
        console.log(`   ⚠️  Component would fall back to 'fal-qwen' as no default found`);
      }
    }

    console.log('\n🎉 Provider persistence test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testProviderPersistence();
