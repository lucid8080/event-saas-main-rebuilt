#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('📋 Checking Image Event Types...\n');

async function checkImageEventTypes() {
  try {
    const targetEmail = 'lucid8080@gmail.com';
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        generatedImages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`Found user: ${user.email}`);
    console.log(`Total images: ${user.generatedImages.length}`);

    // Check event types for each image
    console.log('\n📋 Image Event Types:');
    
    user.generatedImages.forEach((image, index) => {
      console.log(`\n${index + 1}. ${image.id}`);
      console.log(`   Event Type: ${image.eventType || 'N/A'}`);
      console.log(`   Created: ${image.createdAt.toISOString()}`);
      console.log(`   R2 Key: ${image.r2Key ? '✅' : '❌'}`);
      if (image.r2Key) {
        // Extract filename from R2 key
        const filename = image.r2Key.split('/').pop();
        console.log(`   Filename: ${filename}`);
      }
    });

    // Count event types
    const eventTypeCounts: Record<string, number> = {};
    user.generatedImages.forEach(image => {
      const eventType = image.eventType || 'NONE';
      eventTypeCounts[eventType] = (eventTypeCounts[eventType] || 0) + 1;
    });

    console.log('\n📊 Event Type Distribution:');
    Object.entries(eventTypeCounts).forEach(([eventType, count]) => {
      console.log(`   ${eventType}: ${count} images`);
    });

    console.log('\n🎉 Event type check complete!');

  } catch (error) {
    console.error('❌ Error checking image event types:', error);
  }
}

checkImageEventTypes()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Event type check complete');
    process.exit(0);
  }); 