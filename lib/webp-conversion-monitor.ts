import { prisma } from './db';
import { 
  checkWebPExists, 
  deleteWebPFromR2, 
  getWebPInfo,
  generateWebPKey 
} from './webp-storage';

// Conversion status tracking
export interface ConversionStatus {
  imageId: string;
  r2Key: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
  originalFormat: string;
  webpKey?: string;
  originalSize?: number;
  webpSize?: number;
  compressionRatio?: number;
  qualityScore?: number;
  processingTime?: number;
  error?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Conversion batch tracking
export interface ConversionBatch {
  id: string;
  batchNumber: number;
  totalImages: number;
  completedImages: number;
  failedImages: number;
  skippedImages: number;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'partially_completed';
  averageCompressionRatio?: number;
  totalSpaceSaved?: number;
  errors: string[];
}

// Monitor configuration
export interface MonitorConfig {
  enableProgressTracking: boolean;
  enableRollback: boolean;
  maxFailedImages: number;
  autoRollbackOnFailure: boolean;
  progressUpdateInterval: number; // milliseconds
}

// Default monitor configuration
export const DEFAULT_MONITOR_CONFIG: MonitorConfig = {
  enableProgressTracking: true,
  enableRollback: true,
  maxFailedImages: 10,
  autoRollbackOnFailure: false,
  progressUpdateInterval: 5000, // 5 seconds
};

// Conversion progress tracker
export class WebPConversionMonitor {
  private config: MonitorConfig;
  private currentBatch?: ConversionBatch;
  private statusMap: Map<string, ConversionStatus> = new Map();
  private progressInterval?: NodeJS.Timeout;

  constructor(config: MonitorConfig = DEFAULT_MONITOR_CONFIG) {
    this.config = config;
  }

  // Start monitoring a new conversion batch
  async startBatch(batchNumber: number, totalImages: number): Promise<string> {
    const batchId = `batch_${Date.now()}_${batchNumber}`;
    
    this.currentBatch = {
      id: batchId,
      batchNumber,
      totalImages,
      completedImages: 0,
      failedImages: 0,
      skippedImages: 0,
      startTime: new Date(),
      status: 'running',
      errors: [],
    };

    console.log(`📊 Started monitoring batch ${batchNumber} with ${totalImages} images`);

    // Start progress tracking if enabled
    if (this.config.enableProgressTracking) {
      this.startProgressTracking();
    }

    return batchId;
  }

