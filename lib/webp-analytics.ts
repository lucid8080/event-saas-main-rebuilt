import { prisma } from './db';

// WebP Analytics Data Structure
export interface WebPAnalytics {
  totalImages: number;
  webpConvertedImages: number;
  conversionRate: number;
  averageCompressionRatio: number;
  totalStorageSaved: number; // in bytes
  averageProcessingTime: number; // in milliseconds
  qualityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  formatDistribution: {
    png: number;
    jpg: number;
    webp: number;
    other: number;
  };
  errorRate: number;
  performanceMetrics: {
    conversionSuccessRate: number;
    averageFileSizeReduction: number;
    optimizationEffectiveness: number;
  };
}

// Real-time WebP Metrics
export interface WebPMetrics {
  timestamp: Date;
  conversionCount: number;
  totalSizeProcessed: number;
  totalSizeSaved: number;
  averageCompressionRatio: number;
  processingTime: number;
  errors: number;
}

// WebP Performance Tracking
export class WebPPerformanceTracker {
  private metrics: WebPMetrics[] = [];
  private maxMetricsHistory = 1000; // Keep last 1000 metrics

  // Track a single conversion
  trackConversion(
    originalSize: number,
    webpSize: number,
    processingTime: number,
    success: boolean
  ) {
    const metric: WebPMetrics = {
      timestamp: new Date(),
      conversionCount: 1,
      totalSizeProcessed: originalSize,
      totalSizeSaved: originalSize - webpSize,
      averageCompressionRatio: ((originalSize - webpSize) / originalSize) * 100,
      processingTime,
      errors: success ? 0 : 1
    };

    this.metrics.push(metric);
    
    // Keep only the last maxMetricsHistory entries
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  // Get current performance summary
  getCurrentMetrics(): WebPMetrics {
    if (this.metrics.length === 0) {
      return {
        timestamp: new Date(),
        conversionCount: 0,
        totalSizeProcessed: 0,
        totalSizeSaved: 0,
        averageCompressionRatio: 0,
        processingTime: 0,
        errors: 0
      };
    }

    const totalConversions = this.metrics.reduce((sum, m) => sum + m.conversionCount, 0);
    const totalSizeProcessed = this.metrics.reduce((sum, m) => sum + m.totalSizeProcessed, 0);
    const totalSizeSaved = this.metrics.reduce((sum, m) => sum + m.totalSizeSaved, 0);
    const totalProcessingTime = this.metrics.reduce((sum, m) => sum + m.processingTime, 0);
    const totalErrors = this.metrics.reduce((sum, m) => sum + m.errors, 0);

    return {
      timestamp: new Date(),
      conversionCount: totalConversions,
      totalSizeProcessed,
      totalSizeSaved,
      averageCompressionRatio: totalSizeProcessed > 0 ? (totalSizeSaved / totalSizeProcessed) * 100 : 0,
      processingTime: totalConversions > 0 ? totalProcessingTime / totalConversions : 0,
      errors: totalErrors
    };
  }

  // Get performance trends
  getPerformanceTrends(hours: number = 24): {
    conversionTrend: number;
    compressionTrend: number;
    errorTrend: number;
  } {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoffTime);
    const olderMetrics = this.metrics.filter(m => m.timestamp <= cutoffTime);

    if (recentMetrics.length === 0 || olderMetrics.length === 0) {
      return {
        conversionTrend: 0,
        compressionTrend: 0,
        errorTrend: 0
      };
    }

    const recentAvgCompression = recentMetrics.reduce((sum, m) => sum + m.averageCompressionRatio, 0) / recentMetrics.length;
    const olderAvgCompression = olderMetrics.reduce((sum, m) => sum + m.averageCompressionRatio, 0) / olderMetrics.length;

    const recentErrorRate = recentMetrics.reduce((sum, m) => sum + m.errors, 0) / recentMetrics.reduce((sum, m) => sum + m.conversionCount, 0);
    const olderErrorRate = olderMetrics.reduce((sum, m) => sum + m.errors, 0) / olderMetrics.reduce((sum, m) => sum + m.conversionCount, 0);

    return {
      conversionTrend: recentMetrics.length - olderMetrics.length,
      compressionTrend: recentAvgCompression - olderAvgCompression,
      errorTrend: recentErrorRate - olderErrorRate
    };
  }

