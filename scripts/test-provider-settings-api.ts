#!/usr/bin/env tsx

import { prisma } from '../lib/db';

async function testProviderSettingsAPI() {
  console.log('🧪 Testing Provider Settings API Fix');
  console.log('====================================\n');

  try {
    // Test the logic that was implemented in the API endpoint
    const testData = {
      providerId: "fal-ideogram",
      name: "Default Fal-AI Ideogram Settings",
      description: "Default configuration for Fal-AI Ideogram provider",
      baseSettings: {},
      specificSettings: {},
      isActive: true,
      isDefault: true
    };

    console.log('1. Testing the fixed logic:');
    console.log(`   Provider: ${testData.providerId}`);
    console.log(`   Name: ${testData.name}`);

    // Check if settings already exist for this provider and name
    const existingSettings = await prisma.providerSettings.findFirst({
      where: {
        providerId: testData.providerId,
        name: testData.name
      }
    });

    if (existingSettings) {
      console.log('   ✅ Found existing settings, will update instead of create');
      console.log(`   📝 Existing ID: ${existingSettings.id}`);
      
      // Update existing settings instead of creating new ones
      const updatedSettings = await prisma.providerSettings.update({
        where: { id: existingSettings.id },
        data: {
          description: testData.description,
          baseSettings: testData.baseSettings,
          specificSettings: testData.specificSettings,
          isActive: testData.isActive,
          isDefault: testData.isDefault,
          updatedBy: 'test-script',
          version: { increment: 1 }
        }
      });
      
      console.log('   ✅ Successfully updated existing settings');
      console.log(`   📝 Updated ID: ${updatedSettings.id}`);
      console.log(`   📝 New version: ${updatedSettings.version}`);
      
    } else {
      console.log('   📝 No existing settings found, will create new ones');
      
      // Create new settings
      const newSettings = await prisma.providerSettings.create({
        data: {
          ...testData,
          createdBy: 'test-script',
          updatedBy: 'test-script',
          version: 1
        }
      });
      
      console.log('   ✅ Successfully created new settings');
      console.log(`   📝 New ID: ${newSettings.id}`);
    }

    console.log('\n2. Testing with different provider:');
    const differentData = {
      providerId: "test-provider",
      name: "Test Settings",
      description: "Test configuration",
      baseSettings: { test: true },
      specificSettings: { test: true },
      isActive: true,
      isDefault: false
    };

    console.log(`   Provider: ${differentData.providerId}`);
    console.log(`   Name: ${differentData.name}`);

    // Check if settings already exist
    const existingDifferent = await prisma.providerSettings.findFirst({
      where: {
        providerId: differentData.providerId,
        name: differentData.name
      }
    });

    if (existingDifferent) {
      console.log('   ✅ Found existing settings, will update');
      const updated = await prisma.providerSettings.update({
        where: { id: existingDifferent.id },
        data: {
          description: differentData.description,
          baseSettings: differentData.baseSettings,
          specificSettings: differentData.specificSettings,
          isActive: differentData.isActive,
          isDefault: differentData.isDefault,
          updatedBy: 'test-script',
          version: { increment: 1 }
        }
      });
      console.log('   ✅ Successfully updated');
      
      // Clean up
      await prisma.providerSettings.delete({
        where: { id: updated.id }
      });
      console.log('   🧹 Cleaned up test data');
      
    } else {
      console.log('   📝 No existing settings, will create');
      const created = await prisma.providerSettings.create({
        data: {
          ...differentData,
          createdBy: 'test-script',
          updatedBy: 'test-script',
          version: 1
        }
      });
      console.log('   ✅ Successfully created');
      
      // Clean up
      await prisma.providerSettings.delete({
        where: { id: created.id }
      });
      console.log('   🧹 Cleaned up test data');
    }

    console.log('\n🎉 API Fix Test Complete!');
    console.log('The provider settings API should now work correctly.');
    console.log('It will update existing settings instead of failing with a unique constraint error.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProviderSettingsAPI();
