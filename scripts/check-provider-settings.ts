#!/usr/bin/env tsx

/**
 * Check existing provider settings in database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProviderSettings() {
  console.log("🔍 Checking Provider Settings in Database\n");

  try {
    // Get all provider settings
    const allSettings = await prisma.providerSettings.findMany({
      orderBy: [
        { providerId: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    console.log(`📊 Total provider settings: ${allSettings.length}\n`);

    if (allSettings.length === 0) {
      console.log("❌ No provider settings found in database");
      return;
    }

    // Group by provider
    const settingsByProvider = allSettings.reduce((acc, setting) => {
      if (!acc[setting.providerId]) {
        acc[setting.providerId] = [];
      }
      acc[setting.providerId].push(setting);
      return acc;
    }, {} as Record<string, any[]>);

    console.log("📋 Settings by Provider:");
    for (const [providerId, settings] of Object.entries(settingsByProvider)) {
      console.log(`\n🚀 ${providerId.toUpperCase()}:`);
      settings.forEach((setting, index) => {
        console.log(`   ${index + 1}. "${setting.name}" (ID: ${setting.id})`);
        console.log(`      - Default: ${setting.isDefault ? '✅' : '❌'}`);
        console.log(`      - Active: ${setting.isActive ? '✅' : '❌'}`);
        console.log(`      - Created: ${setting.createdAt.toISOString()}`);
        console.log(`      - Version: ${setting.version}`);
      });
    }

    // Check specifically for fal-qwen
    const falQwenSettings = allSettings.filter(s => s.providerId === 'fal-qwen');
    console.log(`\n🎯 Fal-AI Qwen Settings: ${falQwenSettings.length} found`);
    
    if (falQwenSettings.length > 0) {
      console.log("   Existing fal-qwen settings:");
      falQwenSettings.forEach(setting => {
        console.log(`   - Name: "${setting.name}"`);
        console.log(`   - ID: ${setting.id}`);
        console.log(`   - Default: ${setting.isDefault}`);
        console.log(`   - Base Settings:`, JSON.stringify(setting.baseSettings, null, 4));
        console.log(`   - Specific Settings:`, JSON.stringify(setting.specificSettings, null, 4));
      });
    }

    console.log("\n💡 Recommendations:");
    if (falQwenSettings.length > 0) {
      console.log("   - UI should load existing settings for editing (PUT request)");
      console.log("   - Use existing setting ID for updates");
      console.log("   - Don't try to create new settings with same name");
    } else {
      console.log("   - No fal-qwen settings exist, CREATE (POST) should work");
    }

  } catch (error) {
    console.error("❌ Database error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProviderSettings();
