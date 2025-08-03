// Memory leak detection and monitoring utilities

import { devFeatures, devUtils } from './dev-config';

// Memory leak detection configuration
export const memoryLeakConfig = {
  // Detection thresholds
  memoryThreshold: 1024, // MB - warn if memory usage exceeds this
  growthThreshold: 50, // MB - warn if memory grows by this amount
  checkInterval: 10000, // ms - how often to check for leaks
  historySize: 100, // number of memory snapshots to keep
  
  // Leak detection settings
  enableHeapSnapshots: true,
  enableGarbageCollection: true,
  enableMemoryProfiling: false, // Only enable when debugging
};

// Memory snapshot interface
interface MemorySnapshot {
  timestamp: number;
  rss: number; // MB
  heapTotal: number; // MB
  heapUsed: number; // MB
  external: number; // MB
  arrayBuffers: number; // MB
}

// Memory leak detector class
export class MemoryLeakDetector {
  private snapshots: MemorySnapshot[] = [];
  private isMonitoring = false;
  private intervalId: NodeJS.Timeout | null = null;
  private warnings: string[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupGlobalListeners();
    }
  }

  // Start memory monitoring
  startMonitoring(): void {
    if (this.isMonitoring || !devFeatures.enablePerformanceMonitoring) return;

    this.isMonitoring = true;
    this.snapshots = [];
    this.warnings = [];

    // Take initial snapshot
    this.takeSnapshot();

    // Start periodic monitoring
    this.intervalId = setInterval(() => {
      this.checkMemoryUsage();
    }, memoryLeakConfig.checkInterval);

    console.log('🔍 Memory leak detection started');
  }

  // Stop memory monitoring
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('🔍 Memory leak detection stopped');
  }

  // Take a memory snapshot
  private takeSnapshot(): MemorySnapshot {
    if (typeof process === 'undefined') {
      return {
        timestamp: Date.now(),
        rss: 0,
        heapTotal: 0,
        heapUsed: 0,
        external: 0,
        arrayBuffers: 0,
      };
    }

    const usage = process.memoryUsage();
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      rss: Math.round(usage.rss / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
      arrayBuffers: Math.round((usage as any).arrayBuffers / 1024 / 1024) || 0,
    };

    this.snapshots.push(snapshot);

    // Keep only recent snapshots
    if (this.snapshots.length > memoryLeakConfig.historySize) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  // Check for memory issues
  private checkMemoryUsage(): void {
    const currentSnapshot = this.takeSnapshot();
    const previousSnapshot = this.snapshots[this.snapshots.length - 2];

    if (!previousSnapshot) return;

    // Check for memory growth
    const heapGrowth = currentSnapshot.heapUsed - previousSnapshot.heapUsed;
    const rssGrowth = currentSnapshot.rss - previousSnapshot.rss;

    // Detect potential memory leaks
    if (heapGrowth > memoryLeakConfig.growthThreshold) {
      const warning = `⚠️ Potential memory leak detected: Heap usage increased by ${heapGrowth}MB`;
      this.warnings.push(warning);
      console.warn(warning);
      
      if (devFeatures.enableDebugLogging) {
        devUtils.debug('Memory Leak Warning', {
          heapGrowth,
          currentHeap: currentSnapshot.heapUsed,
          previousHeap: previousSnapshot.heapUsed,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Check for high memory usage
    if (currentSnapshot.rss > memoryLeakConfig.memoryThreshold) {
      const warning = `⚠️ High memory usage: ${currentSnapshot.rss}MB RSS`;
      this.warnings.push(warning);
      console.warn(warning);
    }

    // Log memory usage if debugging is enabled
    if (devFeatures.enableDebugLogging) {
      devUtils.debug('Memory Snapshot', {
        rss: `${currentSnapshot.rss}MB`,
        heapUsed: `${currentSnapshot.heapUsed}MB`,
        heapTotal: `${currentSnapshot.heapTotal}MB`,
        external: `${currentSnapshot.external}MB`,
        growth: `${heapGrowth}MB`,
      });
    }
  }

  // Get memory statistics
  getMemoryStats(): {
    current: MemorySnapshot;
    history: MemorySnapshot[];
    warnings: string[];
    growthRate: number;
    averageUsage: number;
  } {
    const current = this.snapshots[this.snapshots.length - 1];
    const history = [...this.snapshots];
    
    // Calculate growth rate
    let growthRate = 0;
    if (this.snapshots.length >= 2) {
      const first = this.snapshots[0];
      const last = this.snapshots[this.snapshots.length - 1];
      const timeDiff = (last.timestamp - first.timestamp) / 1000 / 60; // minutes
      growthRate = (last.heapUsed - first.heapUsed) / timeDiff; // MB/minute
    }

    // Calculate average usage
    const averageUsage = this.snapshots.reduce((sum, snap) => sum + snap.heapUsed, 0) / this.snapshots.length;

    return {
      current: current || this.takeSnapshot(),
      history,
      warnings: [...this.warnings],
      growthRate,
      averageUsage,
    };
  }

  // Force garbage collection (if available)
  forceGarbageCollection(): void {
    if (typeof global !== 'undefined' && (global as any).gc) {
      (global as any).gc();
      console.log('🗑️ Forced garbage collection');
    } else if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
      console.log('🗑️ Forced garbage collection');
    } else {
      console.log('⚠️ Garbage collection not available');
    }
  }

  // Setup global event listeners for memory monitoring
  private setupGlobalListeners(): void {
    if (typeof window === 'undefined') return;

    // Monitor page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden, take a snapshot
        this.takeSnapshot();
      }
    });

    // Monitor beforeunload for cleanup
    window.addEventListener('beforeunload', () => {
      this.stopMonitoring();
    });

    // Monitor memory pressure events (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory && memory.usedJSHeapSize) {
        setInterval(() => {
          const usedMB = memory.usedJSHeapSize / 1024 / 1024;
          if (usedMB > memoryLeakConfig.memoryThreshold) {
            console.warn(`⚠️ High JavaScript heap usage: ${usedMB.toFixed(2)}MB`);
          }
        }, 5000);
      }
    }
  }

  // Get recommendations for memory optimization
  getRecommendations(): string[] {
    const stats = this.getMemoryStats();
    const recommendations: string[] = [];

    if (stats.growthRate > 10) {
      recommendations.push('High memory growth rate detected. Check for memory leaks in components.');
    }

    if (stats.current.rss > memoryLeakConfig.memoryThreshold) {
      recommendations.push('High memory usage. Consider optimizing large data structures.');
    }

    if (stats.current.external > 100) {
      recommendations.push('High external memory usage. Check for unclosed file handles or network connections.');
    }

    if (stats.warnings.length > 5) {
      recommendations.push('Multiple memory warnings detected. Review memory management practices.');
    }

    return recommendations;
  }
}