  // Track individual image conversion
  async trackImage(
    imageId: string,
    r2Key: string,
    originalFormat: string,
    status: ConversionStatus['status'],
    details?: {
      webpKey?: string;
      originalSize?: number;
      webpSize?: number;
      compressionRatio?: number;
      qualityScore?: number;
      processingTime?: number;
      error?: string;
    }
  ): Promise<void> {
    const conversionStatus: ConversionStatus = {
      imageId,
      r2Key,
      status,
      originalFormat,
      ...details,
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.statusMap.set(imageId, conversionStatus);

    // Update batch progress
    if (this.currentBatch) {
      switch (status) {
        case 'completed':
          this.currentBatch.completedImages++;
          break;
        case 'failed':
          this.currentBatch.failedImages++;
          if (details?.error) {
            this.currentBatch.errors.push(`${r2Key}: ${details.error}`);
          }
          break;
        case 'skipped':
          this.currentBatch.skippedImages++;
          break;
      }

      // Check if we should auto-rollback
      if (this.config.autoRollbackOnFailure && 
          this.currentBatch.failedImages >= this.config.maxFailedImages) {
        console.warn(`⚠️ Auto-rollback triggered: ${this.currentBatch.failedImages} failed images`);
        await this.rollbackBatch();
      }
    }
  }

  // Update image status
  async updateImageStatus(
    imageId: string,
    status: ConversionStatus['status'],
    details?: Partial<ConversionStatus>
  ): Promise<void> {
    const existingStatus = this.statusMap.get(imageId);
    if (existingStatus) {
      const updatedStatus: ConversionStatus = {
        ...existingStatus,
        ...details,
        status,
        updatedAt: new Date(),
      };
      this.statusMap.set(imageId, updatedStatus);
    }
  }

  // Complete the current batch
  async completeBatch(): Promise<ConversionBatch | undefined> {
    if (!this.currentBatch) {
      return undefined;
    }

    this.currentBatch.endTime = new Date();
    this.currentBatch.status = this.determineBatchStatus();

    // Calculate batch statistics
    const completedConversions = Array.from(this.statusMap.values())
      .filter(s => s.status === 'completed');

    if (completedConversions.length > 0) {
      this.currentBatch.averageCompressionRatio = completedConversions
        .reduce((sum, c) => sum + (c.compressionRatio || 0), 0) / completedConversions.length;
      
      this.currentBatch.totalSpaceSaved = completedConversions
        .reduce((sum, c) => sum + ((c.originalSize || 0) - (c.webpSize || 0)), 0);
    }

    // Stop progress tracking
    this.stopProgressTracking();

    console.log(`📊 Batch ${this.currentBatch.batchNumber} completed:`);
    console.log(`   ✅ Completed: ${this.currentBatch.completedImages}`);
    console.log(`   ❌ Failed: ${this.currentBatch.failedImages}`);
    console.log(`   ⏭️  Skipped: ${this.currentBatch.skippedImages}`);
    console.log(`   📈 Success rate: ${((this.currentBatch.completedImages / this.currentBatch.totalImages) * 100).toFixed(1)}%`);

    return this.currentBatch;
  }

  // Rollback failed conversions
  async rollbackBatch(): Promise<{
    success: boolean;
    rolledBackCount: number;
    errors: string[];
  }> {
    if (!this.config.enableRollback) {
      return {
        success: false,
        rolledBackCount: 0,
        errors: ['Rollback is disabled'],
      };
    }

    console.log('🔄 Starting rollback of failed conversions...');

    const failedConversions = Array.from(this.statusMap.values())
      .filter(s => s.status === 'failed' && s.webpKey);

    let rolledBackCount = 0;
    const errors: string[] = [];

    for (const conversion of failedConversions) {
      try {
        if (conversion.webpKey) {
          // Check if WebP file exists before attempting deletion
          const webpExists = await checkWebPExists(conversion.r2Key);
          if (webpExists) {
            const deleteResult = await deleteWebPFromR2(conversion.r2Key);
            if (deleteResult.success) {
              rolledBackCount++;
              await this.updateImageStatus(conversion.imageId, 'rolled_back');
            } else {
              errors.push(`Failed to delete WebP for ${conversion.r2Key}: ${deleteResult.error}`);
            }
          }
        }

        // Update database to remove WebP information
        await prisma.generatedImage.update({
          where: { id: conversion.imageId },
          data: {
            webpKey: null,
            compressionRatio: null,
          },
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Rollback failed for ${conversion.r2Key}: ${errorMessage}`);
      }
    }

    console.log(`🔄 Rollback completed: ${rolledBackCount} files rolled back, ${errors.length} errors`);

    return {
      success: errors.length === 0,
      rolledBackCount,
      errors,
    };
  }

  // Get conversion statistics
  getConversionStats(): {
    total: number;
    completed: number;
    failed: number;
    skipped: number;
    inProgress: number;
    rolledBack: number;
    successRate: number;
    averageCompressionRatio: number;
    totalSpaceSaved: number;
  } {
    const statuses = Array.from(this.statusMap.values());
    const total = statuses.length;
    const completed = statuses.filter(s => s.status === 'completed').length;
    const failed = statuses.filter(s => s.status === 'failed').length;
    const skipped = statuses.filter(s => s.status === 'skipped').length;
    const inProgress = statuses.filter(s => s.status === 'in_progress').length;
    const rolledBack = statuses.filter(s => s.status === 'rolled_back').length;

    const successRate = total > 0 ? (completed / total) * 100 : 0;

    const completedConversions = statuses.filter(s => s.status === 'completed');
    const averageCompressionRatio = completedConversions.length > 0
      ? completedConversions.reduce((sum, c) => sum + (c.compressionRatio || 0), 0) / completedConversions.length
      : 0;

    const totalSpaceSaved = completedConversions.reduce((sum, c) => 
      sum + ((c.originalSize || 0) - (c.webpSize || 0)), 0);

    return {
      total,
      completed,
      failed,
      skipped,
      inProgress,
      rolledBack,
      successRate,
      averageCompressionRatio,
      totalSpaceSaved,
    };
  }

  // Get detailed status for an image
  getImageStatus(imageId: string): ConversionStatus | undefined {
    return this.statusMap.get(imageId);
  }

  // Get all conversion statuses
  getAllStatuses(): ConversionStatus[] {
    return Array.from(this.statusMap.values());
  }

  // Start progress tracking
  private startProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }

    this.progressInterval = setInterval(() => {
      this.showProgress();
    }, this.config.progressUpdateInterval);
  }

  // Stop progress tracking
  private stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = undefined;
    }
  }

  // Show current progress
  private showProgress(): void {
    if (!this.currentBatch) return;

    const stats = this.getConversionStats();
    const elapsed = Date.now() - this.currentBatch.startTime.getTime();
    const elapsedSeconds = Math.floor(elapsed / 1000);

    console.log(`📊 Progress: ${stats.completed}/${this.currentBatch.totalImages} completed (${stats.successRate.toFixed(1)}%) - ${elapsedSeconds}s elapsed`);
  }

  // Determine batch status
  private determineBatchStatus(): ConversionBatch['status'] {
    if (!this.currentBatch) return 'failed';

    const { completedImages, failedImages, totalImages } = this.currentBatch;

    if (failedImages === 0) {
      return 'completed';
    } else if (completedImages === 0) {
      return 'failed';
    } else {
      return 'partially_completed';
    }
  }

  // Clean up resources
  cleanup(): void {
    this.stopProgressTracking();
    this.statusMap.clear();
    this.currentBatch = undefined;
  }
}

// Utility functions for conversion monitoring

// Get conversion status from database
export async function getDatabaseConversionStatus(): Promise<{
  totalImages: number;
  convertedImages: number;
  failedImages: number;
  averageCompressionRatio: number;
  totalSpaceSaved: number;
}> {
  const totalImages = await prisma.generatedImage.count({
    where: { webpEnabled: true },
  });

  const convertedImages = await prisma.generatedImage.count({
    where: {
      webpEnabled: true,
      compressionRatio: { not: null },
    },
  });

  const failedImages = await prisma.generatedImage.count({
    where: {
      webpEnabled: true,
      compressionRatio: null,
      webpKey: { not: null },
    },
  });

  const compressionStats = await prisma.generatedImage.aggregate({
    where: {
      webpEnabled: true,
      compressionRatio: { not: null },
    },
    _avg: { compressionRatio: true },
  });

  const averageCompressionRatio = compressionStats._avg.compressionRatio || 0;

  // Estimate total space saved (this would need to be calculated from actual file sizes)
  const totalSpaceSaved = 0; // TODO: Implement actual calculation

  return {
    totalImages,
    convertedImages,
    failedImages,
    averageCompressionRatio,
    totalSpaceSaved,
  };
}

// Validate conversion results
export async function validateConversionResults(): Promise<{
  valid: boolean;
  issues: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check for images with WebP keys but no compression ratio
  const incompleteConversions = await prisma.generatedImage.findMany({
    where: {
      webpKey: { not: null },
      compressionRatio: null,
    },
  });

  if (incompleteConversions.length > 0) {
    issues.push(`${incompleteConversions.length} images have WebP keys but no compression ratio`);
    recommendations.push('Run conversion script to complete these conversions');
  }

  // Check for images with compression ratio but no WebP key
  const missingWebPKeys = await prisma.generatedImage.findMany({
    where: {
      compressionRatio: { not: null },
      webpKey: null,
    },
  });

  if (missingWebPKeys.length > 0) {
    issues.push(`${missingWebPKeys.length} images have compression ratios but no WebP keys`);
    recommendations.push('Update database to add missing WebP keys');
  }

  // Check for very low compression ratios
  const lowCompressionImages = await prisma.generatedImage.findMany({
    where: {
      compressionRatio: { lt: 10 },
      compressionRatio: { not: null },
    },
  });

  if (lowCompressionImages.length > 0) {
    issues.push(`${lowCompressionImages.length} images have very low compression ratios (< 10%)`);
    recommendations.push('Consider re-converting these images with different quality settings');
  }

  return {
    valid: issues.length === 0,
    issues,
    recommendations,
  };
} 