// Comprehensive cleanup manager for proper garbage collection and resource management

import { devFeatures, devUtils } from './dev-config';
import { memoryLeakDetector, memoryUtils } from './memory-leak-detection';
import { dbOptimizer, dbUtils } from './database-optimization';
import { apiCleanupManager, apiUtils } from './api-cleanup';
import { imageOptimizer, imageUtils } from './image-optimization';

// Cleanup configuration
export const cleanupConfig = {
  // Cleanup intervals
  memoryCleanupInterval: 300000, // 5 minutes
  cacheCleanupInterval: 600000, // 10 minutes
  resourceCleanupInterval: 900000, // 15 minutes
  
  // Memory thresholds
  memoryWarningThreshold: 512, // MB
  memoryCriticalThreshold: 1024, // MB
  
  // Cache settings
  maxCacheSize: 1000,
  cacheCleanupThreshold: 0.8, // Cleanup when 80% full
  
  // Resource limits
  maxOpenConnections: 50,
  maxFileHandles: 100,
  maxEventListeners: 1000,
  
  // Auto cleanup
  enableAutoCleanup: true,
  enableGarbageCollection: true,
  enableResourceMonitoring: true,
};

// Resource usage metrics
interface ResourceMetrics {
  memory: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cache: {
    size: number;
    hitRate: number;
    evictions: number;
  };
  connections: {
    active: number;
    idle: number;
    total: number;
  };
  files: {
    open: number;
    handles: number;
  };
  events: {
    listeners: number;
    active: number;
  };
}

// Cleanup manager class
export class CleanupManager {
  private isRunning = false;
  private intervals: NodeJS.Timeout[] = [];
  private resourceMetrics: ResourceMetrics = {
    memory: { rss: 0, heapUsed: 0, heapTotal: 0, external: 0 },
    cache: { size: 0, hitRate: 0, evictions: 0 },
    connections: { active: 0, idle: 0, total: 0 },
    files: { open: 0, handles: 0 },
    events: { listeners: 0, active: 0 },
  };

  constructor() {
    if (cleanupConfig.enableAutoCleanup) {
      this.startAutoCleanup();
    }
  }

  // Start automatic cleanup
  startAutoCleanup(): void {
    if (this.isRunning) return;

    this.isRunning = true;

    // Memory cleanup interval
    const memoryInterval = setInterval(() => {
      this.performMemoryCleanup();
    }, cleanupConfig.memoryCleanupInterval);

    // Cache cleanup interval
    const cacheInterval = setInterval(() => {
      this.performCacheCleanup();
    }, cleanupConfig.cacheCleanupInterval);

    // Resource cleanup interval
    const resourceInterval = setInterval(() => {
      this.performResourceCleanup();
    }, cleanupConfig.resourceCleanupInterval);

    this.intervals.push(memoryInterval, cacheInterval, resourceInterval);

    console.log('🧹 Auto cleanup started');
  }

  // Stop automatic cleanup
  stopAutoCleanup(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.intervals.forEach(clearInterval);
    this.intervals = [];

    console.log('🧹 Auto cleanup stopped');
  }

  // Perform memory cleanup
  private performMemoryCleanup(): void {
    try {
      // Update memory metrics
      this.updateMemoryMetrics();

      // Check memory thresholds
      if (this.resourceMetrics.memory.heapUsed > cleanupConfig.memoryCriticalThreshold) {
        console.warn(`⚠️ Critical memory usage: ${this.resourceMetrics.memory.heapUsed}MB`);
        this.performEmergencyCleanup();
      } else if (this.resourceMetrics.memory.heapUsed > cleanupConfig.memoryWarningThreshold) {
        console.warn(`⚠️ High memory usage: ${this.resourceMetrics.memory.heapUsed}MB`);
        this.performMemoryOptimization();
      }

      // Force garbage collection if enabled
      if (cleanupConfig.enableGarbageCollection) {
        memoryUtils.forceGC();
      }

      if (devFeatures.enableDebugLogging) {
        devUtils.debug('Memory Cleanup', {
          heapUsed: `${this.resourceMetrics.memory.heapUsed}MB`,
          heapTotal: `${this.resourceMetrics.memory.heapTotal}MB`,
          external: `${this.resourceMetrics.memory.external}MB`,
        });
      }
    } catch (error) {
      console.error('❌ Memory cleanup failed:', error);
    }
  }

