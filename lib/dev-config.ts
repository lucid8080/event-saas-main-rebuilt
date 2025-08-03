// Development environment configuration and utilities

// Environment detection
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

// Development feature flags
export const devFeatures = {
  // Performance monitoring
  enablePerformanceMonitoring: isDevelopment && process.env.NEXT_PUBLIC_ENABLE_PERF_MONITORING === 'true',
  
  // Bundle analysis
  enableBundleAnalysis: isDevelopment && process.env.ANALYZE === 'true',
  
  // Debug logging
  enableDebugLogging: isDevelopment && process.env.NEXT_PUBLIC_DEBUG === 'true',
  
  // Hot reload optimization
  enableFastRefresh: isDevelopment,
  
  // Development tools
  enableDevTools: isDevelopment,
  
  // Error overlay
  enableErrorOverlay: isDevelopment,
};

// Development performance settings
export const devPerformance = {
  // Memory limits
  maxMemoryUsage: isDevelopment ? 1024 : 512, // MB
  
  // Build timeouts
  buildTimeout: isDevelopment ? 300000 : 60000, // ms
  
  // Cache settings
  enableCache: isDevelopment,
  cacheMaxAge: isDevelopment ? 0 : 86400, // seconds
  
  // Source maps
  enableSourceMaps: isDevelopment,
  
  // Minification
  enableMinification: !isDevelopment,
};

// Development server configuration
export const devServer = {
  port: parseInt(process.env.PORT || '3000', 10),
  hostname: process.env.HOSTNAME || 'localhost',
  protocol: process.env.PROTOCOL || 'http',
  
  // Turbo mode settings
  turbo: {
    enabled: process.env.NEXT_TURBO === 'true',
    memoryLimit: process.env.NEXT_TURBO_MEMORY_LIMIT || '4096',
  },
  
  // Hot reload settings
  hotReload: {
    enabled: isDevelopment,
    pollInterval: 1000,
  },
};

// Development utilities
export const devUtils = {
  // Performance monitoring
  logPerformance: (label: string, duration: number) => {
    if (devFeatures.enablePerformanceMonitoring) {
      console.log(`⏱️ ${label}: ${duration}ms`);
    }
  },
  
  // Debug logging
  debug: (message: string, data?: any) => {
    if (devFeatures.enableDebugLogging) {
      console.log(`🐛 [DEBUG] ${message}`, data);
    }
  },
  
  // Memory usage monitoring
  logMemoryUsage: () => {
    if (devFeatures.enablePerformanceMonitoring && typeof process !== 'undefined') {
      const usage = process.memoryUsage();
      console.log(`💾 Memory Usage:`, {
        rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(usage.external / 1024 / 1024)}MB`,
      });
    }
  },
  
  // Bundle size monitoring
  logBundleSize: (bundleName: string, size: number) => {
    if (devFeatures.enableBundleAnalysis) {
      console.log(`📦 Bundle: ${bundleName} - ${(size / 1024 / 1024).toFixed(2)}MB`);
    }
  },
};

// Development environment validation
export const validateDevEnvironment = () => {
  const issues: string[] = [];
  
  // Check Node.js version
  const nodeVersion = process.version;
  const minNodeVersion = '18.0.0';
  if (nodeVersion < minNodeVersion) {
    issues.push(`Node.js version ${nodeVersion} is below minimum required ${minNodeVersion}`);
  }
  
  // Check memory availability
  if (typeof process !== 'undefined') {
    const memoryUsage = process.memoryUsage();
    const availableMemory = memoryUsage.heapTotal / 1024 / 1024; // MB
    
    if (availableMemory < devPerformance.maxMemoryUsage) {
      issues.push(`Available memory (${Math.round(availableMemory)}MB) is below recommended (${devPerformance.maxMemoryUsage}MB)`);
    }
  }
  
  // Check required environment variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      issues.push(`Missing required environment variable: ${envVar}`);
    }
  }
  
  if (issues.length > 0) {
    console.warn('⚠️ Development Environment Issues:');
    issues.forEach(issue => console.warn(`  - ${issue}`));
    return false;
  }
  
  return true;
};

// Development optimization helpers
export const devOptimizations = {
  // Conditional feature loading based on environment
  shouldLoadFeature: (feature: string): boolean => {
    const featureFlags = {
      charts: process.env.NEXT_PUBLIC_ENABLE_CHARTS !== 'false',
      animations: process.env.NEXT_PUBLIC_ENABLE_ANIMATIONS !== 'false',
      cloudServices: process.env.NEXT_PUBLIC_ENABLE_CLOUD_SERVICES !== 'false',
      imageProcessing: process.env.NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING !== 'false',
    };
    
    return featureFlags[feature as keyof typeof featureFlags] ?? true;
  },
  
  // Development-specific component loading
  loadDevComponent: (componentName: string) => {
    if (!isDevelopment) return null;
    
    // Only load development-specific components in dev mode
    const devComponents = [
      'DevTools',
      'PerformanceMonitor',
      'BundleAnalyzer',
      'ErrorBoundary',
    ];
    
    if (devComponents.includes(componentName)) {
      return import(`../components/dev/${componentName}`).catch(() => null);
    }
    
    return null;
  },
  
  // Development performance monitoring
  startPerformanceMonitoring: () => {
    if (!devFeatures.enablePerformanceMonitoring) return;
    
    // Monitor memory usage
    setInterval(() => {
      devUtils.logMemoryUsage();
    }, 30000); // Every 30 seconds
    
    // Monitor bundle loading
    if (typeof window !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            devUtils.logPerformance(
              `Resource: ${resourceEntry.name}`,
              resourceEntry.duration
            );
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
  },
}; 