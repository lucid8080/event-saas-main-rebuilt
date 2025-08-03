#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';
import { getImageUrl } from '../lib/gallery-utils';

console.log('🔗 Testing Image URL Generation...\n');

async function testImageUrls() {
  try {
    const targetEmail = 'lucid8080@gmail.com';
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        generatedImages: true
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`Found user: ${user.email}`);
    console.log(`Total images: ${user.generatedImages.length}`);

    // Test URL generation for each image
    console.log('\n📋 Testing URL generation for each image:');
    
    for (const image of user.generatedImages) {
      try {
        console.log(`\n🖼️  Image: ${image.id}`);
        console.log(`   Event Type: ${image.eventType || 'N/A'}`);
        console.log(`   R2 Key: ${image.r2Key ? '✅' : '❌'}`);
        console.log(`   Original URL: ${image.url || 'N/A'}`);
        
        // Generate proper URL
        const properUrl = await getImageUrl(image.id, 'gallery');
        console.log(`   Generated URL: ${properUrl}`);
        
        // Test if URL is accessible
        try {
          const response = await fetch(properUrl, { method: 'HEAD' });
          console.log(`   URL Status: ${response.ok ? '✅ Accessible' : '❌ Not accessible'}`);
        } catch (fetchError) {
          console.log(`   URL Status: ❌ Error accessing URL`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error generating URL: ${error}`);
      }
    }

    console.log('\n🎉 Image URL test complete!');
    console.log('💡 Check the generated URLs above to see if they work.');

  } catch (error) {
    console.error('❌ Error testing image URLs:', error);
  }
}

testImageUrls()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Image URL test complete');
    process.exit(0);
  }); 