  // Clear metrics history
  clearMetrics() {
    this.metrics = [];
  }
}

// Global WebP performance tracker
export const webPPerformanceTracker = new WebPPerformanceTracker();

// Get comprehensive WebP analytics from database
export async function getWebPAnalytics(): Promise<WebPAnalytics> {
  try {
    // Get total images
    const totalImages = await prisma.generatedImage.count();

    // Get WebP converted images
    const webpConvertedImages = await prisma.generatedImage.count({
      where: {
        webpEnabled: true,
        webpKey: { not: null }
      }
    });

    // Get compression statistics
    const compressionStats = await prisma.generatedImage.aggregate({
      where: {
        compressionRatio: { not: null }
      },
      _avg: {
        compressionRatio: true
      },
      _sum: {
        compressionRatio: true
      }
    });

    // Get format distribution
    const formatDistribution = await prisma.generatedImage.groupBy({
      by: ['originalFormat'],
      _count: {
        originalFormat: true
      }
    });

    // Get quality distribution (based on compression ratios)
    const qualityStats = await prisma.generatedImage.groupBy({
      by: ['compressionRatio'],
      _count: {
        compressionRatio: true
      },
      having: {
        compressionRatio: { not: null }
      }
    });

    // Calculate quality distribution
    const qualityDistribution = {
      high: 0,
      medium: 0,
      low: 0
    };

    qualityStats.forEach(stat => {
      if (stat.compressionRatio && stat._count.compressionRatio) {
        if (stat.compressionRatio < 20) {
          qualityDistribution.high += stat._count.compressionRatio;
        } else if (stat.compressionRatio < 50) {
          qualityDistribution.medium += stat._count.compressionRatio;
        } else {
          qualityDistribution.low += stat._count.compressionRatio;
        }
      }
    });

    // Calculate format distribution
    const formatDist = {
      png: 0,
      jpg: 0,
      webp: 0,
      other: 0
    };

    formatDistribution.forEach(stat => {
      if (stat.originalFormat && stat._count.originalFormat) {
        switch (stat.originalFormat.toLowerCase()) {
          case 'png':
            formatDist.png += stat._count.originalFormat;
            break;
          case 'jpg':
          case 'jpeg':
            formatDist.jpg += stat._count.originalFormat;
            break;
          case 'webp':
            formatDist.webp += stat._count.originalFormat;
            break;
          default:
            formatDist.other += stat._count.originalFormat;
        }
      }
    });

    // Calculate error rate (images with WebP enabled but no WebP key)
    const errorCount = await prisma.generatedImage.count({
      where: {
        webpEnabled: true,
        webpKey: null
      }
    });

    const errorRate = webpConvertedImages > 0 ? (errorCount / webpConvertedImages) * 100 : 0;

    // Calculate performance metrics
    const conversionSuccessRate = totalImages > 0 ? (webpConvertedImages / totalImages) * 100 : 0;
    const averageFileSizeReduction = compressionStats._avg.compressionRatio || 0;
    const optimizationEffectiveness = averageFileSizeReduction > 0 ? Math.min(100, averageFileSizeReduction * 2) : 0;

    return {
      totalImages,
      webpConvertedImages,
      conversionRate: totalImages > 0 ? (webpConvertedImages / totalImages) * 100 : 0,
      averageCompressionRatio: compressionStats._avg.compressionRatio || 0,
      totalStorageSaved: 0, // Would need to calculate from actual file sizes
      averageProcessingTime: 0, // Would need to track processing times
      qualityDistribution,
      formatDistribution: formatDist,
      errorRate,
      performanceMetrics: {
        conversionSuccessRate,
        averageFileSizeReduction,
        optimizationEffectiveness
      }
    };
  } catch (error) {
    console.error('Error getting WebP analytics:', error);
    throw error;
  }
}

