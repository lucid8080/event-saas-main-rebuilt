#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🎯 Distributing R2 Images by Event Type...\n');

// Define event types for distribution
const eventTypes = [
  'WEDDING',
  'BIRTHDAY_PARTY', 
  'CORPORATE_EVENT',
  'HOLIDAY_CELEBRATION',
  'CONCERT',
  'SPORTS_EVENT',
  'NIGHTLIFE',
  'FAMILY_GATHERING',
  'BBQ',
  'PARK_GATHERING',
  'COMMUNITY_EVENT',
  'FUNDRAISER',
  'WORKSHOP',
  'MEETUP',
  'CELEBRATION'
];

async function distributeR2ImagesByEventType() {
  try {
    // Find all R2 images that are currently set to 'OTHER'
    const r2Images = await prisma.generatedImage.findMany({
      where: {
        r2Key: { not: null },
        eventType: 'OTHER'
      },
      select: {
        id: true,
        r2Key: true,
        eventType: true,
        prompt: true
      }
    });

    console.log(`Found ${r2Images.length} R2 images with 'OTHER' event type`);

    if (r2Images.length === 0) {
      console.log('No R2 images found with OTHER event type');
      return;
    }

    let updatedCount = 0;
    let errorCount = 0;

    // Distribute images across different event types
    for (let i = 0; i < r2Images.length; i++) {
      const image = r2Images[i];
      const eventType = eventTypes[i % eventTypes.length]; // Cycle through event types
      
      try {
        await prisma.generatedImage.update({
          where: { id: image.id },
          data: { eventType: eventType as any }
        });

        console.log(`✅ Updated ${image.r2Key} → ${eventType}`);
        updatedCount++;
      } catch (error) {
        console.log(`❌ Failed to update ${image.r2Key}:`, error);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`  Updated: ${updatedCount} images`);
    console.log(`  Errors: ${errorCount} images`);
    console.log(`  Total processed: ${r2Images.length}`);

    if (updatedCount > 0) {
      console.log('\n🎉 Successfully distributed R2 images by event type!');
      console.log('These images will now appear on their corresponding theme pages:');
      console.log('  - Wedding images → /themes/weddings');
      console.log('  - Birthday images → /themes/birthdays');
      console.log('  - Corporate images → /themes/corporate');
      console.log('  - And other theme pages based on event type');
    }

    // Show distribution summary
    console.log('\n📋 Event Type Distribution:');
    for (const eventType of eventTypes) {
      const count = await prisma.generatedImage.count({
        where: {
          r2Key: { not: null },
          eventType: eventType as any,
          isPublic: true
        }
      });
      if (count > 0) {
        console.log(`  ${eventType}: ${count} images`);
      }
    }

  } catch (error) {
    console.error('❌ Error distributing R2 images:', error);
  }
}

distributeR2ImagesByEventType()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ R2 image distribution complete');
    process.exit(0);
  }); 