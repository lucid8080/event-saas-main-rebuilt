import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugPublicImages() {
  try {
    console.log('🔍 Debugging Public Images...\n');

    // 1. Check all public images
    console.log('📊 All Public Images:');
    const allPublicImages = await prisma.generatedImage.findMany({
      where: { isPublic: true },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${allPublicImages.length} public images:`);
    allPublicImages.forEach((img, index) => {
      console.log(`${index + 1}. ID: ${img.id}`);
      console.log(`   Event Type: ${img.eventType || 'N/A'}`);
      console.log(`   User: ${img.user.name || img.user.email}`);
      console.log(`   Created: ${img.createdAt}`);
      console.log(`   URL: ${img.url.substring(0, 50)}...`);
      console.log('');
    });

    // 2. Check wedding-specific public images
    console.log('💒 Wedding Public Images:');
    const weddingPublicImages = await prisma.generatedImage.findMany({
      where: { 
        isPublic: true,
        eventType: 'WEDDING'
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${weddingPublicImages.length} public wedding images:`);
    weddingPublicImages.forEach((img, index) => {
      console.log(`${index + 1}. ID: ${img.id}`);
      console.log(`   User: ${img.user.name || img.user.email}`);
      console.log(`   Created: ${img.createdAt}`);
      console.log(`   URL: ${img.url.substring(0, 50)}...`);
      console.log('');
    });

    // 3. Check recent images (last 7 days)
    console.log('📅 Recent Images (Last 7 Days):');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentImages = await prisma.generatedImage.findMany({
      where: { 
        createdAt: { gte: sevenDaysAgo }
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${recentImages.length} recent images:`);
    recentImages.forEach((img, index) => {
      console.log(`${index + 1}. ID: ${img.id}`);
      console.log(`   Event Type: ${img.eventType || 'N/A'}`);
      console.log(`   Public: ${img.isPublic}`);
      console.log(`   User: ${img.user.name || img.user.email}`);
      console.log(`   Created: ${img.createdAt}`);
      console.log('');
    });

    // 4. Check database schema
    console.log('🗄️ Database Schema Check:');
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'generated_images'
      ORDER BY ordinal_position;
    `;
    console.log('GeneratedImage table columns:');
    console.log(tableInfo);

    // 5. Test API endpoint
    console.log('\n🌐 Testing API Endpoint:');
    try {
      const response = await fetch('http://localhost:3000/api/public-images?eventType=WEDDING&limit=12');
      if (response.ok) {
        const data = await response.json();
        console.log(`API Response: ${data.images?.length || 0} wedding images`);
        if (data.images?.length > 0) {
          console.log('First image from API:');
          console.log(`  ID: ${data.images[0].id}`);
          console.log(`  Event Type: ${data.images[0].eventType}`);
          console.log(`  Public: ${data.images[0].isPublic}`);
        }
      } else {
        console.log(`API Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`API Error: ${error}`);
    }

  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPublicImages(); 