// Get WebP analytics for a specific time period
export async function getWebPAnalyticsForPeriod(
  startDate: Date,
  endDate: Date
): Promise<WebPAnalytics> {
  try {
    const totalImages = await prisma.generatedImage.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const webpConvertedImages = await prisma.generatedImage.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        webpEnabled: true,
        webpKey: { not: null }
      }
    });

    // Get compression statistics for the period
    const compressionStats = await prisma.generatedImage.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        compressionRatio: { not: null }
      },
      _avg: {
        compressionRatio: true
      }
    });

    return {
      totalImages,
      webpConvertedImages,
      conversionRate: totalImages > 0 ? (webpConvertedImages / totalImages) * 100 : 0,
      averageCompressionRatio: compressionStats._avg.compressionRatio || 0,
      totalStorageSaved: 0,
      averageProcessingTime: 0,
      qualityDistribution: { high: 0, medium: 0, low: 0 },
      formatDistribution: { png: 0, jpg: 0, webp: 0, other: 0 },
      errorRate: 0,
      performanceMetrics: {
        conversionSuccessRate: totalImages > 0 ? (webpConvertedImages / totalImages) * 100 : 0,
        averageFileSizeReduction: compressionStats._avg.compressionRatio || 0,
        optimizationEffectiveness: 0
      }
    };
  } catch (error) {
    console.error('Error getting WebP analytics for period:', error);
    throw error;
  }
}

// Track WebP conversion event
export async function trackWebPConversion(
  imageId: string,
  originalSize: number,
  webpSize: number,
  processingTime: number,
  success: boolean
) {
  try {
    // Track in performance tracker
    webPPerformanceTracker.trackConversion(originalSize, webpSize, processingTime, success);

    // Log to database (if you have a WebP events table)
    // await prisma.webPConversionEvent.create({
    //   data: {
    //     imageId,
    //     originalSize,
    //     webpSize,
    //     processingTime,
    //     success,
    //     timestamp: new Date()
    //   }
    // });

    console.log(`WebP conversion tracked: ${imageId}, success: ${success}, compression: ${((originalSize - webpSize) / originalSize * 100).toFixed(2)}%`);
  } catch (error) {
    console.error('Error tracking WebP conversion:', error);
  }
}

// Get WebP conversion statistics
export async function getWebPConversionStats(): Promise<{
  totalConversions: number;
  successfulConversions: number;
  averageCompressionRatio: number;
  averageProcessingTime: number;
  errorRate: number;
}> {
  const metrics = webPPerformanceTracker.getCurrentMetrics();
  
  return {
    totalConversions: metrics.conversionCount,
    successfulConversions: metrics.conversionCount - metrics.errors,
    averageCompressionRatio: metrics.averageCompressionRatio,
    averageProcessingTime: metrics.processingTime,
    errorRate: metrics.conversionCount > 0 ? (metrics.errors / metrics.conversionCount) * 100 : 0
  };
}

// Generate WebP performance report
export async function generateWebPPerformanceReport(): Promise<{
  summary: WebPAnalytics;
  trends: {
    conversionTrend: number;
    compressionTrend: number;
    errorTrend: number;
  };
  recommendations: string[];
}> {
  const summary = await getWebPAnalytics();
  const trends = webPPerformanceTracker.getPerformanceTrends(24);
  const recommendations: string[] = [];

  // Generate recommendations based on analytics
  if (summary.conversionRate < 80) {
    recommendations.push('Consider increasing WebP conversion rate by reviewing failed conversions');
  }

  if (summary.averageCompressionRatio < 20) {
    recommendations.push('Consider adjusting WebP quality settings for better compression');
  }

  if (summary.errorRate > 5) {
    recommendations.push('High error rate detected - review WebP conversion process');
  }

  if (trends.errorTrend > 0) {
    recommendations.push('Error rate is increasing - investigate recent changes');
  }

  if (trends.compressionTrend < -5) {
    recommendations.push('Compression ratio is decreasing - review quality settings');
  }

  return {
    summary,
    trends,
    recommendations
  };
} 