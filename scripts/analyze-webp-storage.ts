#!/usr/bin/env tsx

import { prisma } from '../lib/db';
import { getWebPStorageStats, listWebPFiles } from '../lib/webp-storage';
import { testR2Connection } from '../lib/r2';

async function analyzeWebPStorage() {
  console.log('🔍 Starting WebP Storage Analysis...\n');

  try {
    // Test R2 connection first
    console.log('📡 Testing R2 Connection...');
    const r2Connected = await testR2Connection();
    if (!r2Connected) {
      console.error('❌ R2 connection failed. Please check your environment variables.');
      return;
    }
    console.log('✅ R2 connection successful\n');

    // Get database statistics
    console.log('📊 Database Analysis:');
    const totalImages = await prisma.generatedImage.count();
    const webpEnabledImages = await prisma.generatedImage.count({
      where: { webpEnabled: true },
    });
    const webpKeyImages = await prisma.generatedImage.count({
      where: { webpKey: { not: null } },
    });
    const convertedImages = await prisma.generatedImage.count({
      where: { compressionRatio: { not: null } },
    });

    console.log(`   Total images in database: ${totalImages}`);
    console.log(`   WebP enabled: ${webpEnabledImages}`);
    console.log(`   Have WebP keys: ${webpKeyImages}`);
    console.log(`   Already converted: ${convertedImages}`);

    // Format distribution
    const formatDistribution = await prisma.generatedImage.groupBy({
      by: ['originalFormat'],
      _count: { originalFormat: true },
      where: { originalFormat: { not: null } },
    });

    console.log('\n📋 Format Distribution:');
    formatDistribution.forEach(({ originalFormat, _count }) => {
      console.log(`   ${originalFormat || 'unknown'}: ${_count} images`);
    });

    // Compression ratio analysis
    const compressionStats = await prisma.generatedImage.aggregate({
      where: { compressionRatio: { not: null } },
      _avg: { compressionRatio: true },
      _min: { compressionRatio: true },
      _max: { compressionRatio: true },
      _count: { compressionRatio: true },
    });

    if (compressionStats._count.compressionRatio > 0) {
      console.log('\n📈 Compression Ratio Analysis:');
      console.log(`   Average compression: ${compressionStats._avg.compressionRatio?.toFixed(2)}%`);
      console.log(`   Best compression: ${compressionStats._max.compressionRatio?.toFixed(2)}%`);
      console.log(`   Worst compression: ${compressionStats._min.compressionRatio?.toFixed(2)}%`);
      console.log(`   Total converted: ${compressionStats._count.compressionRatio} images`);
    }

    // Get R2 storage statistics
    console.log('\n🗄️ R2 Storage Analysis:');
    const storageStats = await getWebPStorageStats();
    
    if (storageStats.success && storageStats.stats) {
      const stats = storageStats.stats;
      console.log(`   Total WebP files in R2: ${stats.totalWebPFiles}`);
      console.log(`   Total WebP size: ${(stats.totalWebPSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Average WebP size: ${(stats.averageWebPSize / 1024).toFixed(2)} KB`);
      console.log(`   Total original files: ${stats.totalOriginalFiles}`);
      console.log(`   Total original size: ${(stats.totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Estimated average compression: ${stats.averageCompressionRatio.toFixed(2)}%`);
      
      if (stats.totalOriginalSize > 0) {
        const spaceSaved = stats.totalOriginalSize - stats.totalWebPSize;
        console.log(`   Space saved: ${(spaceSaved / 1024 / 1024).toFixed(2)} MB`);
      }
    } else {
      console.log('   ❌ Failed to get R2 storage statistics');
    }

    // List recent WebP files
    console.log('\n📁 Recent WebP Files:');
    const recentWebPFiles = await listWebPFiles();
    
    if (recentWebPFiles.success && recentWebPFiles.files.length > 0) {
      const recentFiles = recentWebPFiles.files
        .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
        .slice(0, 5);

      recentFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.key}`);
        console.log(`      Size: ${(file.size / 1024).toFixed(2)} KB`);
        console.log(`      Modified: ${file.lastModified.toLocaleDateString()}`);
      });
    } else {
      console.log('   No WebP files found in R2 storage');
    }

    // Conversion readiness analysis
    console.log('\n🔧 Conversion Readiness:');
    const readyForConversion = await prisma.generatedImage.count({
      where: {
        webpEnabled: true,
        originalFormat: { in: ['png', 'jpg', 'jpeg'] },
        compressionRatio: null,
      },
    });

    const alreadyConverted = await prisma.generatedImage.count({
      where: {
        compressionRatio: { not: null },
      },
    });

    const notReady = totalImages - readyForConversion - alreadyConverted;

    console.log(`   Ready for conversion: ${readyForConversion} images`);
    console.log(`   Already converted: ${alreadyConverted} images`);
    console.log(`   Not ready (wrong format/disabled): ${notReady} images`);

    // Event type analysis
    console.log('\n🎉 Event Type Analysis:');
    const eventTypeStats = await prisma.generatedImage.groupBy({
      by: ['eventType'],
      _count: { eventType: true },
      where: { eventType: { not: null } },
    });

    eventTypeStats.forEach(({ eventType, _count }) => {
      console.log(`   ${eventType}: ${_count} images`);
    });

    // User analysis
    console.log('\n👥 User Analysis:');
    const userStats = await prisma.generatedImage.groupBy({
      by: ['userId'],
      _count: { userId: true },
    });

    const totalUsers = userStats.length;
    const averageImagesPerUser = totalImages / totalUsers;
    const maxImagesPerUser = Math.max(...userStats.map(s => s._count.userId));

    console.log(`   Total users with images: ${totalUsers}`);
    console.log(`   Average images per user: ${averageImagesPerUser.toFixed(1)}`);
    console.log(`   Max images per user: ${maxImagesPerUser}`);

    // Recommendations
    console.log('\n💡 Recommendations:');
    
    if (readyForConversion > 0) {
      console.log(`   🎯 ${readyForConversion} images are ready for WebP conversion`);
    }
    
    if (storageStats.success && storageStats.stats && storageStats.stats.totalWebPFiles === 0) {
      console.log('   🚀 No WebP files found - ready to start conversion process');
    }
    
    if (notReady > 0) {
      console.log(`   ⚠️ ${notReady} images may need format verification or WebP enabling`);
    }

    console.log('\n🎉 WebP Storage Analysis Completed!');

  } catch (error) {
    console.error('💥 Error during WebP storage analysis:', error);
    process.exit(1);
  }
}

// Run the script if executed directly
if (require.main === module) {
  analyzeWebPStorage()
    .then(() => {
      console.log('\n✨ Analysis completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Analysis failed:', error);
      process.exit(1);
    });
}

export { analyzeWebPStorage }; 