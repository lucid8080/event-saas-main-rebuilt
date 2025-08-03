#!/usr/bin/env tsx

import { prisma } from '../lib/db';
import { 
  checkWebPExists, 
  getWebPInfo, 
  getWebPStorageStats,
  listWebPFiles 
} from '../lib/webp-storage';
import { validateConversionResults, getDatabaseConversionStatus } from '../lib/webp-conversion-monitor';
import { testR2Connection } from '../lib/r2';

async function validateWebPConversions() {
  console.log('🔍 Starting WebP Conversion Validation...\n');

  try {
    // Test R2 connection first
    console.log('📡 Testing R2 Connection...');
    const r2Connected = await testR2Connection();
    if (!r2Connected) {
      console.error('❌ R2 connection failed. Please check your environment variables.');
      return;
    }
    console.log('✅ R2 connection successful\n');

    // Get database conversion status
    console.log('📊 Database Conversion Status:');
    const dbStatus = await getDatabaseConversionStatus();
    console.log(`   Total images: ${dbStatus.totalImages}`);
    console.log(`   Converted images: ${dbStatus.convertedImages}`);
    console.log(`   Failed images: ${dbStatus.failedImages}`);
    console.log(`   Average compression ratio: ${dbStatus.averageCompressionRatio.toFixed(2)}%`);
    console.log(`   Conversion rate: ${((dbStatus.convertedImages / dbStatus.totalImages) * 100).toFixed(1)}%`);

    // Get R2 storage statistics
    console.log('\n🗄️ R2 Storage Validation:');
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

    // Validate conversion results
    console.log('\n✅ Conversion Results Validation:');
    const validation = await validateConversionResults();
    
    if (validation.valid) {
      console.log('   ✅ All conversions are valid');
    } else {
      console.log('   ⚠️ Issues found:');
      validation.issues.forEach((issue, index) => {
        console.log(`      ${index + 1}. ${issue}`);
      });
      
      console.log('\n   💡 Recommendations:');
      validation.recommendations.forEach((rec, index) => {
        console.log(`      ${index + 1}. ${rec}`);
      });
    }

    // Check for orphaned WebP files
    console.log('\n🔍 Checking for Orphaned WebP Files:');
    const webpFiles = await listWebPFiles();
    
    if (webpFiles.success && webpFiles.files.length > 0) {
      let orphanedCount = 0;
      const orphanedFiles: string[] = [];

      for (const file of webpFiles.files.slice(0, 10)) { // Check first 10 files
        const originalKey = file.key.replace(/\.webp$/i, '');
        const originalExists = await checkWebPExists(originalKey);
        
        if (!originalExists) {
          orphanedCount++;
          orphanedFiles.push(file.key);
        }
      }

      if (orphanedCount > 0) {
        console.log(`   ⚠️ Found ${orphanedCount} potentially orphaned WebP files`);
        orphanedFiles.slice(0, 3).forEach(file => {
          console.log(`      - ${file}`);
        });
        if (orphanedFiles.length > 3) {
          console.log(`      ... and ${orphanedFiles.length - 3} more`);
        }
      } else {
        console.log('   ✅ No orphaned WebP files found');
      }
    } else {
      console.log('   ℹ️ No WebP files found in R2 storage');
    }

    // Check database-R2 synchronization
    console.log('\n🔄 Database-R2 Synchronization Check:');
    await checkDatabaseR2Sync();

    // Check compression quality
    console.log('\n📈 Compression Quality Analysis:');
    await analyzeCompressionQuality();

    // Show recent conversions
    console.log('\n📋 Recent Conversions:');
    await showRecentConversions();

    // Generate summary report
    console.log('\n📊 Validation Summary:');
    generateValidationSummary(dbStatus, storageStats, validation);

    console.log('\n🎉 WebP Conversion Validation Completed!');

  } catch (error) {
    console.error('💥 Error during WebP conversion validation:', error);
    process.exit(1);
  }
}

async function checkDatabaseR2Sync() {
  try {
    // Get images with WebP keys in database
    const dbWebPImages = await prisma.generatedImage.findMany({
      where: {
        webpKey: { not: null },
      },
      select: {
        id: true,
        r2Key: true,
        webpKey: true,
        compressionRatio: true,
      },
    });

    let missingInR2 = 0;
    let extraInR2 = 0;

    // Check if database WebP keys exist in R2
    for (const image of dbWebPImages.slice(0, 10)) { // Check first 10
      if (image.r2Key) {
        const webpExists = await checkWebPExists(image.r2Key);
        if (!webpExists) {
          missingInR2++;
        }
      }
    }

    // Get R2 WebP files
    const r2WebPFiles = await listWebPFiles();
    if (r2WebPFiles.success) {
      // Count WebP files that don't have corresponding database entries
      const dbWebPKeys = new Set(dbWebPImages.map(img => img.webpKey).filter(Boolean));
      
      for (const file of r2WebPFiles.files.slice(0, 10)) { // Check first 10
        if (!dbWebPKeys.has(file.key)) {
          extraInR2++;
        }
      }
    }

    if (missingInR2 > 0) {
      console.log(`   ⚠️ ${missingInR2} database WebP keys missing in R2`);
    } else {
      console.log('   ✅ All database WebP keys exist in R2');
    }

    if (extraInR2 > 0) {
      console.log(`   ⚠️ ${extraInR2} R2 WebP files not in database`);
    } else {
      console.log('   ✅ All R2 WebP files have database entries');
    }

  } catch (error) {
    console.log('   ❌ Failed to check database-R2 synchronization');
  }
}

