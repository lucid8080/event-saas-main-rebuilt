// API cleanup utilities for identifying and removing unused API endpoints

import { devFeatures, devUtils } from './dev-config';

// API endpoint interface
interface ApiEndpoint {
  path: string;
  method: string;
  handler: string;
  lastUsed?: number;
  usageCount: number;
  isDeprecated: boolean;
  dependencies: string[];
}

// API cleanup configuration
export const apiCleanupConfig = {
  // Cleanup settings
  enableUsageTracking: true,
  enableDeprecationWarnings: true,
  enableAutoCleanup: false, // Set to true to automatically remove unused endpoints
  
  // Thresholds
  unusedThreshold: 30, // days - mark as unused after this time
  deprecationThreshold: 90, // days - mark as deprecated after this time
  minUsageCount: 5, // minimum usage count to keep endpoint
  
  // Monitoring settings
  trackUsage: true,
  trackDependencies: true,
  trackPerformance: true,
};

// API cleanup manager class
export class ApiCleanupManager {
  private endpoints: Map<string, ApiEndpoint> = new Map();
  private usageStats: Map<string, { count: number; lastUsed: number; avgResponseTime: number }> = new Map();
  private isTracking = false;

  constructor() {
    if (apiCleanupConfig.enableUsageTracking) {
      this.startUsageTracking();
    }
  }

  // Register an API endpoint
  registerEndpoint(path: string, method: string, handler: string, dependencies: string[] = []): void {
    const key = `${method.toUpperCase()}:${path}`;
    
    const endpoint: ApiEndpoint = {
      path,
      method: method.toUpperCase(),
      handler,
      lastUsed: Date.now(),
      usageCount: 0,
      isDeprecated: false,
      dependencies,
    };

    this.endpoints.set(key, endpoint);
    this.usageStats.set(key, { count: 0, lastUsed: Date.now(), avgResponseTime: 0 });

    if (devFeatures.enableDebugLogging) {
      devUtils.debug('API Endpoint Registered', { path, method, handler, dependencies });
    }
  }

  // Track API endpoint usage
  trackUsage(path: string, method: string, responseTime?: number): void {
    if (!apiCleanupConfig.trackUsage) return;

    const key = `${method.toUpperCase()}:${path}`;
    const stats = this.usageStats.get(key);

    if (stats) {
      stats.count++;
      stats.lastUsed = Date.now();
      
      if (responseTime !== undefined) {
        // Update average response time
        stats.avgResponseTime = (stats.avgResponseTime + responseTime) / 2;
      }

      // Update endpoint usage count
      const endpoint = this.endpoints.get(key);
      if (endpoint) {
        endpoint.usageCount = stats.count;
        endpoint.lastUsed = Date.now();
      }
    }
  }

  // Mark endpoint as deprecated
  markDeprecated(path: string, method: string, reason?: string): void {
    const key = `${method.toUpperCase()}:${path}`;
    const endpoint = this.endpoints.get(key);

    if (endpoint) {
      endpoint.isDeprecated = true;
      
      if (apiCleanupConfig.enableDeprecationWarnings) {
        console.warn(`⚠️ API endpoint deprecated: ${method.toUpperCase()} ${path}`, { reason });
      }
    }
  }

  // Start usage tracking
  private startUsageTracking(): void {
    if (this.isTracking) return;

    this.isTracking = true;
    console.log('🔍 API usage tracking started');
  }

  // Analyze API endpoints for cleanup
  analyzeEndpoints(): {
    total: number;
    active: number;
    unused: number;
    deprecated: number;
    recommendations: string[];
    unusedEndpoints: ApiEndpoint[];
    deprecatedEndpoints: ApiEndpoint[];
  } {
    const now = Date.now();
    const unusedThreshold = apiCleanupConfig.unusedThreshold * 24 * 60 * 60 * 1000; // Convert to milliseconds
    const deprecationThreshold = apiCleanupConfig.deprecationThreshold * 24 * 60 * 60 * 1000;

    const unusedEndpoints: ApiEndpoint[] = [];
    const deprecatedEndpoints: ApiEndpoint[] = [];
    const recommendations: string[] = [];

    for (const [key, endpoint] of Array.from(this.endpoints.entries())) {
      const stats = this.usageStats.get(key);
      const daysSinceLastUsed = stats ? (now - stats.lastUsed) / (24 * 60 * 60 * 1000) : 0;

      // Check if endpoint is unused
      if (daysSinceLastUsed > apiCleanupConfig.unusedThreshold || 
          (stats && stats.count < apiCleanupConfig.minUsageCount)) {
        unusedEndpoints.push(endpoint);
      }

      // Check if endpoint should be deprecated
      if (daysSinceLastUsed > deprecationThreshold && !endpoint.isDeprecated) {
        deprecatedEndpoints.push(endpoint);
        recommendations.push(`Consider deprecating endpoint: ${endpoint.method} ${endpoint.path} (unused for ${Math.round(daysSinceLastUsed)} days)`);
      }

      // Check for performance issues
      if (stats && stats.avgResponseTime > 1000) {
        recommendations.push(`Slow endpoint detected: ${endpoint.method} ${endpoint.path} (avg: ${stats.avgResponseTime.toFixed(2)}ms)`);
      }
    }

    const total = this.endpoints.size;
    const active = total - unusedEndpoints.length - deprecatedEndpoints.length;
    const unused = unusedEndpoints.length;
    const deprecated = deprecatedEndpoints.length;

    return {
      total,
      active,
      unused,
      deprecated,
      recommendations,
      unusedEndpoints,
      deprecatedEndpoints,
    };
  }