// Global memory leak detector instance
export const memoryLeakDetector = new MemoryLeakDetector();

// Utility functions for memory management
export const memoryUtils = {
  // Get current memory usage
  getCurrentMemoryUsage(): MemorySnapshot {
    return memoryLeakDetector.getMemoryStats().current;
  },

  // Get memory stats (alias for compatibility)
  getMemoryStats() {
    return memoryLeakDetector.getMemoryStats();
  },

  // Start memory monitoring
  startMonitoring(): void {
    memoryLeakDetector.startMonitoring();
  },

  // Stop memory monitoring
  stopMonitoring(): void {
    memoryLeakDetector.stopMonitoring();
  },

  // Force garbage collection
  forceGC(): void {
    memoryLeakDetector.forceGarbageCollection();
  },

  // Force garbage collection (alias for compatibility)
  forceGarbageCollection(): void {
    memoryLeakDetector.forceGarbageCollection();
  },

  // Get memory recommendations
  getRecommendations(): string[] {
    return memoryLeakDetector.getRecommendations();
  },

  // Monitor specific component memory usage
  monitorComponent(componentName: string): () => void {
    const startSnapshot = memoryLeakDetector.getMemoryStats().current;
    
    return () => {
      const endSnapshot = memoryLeakDetector.getMemoryStats().current;
      const memoryDiff = endSnapshot.heapUsed - startSnapshot.heapUsed;
      
      if (memoryDiff > 10) {
        console.warn(`⚠️ Component ${componentName} may have memory leak: +${memoryDiff}MB`);
      }
    };
  },
}; 