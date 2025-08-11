#!/usr/bin/env tsx

/**
 * Seed script for provider settings
 * Inserts default provider settings into the database
 */

import { prisma } from "../lib/db";

async function seedProviderSettings() {
  console.log("🌱 Seeding Provider Settings...");

  try {
    // Delete existing settings to start fresh
    await prisma.providerSettings.deleteMany({
      where: {
        createdBy: 'system'
      }
    });

    // Default provider settings
    const defaultSettings = [
      {
        id: 'fal-qwen-default',
        providerId: 'fal-qwen',
        name: 'Default Fal-AI Qwen Settings',
        description: 'Default configuration for Fal-AI Qwen provider - $0.05/megapixel',
        baseSettings: {
          inferenceSteps: 25,
          guidanceScale: 3.0,
          enableSafetyChecker: true,
          numImages: 1,
          costPerImage: 0.05,
          randomizeSeed: true,
          priority: 'normal'
        },
        specificSettings: {
          'fal-qwen': {
            imageSize: 'square_hd',
            enableSafetyChecker: true,
            syncMode: false,
            guidanceScale: 3.0,
            numInferenceSteps: 25,
            numImages: 1
          }
        },
        isActive: true,
        isDefault: true,
        createdBy: 'system',
        updatedBy: 'system',
        version: 1
      },
      {
        id: 'ideogram-default',
        providerId: 'ideogram',
        name: 'Default Ideogram Settings',
        description: 'Default configuration for Ideogram provider - Premium quality',
        baseSettings: {
          inferenceSteps: 30,
          guidanceScale: 7.5,
          enableSafetyChecker: true,
          numImages: 1,
          costPerImage: 0.08,
          randomizeSeed: false,
          priority: 'normal'
        },
        specificSettings: {
          ideogram: {
            renderingSpeed: 'TURBO',
            magicPromptOption: 'AUTO',
            styleType: 'GENERAL'
          }
        },
        isActive: true,
        isDefault: true,
        createdBy: 'system',
        updatedBy: 'system',
        version: 1
      },
      {
        id: 'huggingface-default',
        providerId: 'huggingface',
        name: 'Default HuggingFace Settings',
        description: 'Default configuration for HuggingFace provider - Open source models',
        baseSettings: {
          inferenceSteps: 25,
          guidanceScale: 7.5,
          enableSafetyChecker: false,
          numImages: 1,
          costPerImage: 0.01,
          randomizeSeed: true,
          priority: 'normal'
        },
        specificSettings: {
          huggingface: {
            model: 'stabilityai/stable-diffusion-xl-base-1.0',
            schedulerType: 'DPMSolverMultistepScheduler'
          }
        },
        isActive: true,
        isDefault: true,
        createdBy: 'system',
        updatedBy: 'system',
        version: 1
      },
      {
        id: 'qwen-default',
        providerId: 'qwen',
        name: 'Default Qwen Settings',
        description: 'Default configuration for Qwen provider - Free via HF Spaces',
        baseSettings: {
          inferenceSteps: 25,
          guidanceScale: 4.0,
          enableSafetyChecker: false,
          numImages: 1,
          costPerImage: 0.0,
          randomizeSeed: false,
          priority: 'normal'
        },
        specificSettings: {
          qwen: {
            promptEnhance: true,
            aspectRatio: '1:1'
          }
        },
        isActive: true,
        isDefault: true,
        createdBy: 'system',
        updatedBy: 'system',
        version: 1
      }
    ];

    // Insert all default settings
    for (const setting of defaultSettings) {
      await prisma.providerSettings.create({
        data: setting
      });
      console.log(`   ✅ Created ${setting.providerId} default settings`);
    }

    console.log(`\n🎉 Successfully seeded ${defaultSettings.length} provider settings!`);
    
    // Verify settings were created
    const count = await prisma.providerSettings.count();
    console.log(`📊 Total provider settings in database: ${count}`);

  } catch (error) {
    console.error("❌ Failed to seed provider settings:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedProviderSettings().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
