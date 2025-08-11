#!/usr/bin/env tsx

import { prisma } from '../lib/db';

async function diagnoseProviderSettingsError() {
  console.log('🔍 Provider Settings Error Diagnosis');
  console.log('====================================\n');

  try {
    // Step 1: Check environment variables
    console.log('1. Environment Variables Check:');
    const requiredEnvVars = [
      'DATABASE_URL',
      'AUTH_SECRET'
    ];

    const missingVars = [];
    for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
        console.log(`   ❌ Missing: ${varName}`);
      } else {
        console.log(`   ✅ Found: ${varName}`);
      }
    }

    if (missingVars.length > 0) {
      console.log('\n🚨 CRITICAL: Missing environment variables!');
      return;
    }

    // Step 2: Test database connection
    console.log('\n2. Database Connection Test:');
    try {
      await prisma.$connect();
      console.log('   ✅ Database connection successful');
    } catch (error) {
      console.log(`   ❌ Database connection failed: ${error}`);
      return;
    }

    // Step 3: Check if ProviderSettings table exists
    console.log('\n3. ProviderSettings Table Check:');
    try {
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'ProviderSettings'
        );
      `;
      
      if (tableExists && Array.isArray(tableExists) && tableExists[0]?.exists) {
        console.log('   ✅ ProviderSettings table exists');
      } else {
        console.log('   ❌ ProviderSettings table does not exist');
        console.log('   🔧 Solution: Run database migrations');
        console.log('      npx prisma migrate deploy');
        return;
      }
    } catch (error) {
      console.log(`   ❌ Error checking table: ${error}`);
      return;
    }

    // Step 4: Test ProviderSettings operations
    console.log('\n4. ProviderSettings Operations Test:');
    
    // Test creating a provider setting
    try {
      const testSetting = await prisma.providerSettings.create({
        data: {
          providerId: 'test-provider',
          name: 'Test Settings',
          description: 'Test settings for diagnosis',
          baseSettings: { test: true },
          specificSettings: { test: true },
          createdBy: 'diagnostic-script',
          updatedBy: 'diagnostic-script'
        }
      });
      console.log('   ✅ Create operation successful');
      console.log(`   📝 Created setting ID: ${testSetting.id}`);

      // Test reading the setting
      const readSetting = await prisma.providerSettings.findUnique({
        where: { id: testSetting.id }
      });
      console.log('   ✅ Read operation successful');

      // Test updating the setting
      const updatedSetting = await prisma.providerSettings.update({
        where: { id: testSetting.id },
        data: { description: 'Updated test settings' }
      });
      console.log('   ✅ Update operation successful');

      // Clean up - delete the test setting
      await prisma.providerSettings.delete({
        where: { id: testSetting.id }
      });
      console.log('   ✅ Delete operation successful');

    } catch (error: any) {
      console.log(`   ❌ ProviderSettings operation failed: ${error.message}`);
      
      if (error.code === 'P2002') {
        console.log('   🔧 Issue: Unique constraint violation');
        console.log('   💡 This might be the cause of the 500 error');
      } else if (error.code === 'P2003') {
        console.log('   🔧 Issue: Foreign key constraint violation');
      } else if (error.code === 'P2025') {
        console.log('   🔧 Issue: Record not found');
      } else {
        console.log(`   🔧 Issue: Database error code ${error.code}`);
      }
    }

    // Step 5: Check existing provider settings
    console.log('\n5. Existing ProviderSettings Check:');
    try {
      const existingSettings = await prisma.providerSettings.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      });
      
      console.log(`   📊 Found ${existingSettings.length} existing settings:`);
      existingSettings.forEach(setting => {
        console.log(`      - ${setting.providerId}/${setting.name} (ID: ${setting.id})`);
      });
    } catch (error) {
      console.log(`   ❌ Error reading existing settings: ${error}`);
    }

    // Step 6: Test the specific data that's failing
    console.log('\n6. Test Specific Failing Data:');
    const failingData = {
      providerId: "fal-ideogram",
      name: "Default Fal-AI Ideogram Settings",
      description: "Default configuration for Fal-AI Ideogram provider",
      baseSettings: {},
      specificSettings: {},
      isActive: true,
      isDefault: true
    };

    try {
      const testSetting = await prisma.providerSettings.create({
        data: {
          ...failingData,
          createdBy: 'diagnostic-script',
          updatedBy: 'diagnostic-script'
        }
      });
      console.log('   ✅ Specific data creation successful');
      
      // Clean up
      await prisma.providerSettings.delete({
        where: { id: testSetting.id }
      });
      console.log('   ✅ Cleanup successful');
      
    } catch (error: any) {
      console.log(`   ❌ Specific data creation failed: ${error.message}`);
      console.log(`   🔧 Error code: ${error.code}`);
      console.log('   📋 This is likely the exact error causing the 500 response');
    }

    console.log('\n🎯 Diagnosis Complete!');
    console.log('Check the output above for specific issues.');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseProviderSettingsError();
