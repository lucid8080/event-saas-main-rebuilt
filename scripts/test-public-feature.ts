import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPublicFeature() {
  try {
    console.log('Testing public image feature...');
    
    // Check if the isPublic field exists in the schema
    const images = await prisma.generatedImage.findMany({
      take: 5,
      select: {
        id: true,
        url: true,
        isPublic: true,
        eventType: true,
        createdAt: true,
      },
    });
    
    console.log('Found images:', images);
    
    if (images.length > 0) {
      const firstImage = images[0];
      console.log('Testing update of first image...');
      
      // Test updating the isPublic field
      const updatedImage = await prisma.generatedImage.update({
        where: { id: firstImage.id },
        data: { isPublic: true },
        select: {
          id: true,
          isPublic: true,
        },
      });
      
      console.log('Updated image:', updatedImage);
      
      // Test fetching public images
      const publicImages = await prisma.generatedImage.findMany({
        where: { isPublic: true },
        select: {
          id: true,
          isPublic: true,
          eventType: true,
        },
      });
      
      console.log('Public images:', publicImages);
    }
    
    // Test carousels as well
    const carousels = await prisma.generatedCarousel.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        isPublic: true,
        createdAt: true,
      },
    });
    
    console.log('Found carousels:', carousels);
    
  } catch (error) {
    console.error('Error testing public feature:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPublicFeature(); 