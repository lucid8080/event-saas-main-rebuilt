import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImageUrls() {
  try {
    console.log('🔍 Checking wedding image URLs...\n');

    // Get all public wedding images
    const weddingImages = await prisma.generatedImage.findMany({
      where: { 
        isPublic: true,
        eventType: 'WEDDING'
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${weddingImages.length} public wedding images\n`);

    for (const image of weddingImages) {
      console.log(`📸 Checking image: ${image.id}`);
      console.log(`   URL: ${image.url}`);
      console.log(`   Created: ${image.createdAt}`);
      
      try {
        const response = await fetch(image.url, { method: 'HEAD' });
        console.log(`   Status: ${response.status} ${response.statusText}`);
        console.log(`   Accessible: ${response.ok ? '✅ Yes' : '❌ No'}`);
      } catch (error) {
        console.log(`   Error: ${error}`);
        console.log(`   Accessible: ❌ No`);
      }
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error checking image URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImageUrls(); 