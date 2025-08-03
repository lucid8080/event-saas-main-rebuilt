// Image optimization utilities for processing and storage optimization

import { devFeatures, devUtils } from './dev-config';

// Image optimization configuration
export const imageOptimizationConfig = {
  // Processing settings
  enableCompression: true,
  enableResizing: true,
  enableFormatConversion: true,
  enableProgressiveLoading: true,
  
  // Quality settings
  defaultQuality: 85,
  maxWidth: 1920,
  maxHeight: 1080,
  thumbnailSize: 300,
  
  // Storage settings
  enableCaching: true,
  cacheMaxAge: 86400, // 24 hours
  enableCDN: true,
  
  // Performance settings
  enableLazyLoading: true,
  enablePreloading: false,
  batchProcessing: true,
  maxConcurrentProcessing: 3,
};

// Image processing options
interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  progressive?: boolean;
  optimize?: boolean;
}

// Image metadata
interface ImageMetadata {
  width: number;
  height: number;
  size: number; // bytes
  format: string;
  hasAlpha: boolean;
  colorSpace: string;
}

// Image optimization class
export class ImageOptimizer {
  private processingQueue: Array<{ id: string; task: () => Promise<any> }> = [];
  private isProcessing = false;
  private processedImages = new Map<string, { metadata: ImageMetadata; timestamp: number }>();

  constructor() {
    if (imageOptimizationConfig.batchProcessing) {
      this.startBatchProcessing();
    }
  }

  // Optimize image with Sharp
  async optimizeImage(
    inputBuffer: Buffer,
    options: ImageProcessingOptions = {}
  ): Promise<{ buffer: Buffer; metadata: ImageMetadata }> {
    try {
      // Dynamic import of Sharp to avoid loading it unnecessarily
      const sharp = await import('sharp');
      
      let pipeline = sharp.default(inputBuffer);

      // Resize if dimensions are specified
      if (options.width || options.height) {
        pipeline = pipeline.resize(options.width, options.height, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Set quality
      const quality = options.quality || imageOptimizationConfig.defaultQuality;

      // Convert format if specified
      if (options.format) {
        switch (options.format) {
          case 'jpeg':
            pipeline = pipeline.jpeg({ quality, progressive: options.progressive });
            break;
          case 'png':
            pipeline = pipeline.png({ quality, progressive: options.progressive });
            break;
          case 'webp':
            pipeline = pipeline.webp({ quality });
            break;
          case 'avif':
            pipeline = pipeline.avif({ quality });
            break;
        }
      } else {
        // Default to JPEG with optimization
        pipeline = pipeline.jpeg({ quality, progressive: options.progressive });
      }

      // Optimize if enabled
      if (options.optimize !== false && imageOptimizationConfig.enableCompression) {
        pipeline = pipeline.optimize();
      }

      const buffer = await pipeline.toBuffer();
      const metadata = await pipeline.metadata();

      const imageMetadata: ImageMetadata = {
        width: metadata.width || 0,
        height: metadata.height || 0,
        size: buffer.length,
        format: metadata.format || 'unknown',
        hasAlpha: metadata.hasAlpha || false,
        colorSpace: metadata.space || 'unknown',
      };

      return { buffer, metadata };
    } catch (error) {
      console.error('❌ Image optimization failed:', error);
      throw error;
    }
  }

  // Generate thumbnail
  async generateThumbnail(inputBuffer: Buffer): Promise<Buffer> {
    const { buffer } = await this.optimizeImage(inputBuffer, {
      width: imageOptimizationConfig.thumbnailSize,
      height: imageOptimizationConfig.thumbnailSize,
      quality: 80,
      format: 'jpeg',
    });

    return buffer;
  }

  // Process image in batch
  async processImageBatch(
    images: Array<{ id: string; buffer: Buffer; options?: ImageProcessingOptions }>
  ): Promise<Map<string, { buffer: Buffer; metadata: ImageMetadata }>> {
    const results = new Map<string, { buffer: Buffer; metadata: ImageMetadata }>();
    const batchSize = imageOptimizationConfig.maxConcurrentProcessing;

    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      const batchPromises = batch.map(async ({ id, buffer, options }) => {
        try {
          const result = await this.optimizeImage(buffer, options);
          results.set(id, result);
          return { id, success: true };
        } catch (error) {
          console.error(`❌ Failed to process image ${id}:`, error);
          return { id, success: false, error };
        }
      });

      await Promise.all(batchPromises);

      // Add small delay between batches to prevent overwhelming the system
      if (i + batchSize < images.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  // Start batch processing
  private startBatchProcessing(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.processQueue();
  }

  // Process queue
  private async processQueue(): Promise<void> {
    while (this.processingQueue.length > 0) {
      const { id, task } = this.processingQueue.shift()!;
      
      try {
        await task();
        if (devFeatures.enableDebugLogging) {
          devUtils.debug('Image processed', { id });
        }
      } catch (error) {
        console.error(`❌ Failed to process image ${id}:`, error);
      }
    }

    this.isProcessing = false;
  }

  // Add to processing queue
  addToQueue(id: string, task: () => Promise<any>): void {
    this.processingQueue.push({ id, task });
    
    if (!this.isProcessing) {
      this.startBatchProcessing();
    }
  }

  // Get image metadata
  async getImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
    try {
      const sharp = await import('sharp');
      const metadata = await sharp.default(buffer).metadata();

      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        size: buffer.length,
        format: metadata.format || 'unknown',
        hasAlpha: metadata.hasAlpha || false,
        colorSpace: metadata.space || 'unknown',
      };
    } catch (error) {
      console.error('❌ Failed to get image metadata:', error);
      throw error;
    }
  }

  // Cache processed image
  cacheProcessedImage(id: string, metadata: ImageMetadata): void {
    if (!imageOptimizationConfig.enableCaching) return;

    this.processedImages.set(id, {
      metadata,
      timestamp: Date.now(),
    });

    // Clean up old cache entries
    this.cleanupCache();
  }

  // Get cached image metadata
  getCachedMetadata(id: string): ImageMetadata | null {
    if (!imageOptimizationConfig.enableCaching) return null;

    const cached = this.processedImages.get(id);
    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > imageOptimizationConfig.cacheMaxAge * 1000) {
      this.processedImages.delete(id);
      return null;
    }

    return cached.metadata;
  }

  // Cleanup cache
  private cleanupCache(): void {
    const now = Date.now();
    const maxAge = imageOptimizationConfig.cacheMaxAge * 1000;

    for (const [id, cached] of this.processedImages.entries()) {
      if (now - cached.timestamp > maxAge) {
        this.processedImages.delete(id);
      }
    }
  }

  // Get optimization statistics
  getOptimizationStats(): {
    processedImages: number;
    cacheSize: number;
    queueLength: number;
    recommendations: string[];
  } {
    const recommendations: string[] = [];

    if (this.processedImages.size > 1000) {
      recommendations.push('Large image cache detected. Consider reducing cache size or implementing cache eviction.');
    }

    if (this.processingQueue.length > 10) {
      recommendations.push('Long processing queue detected. Consider increasing concurrent processing limit.');
    }

    return {
      processedImages: this.processedImages.size,
      cacheSize: this.processedImages.size,
      queueLength: this.processingQueue.length,
      recommendations,
    };
  }

  // Cleanup resources
  cleanup(): void {
    this.processingQueue = [];
    this.processedImages.clear();
    this.isProcessing = false;
    console.log('🧹 Image optimizer cleanup completed');
  }
}

// Global image optimizer instance
export const imageOptimizer = new ImageOptimizer();

// Utility functions for image optimization
export const imageUtils = {
  // Optimize image
  async optimizeImage(inputBuffer: Buffer, options?: ImageProcessingOptions) {
    return imageOptimizer.optimizeImage(inputBuffer, options);
  },

  // Generate thumbnail
  async generateThumbnail(inputBuffer: Buffer): Promise<Buffer> {
    return imageOptimizer.generateThumbnail(inputBuffer);
  },

  // Process image batch
  async processImageBatch(
    images: Array<{ id: string; buffer: Buffer; options?: ImageProcessingOptions }>
  ) {
    return imageOptimizer.processImageBatch(images);
  },

  // Get image metadata
  async getImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
    return imageOptimizer.getImageMetadata(buffer);
  },

