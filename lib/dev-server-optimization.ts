// Development server optimization utilities

import { devFeatures, devUtils } from './dev-config';

// Hot reload optimization
export const hotReloadOptimization = {
  // Optimize file watching
  optimizeFileWatching: () => {
    if (!devFeatures.enableFastRefresh) return;

    // Set up optimized file watching patterns
    const watchPatterns = {
      include: [
        '**/*.{js,jsx,ts,tsx}',
        '**/*.{css,scss,sass}',
        '**/*.{json,md,mdx}',
      ],
      exclude: [
        '**/node_modules/**',
        '**/.next/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**',
        '**/coverage/**',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}',
      ],
    };

    if (typeof window !== 'undefined') {
      // Client-side hot reload optimization
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const startTime = performance.now();
        try {
          const response = await originalFetch(...args);
          const endTime = performance.now();
          
          if (devFeatures.enablePerformanceMonitoring) {
            devUtils.logPerformance(`Fetch: ${args[0]}`, endTime - startTime);
          }
          
          return response;
        } catch (error) {
          const endTime = performance.now();
          if (devFeatures.enablePerformanceMonitoring) {
            devUtils.logPerformance(`Fetch Error: ${args[0]}`, endTime - startTime);
          }
          throw error;
        }
      };
    }

    return watchPatterns;
  },

  // Optimize module resolution
  optimizeModuleResolution: () => {
    if (!devFeatures.enableFastRefresh) return;

    // Cache frequently accessed modules
    const moduleCache = new Map();

    const cachedRequire = (modulePath: string) => {
      if (moduleCache.has(modulePath)) {
        return moduleCache.get(modulePath);
      }

      // In development, we might want to bypass cache for certain modules
      const shouldBypassCache = [
        'react',
        'react-dom',
        'next',
      ].some(pkg => modulePath.includes(pkg));

      if (shouldBypassCache) {
        return require(modulePath);
      }

      const moduleContent = require(modulePath);
      moduleCache.set(modulePath, moduleContent);
      return moduleContent;
    };

    return cachedRequire;
  },

  // Optimize bundle rebuilding
  optimizeBundleRebuilding: () => {
    if (!devFeatures.enableFastRefresh) return;

    // Implement incremental compilation
    const incrementalCompilation = {
      // Track changed files
      changedFiles: new Set<string>(),
      
      // Add file to changed set
      markFileChanged: (filePath: string) => {
        incrementalCompilation.changedFiles.add(filePath);
      },
      
      // Get changed files
      getChangedFiles: () => {
        const files = Array.from(incrementalCompilation.changedFiles);
        incrementalCompilation.changedFiles.clear();
        return files;
      },
      
      // Check if rebuild is needed
      needsRebuild: (filePath: string) => {
        return incrementalCompilation.changedFiles.has(filePath);
      },
    };

    return incrementalCompilation;
  },
};

// Development server performance monitoring
export const devServerMonitoring = {
  // Monitor server performance
  monitorServerPerformance: () => {
    if (!devFeatures.enablePerformanceMonitoring) return;

    const metrics = {
      requestCount: 0,
      averageResponseTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      startTime: Date.now(),
    };

    // Monitor request/response times
    const monitorRequest = (req: any, res: any, next: any) => {
      const startTime = Date.now();
      metrics.requestCount++;

      res.on('finish', () => {
        const duration = Date.now() - startTime;
        metrics.averageResponseTime = 
          (metrics.averageResponseTime * (metrics.requestCount - 1) + duration) / metrics.requestCount;
        
        if (devFeatures.enableDebugLogging) {
          devUtils.debug(`Request: ${req.method} ${req.url}`, { duration, status: res.statusCode });
        }
      });

      next();
    };

    // Monitor memory usage
    const monitorMemory = () => {
      if (typeof process !== 'undefined') {
        const usage = process.memoryUsage();
        metrics.memoryUsage = usage.heapUsed / 1024 / 1024; // MB
        
        if (devFeatures.enableDebugLogging) {
          devUtils.debug('Memory Usage', {
            heapUsed: `${Math.round(metrics.memoryUsage)}MB`,
            heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
            rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
          });
        }
      }
    };

    // Start monitoring
    const memoryInterval = setInterval(monitorMemory, 10000); // Every 10 seconds

    return {
      metrics,
      monitorRequest,
      stop: () => {
        clearInterval(memoryInterval);
      },
    };
  },

  // Monitor client performance
  monitorClientPerformance: () => {
    if (!devFeatures.enablePerformanceMonitoring || typeof window === 'undefined') return;

    const clientMetrics = {
      pageLoadTime: 0,
      resourceLoadTimes: [] as number[],
      memoryUsage: 0,
      errors: [] as Error[],
    };

    // Monitor page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      clientMetrics.pageLoadTime = loadTime;
      
      if (devFeatures.enableDebugLogging) {
        devUtils.debug('Page Load Time', { loadTime: `${loadTime.toFixed(2)}ms` });
      }
    });

    // Monitor resource loading
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          clientMetrics.resourceLoadTimes.push(resourceEntry.duration);
          
          if (devFeatures.enableDebugLogging) {
            devUtils.debug('Resource Load', {
              name: resourceEntry.name,
              duration: `${resourceEntry.duration.toFixed(2)}ms`,
            });
          }
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });

    // Monitor errors
    window.addEventListener('error', (event) => {
      clientMetrics.errors.push(event.error);
      
      if (devFeatures.enableDebugLogging) {
        devUtils.debug('Client Error', {
          message: event.error?.message,
          stack: event.error?.stack,
        });
      }
    });

    return {
      clientMetrics,
      stop: () => {
        observer.disconnect();
      },
    };
  },
};

// Development server optimization helpers
export const devServerHelpers = {
  // Optimize development build
  optimizeDevBuild: () => {
    const optimizations = {
      // Disable minification in development
      minify: false,
      
      // Enable source maps
      sourceMaps: true,
      
      // Optimize for development
      mode: 'development',
      
      // Reduce bundle size in development
      optimization: {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      },
      
      // Faster builds
      cache: {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      },
    };

    return optimizations;
  },

  // Optimize development server startup
  optimizeServerStartup: () => {
    const startupOptimizations = {
      // Preload common modules
      preloadModules: [
        'react',
        'react-dom',
        'next',
        'next/router',
      ],
      
      // Optimize file system access
      fileSystemOptimizations: {
        usePolling: false,
        interval: 1000,
        binaryInterval: 3000,
      },
      
      // Optimize memory usage
      memoryOptimizations: {
        maxOldSpaceSize: 4096, // 4GB
        optimizeForSize: false,
      },
    };

    return startupOptimizations;
  },

  // Get development server recommendations
  getServerRecommendations: () => {
    const recommendations = [];

    // Check Node.js version
    const nodeVersion = process.version;
    if (nodeVersion < '18.0.0') {
      recommendations.push('Upgrade to Node.js 18+ for better performance');
    }

    // Check available memory
    if (typeof process !== 'undefined') {
      const memoryUsage = process.memoryUsage();
      const availableMemory = memoryUsage.heapTotal / 1024 / 1024; // MB
      
      if (availableMemory < 2048) { // 2GB
        recommendations.push('Consider increasing Node.js memory limit (--max-old-space-size=4096)');
      }
    }

    // Check for development optimizations
    if (!devFeatures.enableFastRefresh) {
      recommendations.push('Enable Fast Refresh for better development experience');
    }

    if (!devFeatures.enablePerformanceMonitoring) {
      recommendations.push('Enable performance monitoring for better debugging');
    }

    return recommendations;
  },
}; 