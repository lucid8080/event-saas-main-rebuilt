#!/usr/bin/env tsx

import { prisma } from '../lib/db';
import { 
  downloadOriginalFromR2, 
  uploadWebPToR2, 
  checkWebPExists
} from '../lib/webp-storage';
import { generateWebPKey } from '../lib/r2';
import { 
  convertToWebPWithPreset, 
  calculateCompressionRatio,
  getImageMetadata,
  WEBP_QUALITY_PRESETS 
} from '../lib/webp-converter';
import { validateWebPConversion } from '../lib/webp-validation';

// Conversion configuration
interface ConversionConfig {
  batchSize: number;
  qualityPreset: keyof typeof WEBP_QUALITY_PRESETS;
  validateConversions: boolean;
  retryFailed: boolean;
  maxRetries: number;
  preserveOriginal: boolean;
  updateDatabase: boolean;
}

// Default conversion configuration
const DEFAULT_CONVERSION_CONFIG: ConversionConfig = {
  batchSize: 5,
  qualityPreset: 'medium',
  validateConversions: true,
  retryFailed: true,
  maxRetries: 3,
  preserveOriginal: true,
  updateDatabase: true,
};

// Conversion result interface
interface ConversionResult {
  imageId: string;
  r2Key: string;
  success: boolean;
  originalSize: number;
  webpSize: number;
  compressionRatio: number;
  qualityScore?: number;
  processingTime: number;
  error?: string;
  retryCount: number;
}

// Progress tracking interface
interface ConversionProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  totalProcessingTime: number;
  averageProcessingTime: number;
  totalSpaceSaved: number;
  averageCompressionRatio: number;
}