async function analyzeCompressionQuality() {
  try {
    // Get compression statistics
    const compressionStats = await prisma.generatedImage.aggregate({
      where: {
        compressionRatio: { not: null },
      },
      _avg: { compressionRatio: true },
      _min: { compressionRatio: true },
      _max: { compressionRatio: true },
      _count: { compressionRatio: true },
    });

    if (compressionStats._count.compressionRatio > 0) {
      const avg = compressionStats._avg.compressionRatio || 0;
      const min = compressionStats._min.compressionRatio || 0;
      const max = compressionStats._max.compressionRatio || 0;

      console.log(`   Average compression: ${avg.toFixed(2)}%`);
      console.log(`   Best compression: ${max.toFixed(2)}%`);
      console.log(`   Worst compression: ${min.toFixed(2)}%`);

      // Quality assessment
      if (avg >= 70) {
        console.log('   🟢 Excellent compression quality');
      } else if (avg >= 50) {
        console.log('   🟡 Good compression quality');
      } else if (avg >= 30) {
        console.log('   🟠 Fair compression quality');
      } else {
        console.log('   🔴 Poor compression quality - consider re-converting');
      }

      // Check for outliers
      const lowCompressionImages = await prisma.generatedImage.count({
        where: {
          compressionRatio: { lt: 10 },
          compressionRatio: { not: null },
        },
      });

      const highCompressionImages = await prisma.generatedImage.count({
        where: {
          compressionRatio: { gt: 90 },
          compressionRatio: { not: null },
        },
      });

      if (lowCompressionImages > 0) {
        console.log(`   ⚠️ ${lowCompressionImages} images with very low compression (< 10%)`);
      }

      if (highCompressionImages > 0) {
        console.log(`   ✅ ${highCompressionImages} images with excellent compression (> 90%)`);
      }
    } else {
      console.log('   ℹ️ No compression data available');
    }

  } catch (error) {
    console.log('   ❌ Failed to analyze compression quality');
  }
}

async function showRecentConversions() {
  try {
    const recentConversions = await prisma.generatedImage.findMany({
      where: {
        compressionRatio: { not: null },
      },
      select: {
        id: true,
        r2Key: true,
        originalFormat: true,
        compressionRatio: true,
        createdAt: true,
        eventType: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (recentConversions.length > 0) {
      recentConversions.forEach((conversion, index) => {
        console.log(`   ${index + 1}. ${conversion.r2Key}`);
        console.log(`      Format: ${conversion.originalFormat}`);
        console.log(`      Compression: ${conversion.compressionRatio?.toFixed(1)}%`);
        console.log(`      Event: ${conversion.eventType || 'N/A'}`);
        console.log(`      Date: ${conversion.createdAt.toLocaleDateString()}`);
      });
    } else {
      console.log('   ℹ️ No recent conversions found');
    }

  } catch (error) {
    console.log('   ❌ Failed to show recent conversions');
  }
}

function generateValidationSummary(
  dbStatus: any,
  storageStats: any,
  validation: any
) {
  const totalIssues = validation.issues.length;
  const conversionRate = ((dbStatus.convertedImages / dbStatus.totalImages) * 100);
  
  console.log(`   Total images: ${dbStatus.totalImages}`);
  console.log(`   Conversion rate: ${conversionRate.toFixed(1)}%`);
  console.log(`   Average compression: ${dbStatus.averageCompressionRatio.toFixed(2)}%`);
  
  if (storageStats.success && storageStats.stats) {
    const spaceSaved = storageStats.stats.totalOriginalSize - storageStats.stats.totalWebPSize;
    console.log(`   Space saved: ${(spaceSaved / 1024 / 1024).toFixed(2)} MB`);
  }

  if (totalIssues === 0) {
    console.log('   🎉 All validations passed successfully!');
  } else {
    console.log(`   ⚠️ ${totalIssues} issues found - review recommendations above`);
  }

  // Overall assessment
  if (conversionRate >= 90 && totalIssues === 0) {
    console.log('   🟢 WebP conversion system is working excellently');
  } else if (conversionRate >= 75 && totalIssues <= 2) {
    console.log('   🟡 WebP conversion system is working well with minor issues');
  } else if (conversionRate >= 50) {
    console.log('   🟠 WebP conversion system needs attention');
  } else {
    console.log('   🔴 WebP conversion system requires immediate attention');
  }
}

// Run the script if executed directly
if (require.main === module) {
  validateWebPConversions()
    .then(() => {
      console.log('\n✨ Validation completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Validation failed:', error);
      process.exit(1);
    });
}

export { validateWebPConversions }; 