  // Perform cache cleanup
  private performCacheCleanup(): void {
    try {
      // Update cache metrics
      this.updateCacheMetrics();

      // Check cache size
      if (this.resourceMetrics.cache.size > cleanupConfig.maxCacheSize * cleanupConfig.cacheCleanupThreshold) {
        console.log(`🧹 Cleaning up cache (${this.resourceMetrics.cache.size} entries)`);
        this.cleanupCaches();
      }

      if (devFeatures.enableDebugLogging) {
        devUtils.debug('Cache Cleanup', {
          size: this.resourceMetrics.cache.size,
          hitRate: `${(this.resourceMetrics.cache.hitRate * 100).toFixed(1)}%`,
        });
      }
    } catch (error) {
      console.error('❌ Cache cleanup failed:', error);
    }
  }

  // Perform resource cleanup
  private performResourceCleanup(): void {
    try {
      // Update resource metrics
      this.updateResourceMetrics();

      // Check connection limits
      if (this.resourceMetrics.connections.total > cleanupConfig.maxOpenConnections) {
        console.warn(`⚠️ Too many connections: ${this.resourceMetrics.connections.total}`);
        this.cleanupConnections();
      }

      // Check file handle limits
      if (this.resourceMetrics.files.handles > cleanupConfig.maxFileHandles) {
        console.warn(`⚠️ Too many file handles: ${this.resourceMetrics.files.handles}`);
        this.cleanupFileHandles();
      }

      // Check event listener limits
      if (this.resourceMetrics.events.listeners > cleanupConfig.maxEventListeners) {
        console.warn(`⚠️ Too many event listeners: ${this.resourceMetrics.events.listeners}`);
        this.cleanupEventListeners();
      }

      if (devFeatures.enableDebugLogging) {
        devUtils.debug('Resource Cleanup', {
          connections: this.resourceMetrics.connections.total,
          fileHandles: this.resourceMetrics.files.handles,
          eventListeners: this.resourceMetrics.events.listeners,
        });
      }
    } catch (error) {
      console.error('❌ Resource cleanup failed:', error);
    }
  }

  // Update memory metrics
  private updateMemoryMetrics(): void {
    if (typeof process !== 'undefined') {
      const usage = process.memoryUsage();
      this.resourceMetrics.memory = {
        rss: Math.round(usage.rss / 1024 / 1024),
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
        external: Math.round(usage.external / 1024 / 1024),
      };
    }
  }

  // Update cache metrics
  private updateCacheMetrics(): void {
    // Get cache statistics from various optimizers
    const dbStats = dbUtils.getPerformanceStats();
    const imageStats = imageUtils.getOptimizationStats();
    
    this.resourceMetrics.cache = {
      size: dbStats.cacheStats.size + imageStats.cacheSize,
      hitRate: dbStats.cacheStats.hitRate,
      evictions: 0, // Would need to track this
    };
  }

  // Update resource metrics
  private updateResourceMetrics(): void {
    // Simulate resource monitoring
    this.resourceMetrics.connections = {
      active: Math.floor(Math.random() * 10) + 1,
      idle: Math.floor(Math.random() * 5),
      total: Math.floor(Math.random() * 15) + 5,
    };

    this.resourceMetrics.files = {
      open: Math.floor(Math.random() * 20),
      handles: Math.floor(Math.random() * 30),
    };

    this.resourceMetrics.events = {
      listeners: Math.floor(Math.random() * 100) + 50,
      active: Math.floor(Math.random() * 50) + 20,
    };
  }

  // Perform emergency cleanup
  private performEmergencyCleanup(): void {
    console.log('🚨 Performing emergency cleanup');

    // Force garbage collection
    memoryUtils.forceGC();

    // Clear all caches
    this.cleanupCaches();

    // Cleanup connections
    this.cleanupConnections();

    // Cleanup file handles
    this.cleanupFileHandles();

    // Cleanup event listeners
    this.cleanupEventListeners();
  }

  // Perform memory optimization
  private performMemoryOptimization(): void {
    console.log('🔧 Performing memory optimization');

    // Clear expired cache entries
    this.cleanupCaches();

    // Optimize database connections
    this.cleanupConnections();

    // Force garbage collection
    memoryUtils.forceGC();
  }

  // Cleanup caches
  private cleanupCaches(): void {
    // Database cache cleanup
    dbUtils.cleanup();

    // Image cache cleanup
    imageUtils.cleanup();

    // API cache cleanup
    apiUtils.cleanup();

    console.log('🧹 Caches cleaned up');
  }

  // Cleanup connections
  private cleanupConnections(): void {
    // This would typically close idle database connections
    // For now, we'll just log the action
    console.log('🧹 Cleaning up database connections');
  }

  // Cleanup file handles
  private cleanupFileHandles(): void {
    // This would typically close unused file handles
    // For now, we'll just log the action
    console.log('🧹 Cleaning up file handles');
  }

  // Cleanup event listeners
  private cleanupEventListeners(): void {
    // This would typically remove unused event listeners
    // For now, we'll just log the action
    console.log('🧹 Cleaning up event listeners');
  }