  // Cache processed image
  cacheProcessedImage(id: string, metadata: ImageMetadata): void {
    imageOptimizer.cacheProcessedImage(id, metadata);
  },

  // Get cached metadata
  getCachedMetadata(id: string): ImageMetadata | null {
    return imageOptimizer.getCachedMetadata(id);
  },

  // Get optimization statistics
  getOptimizationStats() {
    return imageOptimizer.getOptimizationStats();
  },

  // Cleanup image optimizer
  cleanup(): void {
    imageOptimizer.cleanup();
  },

  // Monitor image processing performance
  async monitorImageProcessing<T>(
    imageId: string,
    processor: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await processor();
      const duration = Date.now() - startTime;
      
      if (devFeatures.enableDebugLogging) {
        devUtils.debug('Image Processing Performance', {
          imageId,
          duration: `${duration}ms`,
        });
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Image processing failed for ${imageId} after ${duration}ms:`, error);
      throw error;
    }
  },

  // Check if image needs optimization
  needsOptimization(metadata: ImageMetadata): boolean {
    return (
      metadata.size > 1024 * 1024 || // > 1MB
      metadata.width > imageOptimizationConfig.maxWidth ||
      metadata.height > imageOptimizationConfig.maxHeight ||
      metadata.format === 'png' // PNG files are usually larger
    );
  },

  // Get optimal format for image
  getOptimalFormat(metadata: ImageMetadata): 'jpeg' | 'png' | 'webp' | 'avif' {
    if (metadata.hasAlpha) {
      return 'png'; // Keep alpha channel
    }
    
    // Prefer modern formats for better compression
    return 'webp';
  },
}; 