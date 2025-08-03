import { PrismaClient } from '@prisma/client';
import { 
  getR2UsageStats, 
  getR2PerformanceStats, 
  getImageAccessPatterns 
} from '../lib/r2-analytics';

const prisma = new PrismaClient();

async function testR2Analytics() {
  try {
    console.log('🧪 Testing R2 Analytics Functions...\n');

    // Test database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Test R2 Usage Stats
    console.log('2. Testing R2 Usage Stats...');
    try {
      const usageStats = await getR2UsageStats();
      console.log('✅ R2 Usage Stats:', {
        totalImages: usageStats.totalImages,
        r2Images: usageStats.r2Images,
        r2Percentage: usageStats.r2Percentage,
        totalStorageBytes: usageStats.totalStorageBytes
      });
    } catch (error) {
      console.log('❌ R2 Usage Stats Error:', error);
    }
    console.log('');

    // Test R2 Performance Stats
    console.log('3. Testing R2 Performance Stats...');
    try {
      const performanceStats = await getR2PerformanceStats();
      console.log('✅ R2 Performance Stats:', {
        uploadSuccessRate: performanceStats.uploadSuccessRate,
        uploadFailures: performanceStats.uploadFailures,
        averageUploadTime: performanceStats.averageUploadTime,
        signedUrlGenerationCount: performanceStats.signedUrlGenerationCount
      });
    } catch (error) {
      console.log('❌ R2 Performance Stats Error:', error);
    }
    console.log('');

    // Test Image Access Patterns
    console.log('4. Testing Image Access Patterns...');
    try {
      const accessPatterns = await getImageAccessPatterns();
      console.log('✅ Image Access Patterns:', {
        totalAccesses: accessPatterns.totalAccesses,
        uniqueImagesAccessed: accessPatterns.uniqueImagesAccessed,
        averageAccessesPerImage: accessPatterns.averageAccessesPerImage
      });
    } catch (error) {
      console.log('❌ Image Access Patterns Error:', error);
    }
    console.log('');

    // Test database tables
    console.log('5. Testing database tables...');
    try {
      const [totalUsers, totalImages, r2Images, accessLogs, performanceLogs] = await Promise.all([
        prisma.user.count(),
        prisma.generatedImage.count(),
        prisma.generatedImage.count({ where: { r2Key: { not: null } } }),
        prisma.imageAccessLog.count(),
        prisma.r2PerformanceLog.count()
      ]);

      console.log('✅ Database Tables Status:');
      console.log(`   - Users: ${totalUsers}`);
      console.log(`   - Total Images: ${totalImages}`);
      console.log(`   - R2 Images: ${r2Images}`);
      console.log(`   - Access Logs: ${accessLogs}`);
      console.log(`   - Performance Logs: ${performanceLogs}`);
    } catch (error) {
      console.log('❌ Database Tables Error:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testR2Analytics(); 