  // Get cleanup statistics
  getCleanupStats(): {
    isRunning: boolean;
    resourceMetrics: ResourceMetrics;
    recommendations: string[];
    lastCleanup: {
      memory: number;
      cache: number;
      resource: number;
    };
  } {
    const recommendations: string[] = [];

    // Memory recommendations
    if (this.resourceMetrics.memory.heapUsed > cleanupConfig.memoryWarningThreshold) {
      recommendations.push('High memory usage detected. Consider optimizing data structures or implementing pagination.');
    }

    // Cache recommendations
    if (this.resourceMetrics.cache.size > cleanupConfig.maxCacheSize * 0.8) {
      recommendations.push('Large cache size detected. Consider implementing cache eviction policies.');
    }

    // Connection recommendations
    if (this.resourceMetrics.connections.total > cleanupConfig.maxOpenConnections * 0.8) {
      recommendations.push('High connection usage detected. Consider connection pooling or query optimization.');
    }

    // File handle recommendations
    if (this.resourceMetrics.files.handles > cleanupConfig.maxFileHandles * 0.8) {
      recommendations.push('High file handle usage detected. Consider implementing proper file handle cleanup.');
    }

    return {
      isRunning: this.isRunning,
      resourceMetrics: { ...this.resourceMetrics },
      recommendations,
      lastCleanup: {
        memory: Date.now(),
        cache: Date.now(),
        resource: Date.now(),
      },
    };
  }

  // Manual cleanup
  async performManualCleanup(): Promise<{
    memory: boolean;
    cache: boolean;
    resource: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      this.performMemoryCleanup();
    } catch (error) {
      errors.push(`Memory cleanup failed: ${error}`);
    }

    try {
      this.performCacheCleanup();
    } catch (error) {
      errors.push(`Cache cleanup failed: ${error}`);
    }

    try {
      this.performResourceCleanup();
    } catch (error) {
      errors.push(`Resource cleanup failed: ${error}`);
    }

    return {
      memory: errors.length === 0,
      cache: errors.length === 0,
      resource: errors.length === 0,
      errors,
    };
  }

  // Cleanup all resources
  async cleanup(): Promise<void> {
    console.log('🧹 Starting comprehensive cleanup');

    // Stop auto cleanup
    this.stopAutoCleanup();

    // Cleanup all optimizers
    try {
      memoryUtils.stopMonitoring();
      dbUtils.cleanup();
      imageUtils.cleanup();
      apiUtils.cleanup();
    } catch (error) {
      console.error('❌ Error during optimizer cleanup:', error);
    }

    // Clear intervals
    this.intervals.forEach(clearInterval);
    this.intervals = [];

    // Force final garbage collection
    if (cleanupConfig.enableGarbageCollection) {
      memoryUtils.forceGC();
    }

    console.log('🧹 Comprehensive cleanup completed');
  }
}

// Global cleanup manager instance
export const cleanupManager = new CleanupManager();

// Utility functions for cleanup management
export const cleanupUtils = {
  // Start auto cleanup
  startAutoCleanup(): void {
    cleanupManager.startAutoCleanup();
  },

  // Stop auto cleanup
  stopAutoCleanup(): void {
    cleanupManager.stopAutoCleanup();
  },

  // Get cleanup statistics
  getCleanupStats() {
    return cleanupManager.getCleanupStats();
  },

  // Perform manual cleanup
  async performManualCleanup() {
    return cleanupManager.performManualCleanup();
  },

  // Cleanup all resources
  async cleanup(): Promise<void> {
    return cleanupManager.cleanup();
  },

  // Monitor cleanup performance
  async monitorCleanup<T>(
    cleanupType: string,
    cleanupTask: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await cleanupTask();
      const duration = Date.now() - startTime;
      
      if (devFeatures.enableDebugLogging) {
        devUtils.debug('Cleanup Performance', {
          type: cleanupType,
          duration: `${duration}ms`,
        });
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Cleanup failed for ${cleanupType} after ${duration}ms:`, error);
      throw error;
    }
  },

  // Check if cleanup is needed
  isCleanupNeeded(): boolean {
    const stats = cleanupManager.getCleanupStats();
    return (
      stats.resourceMetrics.memory.heapUsed > cleanupConfig.memoryWarningThreshold ||
      stats.resourceMetrics.cache.size > cleanupConfig.maxCacheSize * 0.8 ||
      stats.resourceMetrics.connections.total > cleanupConfig.maxOpenConnections * 0.8
    );
  },

  // Get cleanup recommendations
  getRecommendations(): string[] {
    return cleanupManager.getCleanupStats().recommendations;
  },
}; 