async function convertExistingImagesToWebP(config: ConversionConfig = DEFAULT_CONVERSION_CONFIG) {
  console.log('🔄 Starting WebP conversion for existing images...\n');

  try {
    // Get images ready for conversion
    const imagesToConvert = await prisma.generatedImage.findMany({
      where: {
        webpEnabled: true,
        originalFormat: { in: ['png', 'jpg', 'jpeg'] },
        compressionRatio: null, // Not already converted
        r2Key: { not: null }, // Has R2 key
      },
      select: {
        id: true,
        r2Key: true,
        originalFormat: true,
        prompt: true,
        eventType: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    console.log(`📊 Found ${imagesToConvert.length} images ready for WebP conversion`);
    console.log(`⚙️  Configuration: ${config.qualityPreset} quality, batch size: ${config.batchSize}`);

    if (imagesToConvert.length === 0) {
      console.log('✅ No images need conversion');
      return;
    }

    // Initialize progress tracking
    const progress: ConversionProgress = {
      total: imagesToConvert.length,
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      totalProcessingTime: 0,
      averageProcessingTime: 0,
      totalSpaceSaved: 0,
      averageCompressionRatio: 0,
    };

    const results: ConversionResult[] = [];

    // Process images in batches
    for (let i = 0; i < imagesToConvert.length; i += config.batchSize) {
      const batch = imagesToConvert.slice(i, i + config.batchSize);
      console.log(`\n📦 Processing batch ${Math.floor(i / config.batchSize) + 1}/${Math.ceil(imagesToConvert.length / config.batchSize)} (${batch.length} images)`);

      // Process batch concurrently
      const batchPromises = batch.map(image => convertSingleImage(image, config, progress));
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults);

      // Update progress
      progress.processed += batch.length;
      progress.successful = results.filter(r => r.success).length;
      progress.failed = results.filter(r => !r.success).length;
      progress.skipped = results.filter(r => r.error?.includes('skipped')).length;

      // Calculate averages
      if (progress.processed > 0) {
        progress.averageProcessingTime = progress.totalProcessingTime / progress.processed;
        const successfulResults = results.filter(r => r.success);
        if (successfulResults.length > 0) {
          progress.averageCompressionRatio = successfulResults.reduce((sum, r) => sum + r.compressionRatio, 0) / successfulResults.length;
        }
      }

      // Show batch progress
      console.log(`   ✅ Success: ${batchResults.filter(r => r.success).length}`);
      console.log(`   ❌ Failed: ${batchResults.filter(r => !r.success).length}`);
      console.log(`   ⏭️  Skipped: ${batchResults.filter(r => r.error?.includes('skipped')).length}`);

      // Update database if enabled
      if (config.updateDatabase) {
        await updateDatabaseWithResults(batchResults.filter(r => r.success));
      }

      // Small delay between batches to prevent overwhelming the system
      if (i + config.batchSize < imagesToConvert.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Show final results
    showConversionSummary(progress, results);

    // Show detailed results
    showDetailedResults(results);

    console.log('\n🎉 WebP conversion process completed!');

  } catch (error) {
    console.error('💥 Fatal error during WebP conversion:', error);
    process.exit(1);
  }
}

async function convertSingleImage(
  image: { id: string; r2Key: string; originalFormat: string; prompt: string; eventType: string | null },
  config: ConversionConfig,
  progress: ConversionProgress
): Promise<ConversionResult> {
  const startTime = Date.now();
  let retryCount = 0;

  while (retryCount <= config.maxRetries) {
    try {
      // Check if WebP already exists
      const webpExists = await checkWebPExists(image.r2Key);
      if (webpExists) {
        return {
          imageId: image.id,
          r2Key: image.r2Key,
          success: true,
          originalSize: 0,
          webpSize: 0,
          compressionRatio: 0,
          processingTime: Date.now() - startTime,
          retryCount,
          error: 'skipped - WebP already exists',
        };
      }

      // Download original image from R2
      const downloadResult = await downloadOriginalFromR2(image.r2Key);
      if (!downloadResult.success || !downloadResult.buffer) {
        throw new Error(`Failed to download image: ${downloadResult.error}`);
      }

      const originalBuffer = downloadResult.buffer;
      const originalSize = originalBuffer.length;

      // Convert to WebP
      const webpBuffer = await convertToWebPWithPreset(originalBuffer, config.qualityPreset);
      const webpSize = webpBuffer.length;
      const compressionRatio = calculateCompressionRatio(originalSize, webpSize);

      // Validate conversion if enabled
      let qualityScore: number | undefined;
      if (config.validateConversions) {
        const validation = await validateWebPConversion(originalBuffer, webpBuffer);
        qualityScore = validation.qualityScore;
        
        if (!validation.isValid) {
          throw new Error(`WebP validation failed: ${validation.errors.join(', ')}`);
        }
      }

      // Upload WebP to R2
      const uploadResult = await uploadWebPToR2(image.r2Key, webpBuffer);
      if (!uploadResult.success) {
        throw new Error(`Failed to upload WebP: ${uploadResult.error}`);
      }

      const processingTime = Date.now() - startTime;

      // Update progress
      progress.totalProcessingTime += processingTime;
      progress.totalSpaceSaved += (originalSize - webpSize);

      return {
        imageId: image.id,
        r2Key: image.r2Key,
        success: true,
        originalSize,
        webpSize,
        compressionRatio,
        qualityScore,
        processingTime,
        retryCount,
      };

    } catch (error) {
      retryCount++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (retryCount > config.maxRetries) {
        const processingTime = Date.now() - startTime;
        return {
          imageId: image.id,
          r2Key: image.r2Key,
          success: false,
          originalSize: 0,
          webpSize: 0,
          compressionRatio: 0,
          processingTime,
          error: `Failed after ${retryCount} retries: ${errorMessage}`,
          retryCount,
        };
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }

  // This should never be reached
  return {
    imageId: image.id,
    r2Key: image.r2Key,
    success: false,
    originalSize: 0,
    webpSize: 0,
    compressionRatio: 0,
    processingTime: Date.now() - startTime,
    error: 'Unexpected error',
    retryCount,
  };
}

async function updateDatabaseWithResults(successfulResults: ConversionResult[]) {
  try {
    for (const result of successfulResults) {
      await prisma.generatedImage.update({
        where: { id: result.imageId },
        data: {
          webpKey: generateWebPKey(result.r2Key),
          compressionRatio: result.compressionRatio,
        },
      });
    }
    console.log(`   💾 Updated ${successfulResults.length} database records`);
  } catch (error) {
    console.error('   ❌ Failed to update database:', error);
  }
}

function showConversionSummary(progress: ConversionProgress, results: ConversionResult[]) {
  console.log('\n📊 Conversion Summary:');
  console.log(`   Total images: ${progress.total}`);
  console.log(`   Successfully converted: ${progress.successful}`);
  console.log(`   Failed: ${progress.failed}`);
  console.log(`   Skipped: ${progress.skipped}`);
  console.log(`   Success rate: ${((progress.successful / progress.total) * 100).toFixed(1)}%`);
  
  if (progress.successful > 0) {
    console.log(`   Average processing time: ${progress.averageProcessingTime.toFixed(0)}ms`);
    console.log(`   Average compression ratio: ${progress.averageCompressionRatio.toFixed(2)}%`);
    console.log(`   Total space saved: ${(progress.totalSpaceSaved / 1024 / 1024).toFixed(2)} MB`);
  }
}

function showDetailedResults(results: ConversionResult[]) {
  console.log('\n📋 Detailed Results:');
  
  const successfulResults = results.filter(r => r.success);
  const failedResults = results.filter(r => !r.success);

  if (successfulResults.length > 0) {
    console.log('\n✅ Successful Conversions:');
    successfulResults.slice(0, 5).forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.r2Key}`);
      console.log(`      Original: ${(result.originalSize / 1024).toFixed(1)} KB`);
      console.log(`      WebP: ${(result.webpSize / 1024).toFixed(1)} KB`);
      console.log(`      Compression: ${result.compressionRatio.toFixed(1)}%`);
      console.log(`      Processing time: ${result.processingTime}ms`);
    });

    if (successfulResults.length > 5) {
      console.log(`   ... and ${successfulResults.length - 5} more successful conversions`);
    }
  }

  if (failedResults.length > 0) {
    console.log('\n❌ Failed Conversions:');
    failedResults.slice(0, 3).forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.r2Key}`);
      console.log(`      Error: ${result.error}`);
      console.log(`      Retries: ${result.retryCount}`);
    });

    if (failedResults.length > 3) {
      console.log(`   ... and ${failedResults.length - 3} more failed conversions`);
    }
  }
}

// Command line argument parsing
function parseArguments(): ConversionConfig {
  const args = process.argv.slice(2);
  const config = { ...DEFAULT_CONVERSION_CONFIG };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--quality':
      case '-q':
        const quality = args[i + 1] as keyof typeof WEBP_QUALITY_PRESETS;
        if (Object.keys(WEBP_QUALITY_PRESETS).includes(quality)) {
          config.qualityPreset = quality;
        }
        i++;
        break;
      case '--batch-size':
      case '-b':
        config.batchSize = parseInt(args[i + 1]) || config.batchSize;
        i++;
        break;
      case '--no-validate':
        config.validateConversions = false;
        break;
      case '--no-retry':
        config.retryFailed = false;
        break;
      case '--max-retries':
        config.maxRetries = parseInt(args[i + 1]) || config.maxRetries;
        i++;
        break;
      case '--no-db-update':
        config.updateDatabase = false;
        break;
      case '--help':
      case '-h':
        console.log(`
WebP Conversion Script

Usage: npm run convert:existing:webp [options]

Options:
  --quality, -q <preset>     Quality preset (high, medium, low, lossless) [default: medium]
  --batch-size, -b <size>    Batch size for processing [default: 5]
  --no-validate             Skip WebP validation
  --no-retry                Don't retry failed conversions
  --max-retries <count>     Maximum retry attempts [default: 3]
  --no-db-update            Don't update database with results
  --help, -h                Show this help message

Examples:
  npm run convert:existing:webp
  npm run convert:existing:webp --quality high --batch-size 10
  npm run convert:existing:webp --no-validate --no-db-update
        `);
        process.exit(0);
    }
  }

  return config;
}

// Run the script if executed directly
if (require.main === module) {
  const config = parseArguments();
  
  convertExistingImagesToWebP(config)
    .then(() => {
      console.log('\n✨ WebP conversion completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 WebP conversion failed:', error);
      process.exit(1);
    });
}

export { convertExistingImagesToWebP };
export type { ConversionConfig, ConversionResult }; 