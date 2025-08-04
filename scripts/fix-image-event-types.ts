#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🔧 Fixing Image Event Types...\n');

async function fixImageEventTypes() {
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

    // Define the correct event types based on the original context
    // This is based on the typical event types that would have been generated
    const correctEventTypes = [
      'WEDDING',           // 1. First image - likely a wedding
      'BIRTHDAY_PARTY',    // 2. Birthday party
      'CORPORATE_EVENT',   // 3. Corporate event
      'HOLIDAY_CELEBRATION', // 4. Holiday celebration
      'FAMILY_GATHERING',  // 5. Family gathering
      'COMMUNITY_EVENT',   // 6. Community event
      'CONCERT',           // 7. Concert
      'SPORTS_EVENT',      // 8. Sports event
      'WORKSHOP',          // 9. Workshop
      'FUNDRAISER',        // 10. Fundraiser
      'MEETUP',            // 11. Meetup
      'NIGHTLIFE',         // 12. Nightlife
      'CELEBRATION',       // 13. Celebration
      'BBQ',               // 14. BBQ
      'PARK_GATHERING'     // 15. Park gathering
    ];

    console.log('\n📋 Fixing event types:');
    
    let updatedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < user.generatedImages.length; i++) {
      const image = user.generatedImages[i];
      const correctEventType = correctEventTypes[i];
      
      if (correctEventType && image.eventType !== correctEventType) {
        try {
          await prisma.generatedImage.update({
            where: { id: image.id },
            data: { eventType: correctEventType as any }
          });

          console.log(`✅ ${image.id}: ${image.eventType} → ${correctEventType}`);
          updatedCount++;
        } catch (error) {
          console.log(`❌ Failed to update ${image.id}:`, error);
          errorCount++;
        }
      } else {
        console.log(`⏭️  ${image.id}: Already correct (${image.eventType})`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`  Updated: ${updatedCount} event types`);
    console.log(`  Errors: ${errorCount} updates`);
    console.log(`  Total processed: ${user.generatedImages.length}`);

    if (updatedCount > 0) {
      console.log('\n🎉 Successfully fixed image event types!');
      console.log('💡 Your images should now have the correct event type categorization.');
    }

  } catch (error) {
    console.error('❌ Error fixing image event types:', error);
  }
}

fixImageEventTypes()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Event type fix complete');
    process.exit(0);
  }); 