  // Get endpoint statistics
  getEndpointStats(): {
    endpoints: ApiEndpoint[];
    usageStats: Map<string, { count: number; lastUsed: number; avgResponseTime: number }>;
    analysis: ReturnType<typeof this.analyzeEndpoints>;
  } {
    return {
      endpoints: Array.from(this.endpoints.values()),
      usageStats: new Map(this.usageStats),
      analysis: this.analyzeEndpoints(),
    };
  }

  // Remove unused endpoints
  removeUnusedEndpoints(): string[] {
    if (!apiCleanupConfig.enableAutoCleanup) {
      console.log('⚠️ Auto cleanup is disabled. Use analyzeEndpoints() to see unused endpoints.');
      return [];
    }

    const analysis = this.analyzeEndpoints();
    const removedEndpoints: string[] = [];

    for (const endpoint of analysis.unusedEndpoints) {
      const key = `${endpoint.method}:${endpoint.path}`;
      this.endpoints.delete(key);
      this.usageStats.delete(key);
      removedEndpoints.push(`${endpoint.method} ${endpoint.path}`);
    }

    if (removedEndpoints.length > 0) {
      console.log(`🧹 Removed ${removedEndpoints.length} unused API endpoints:`, removedEndpoints);
    }

    return removedEndpoints;
  }

  // Generate cleanup report
  generateCleanupReport(): {
    summary: string;
    details: {
      total: number;
      active: number;
      unused: number;
      deprecated: number;
    };
    recommendations: string[];
    unusedEndpoints: string[];
    deprecatedEndpoints: string[];
  } {
    const analysis = this.analyzeEndpoints();
    
    const summary = `API Cleanup Report: ${analysis.total} total endpoints, ${analysis.active} active, ${analysis.unused} unused, ${analysis.deprecated} deprecated`;
    
    const unusedEndpoints = analysis.unusedEndpoints.map(e => `${e.method} ${e.path}`);
    const deprecatedEndpoints = analysis.deprecatedEndpoints.map(e => `${e.method} ${e.path}`);

    return {
      summary,
      details: {
        total: analysis.total,
        active: analysis.active,
        unused: analysis.unused,
        deprecated: analysis.deprecated,
      },
      recommendations: analysis.recommendations,
      unusedEndpoints,
      deprecatedEndpoints,
    };
  }

  // Cleanup resources
  cleanup(): void {
    this.endpoints.clear();
    this.usageStats.clear();
    this.isTracking = false;
    console.log('🧹 API cleanup manager cleanup completed');
  }
}

// Global API cleanup manager instance
export const apiCleanupManager = new ApiCleanupManager();

// Utility functions for API cleanup
export const apiUtils = {
  // Register an API endpoint
  registerEndpoint(path: string, method: string, handler: string, dependencies?: string[]): void {
    apiCleanupManager.registerEndpoint(path, method, handler, dependencies);
  },

  // Track API usage
  trackUsage(path: string, method: string, responseTime?: number): void {
    apiCleanupManager.trackUsage(path, method, responseTime);
  },

  // Mark endpoint as deprecated
  markDeprecated(path: string, method: string, reason?: string): void {
    apiCleanupManager.markDeprecated(path, method, reason);
  },

  // Analyze endpoints
  analyzeEndpoints() {
    return apiCleanupManager.analyzeEndpoints();
  },

  // Get endpoint statistics
  getEndpointStats() {
    return apiCleanupManager.getEndpointStats();
  },

  // Remove unused endpoints
  removeUnusedEndpoints(): string[] {
    return apiCleanupManager.removeUnusedEndpoints();
  },

  // Generate cleanup report
  generateCleanupReport() {
    return apiCleanupManager.generateCleanupReport();
  },

  // Cleanup API manager
  cleanup(): void {
    apiCleanupManager.cleanup();
  },

  // Monitor API endpoint performance
  async monitorEndpoint<T>(
    path: string,
    method: string,
    executor: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await executor();
      const responseTime = Date.now() - startTime;
      
      apiCleanupManager.trackUsage(path, method, responseTime);
      
      if (devFeatures.enableDebugLogging) {
        devUtils.debug('API Endpoint Performance', {
          path,
          method,
          responseTime: `${responseTime}ms`,
        });
      }
      
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`❌ API endpoint failed: ${method} ${path} after ${responseTime}ms`, error);
      throw error;
    }
  },

  // Check if endpoint is deprecated
  isDeprecated(path: string, method: string): boolean {
    const key = `${method.toUpperCase()}:${path}`;
    const endpoint = apiCleanupManager.getEndpointStats().endpoints.find(e => 
      `${e.method}:${e.path}` === key
    );
    return endpoint?.isDeprecated || false;
  },
}; 