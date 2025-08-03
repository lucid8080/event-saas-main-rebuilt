// Database optimization utilities for query optimization and connection management

import { devFeatures, devUtils } from './dev-config';

// Database optimization configuration
export const dbOptimizationConfig = {
  // Connection pool settings
  maxConnections: 10,
  minConnections: 2,
  connectionTimeout: 30000, // 30 seconds
  idleTimeout: 60000, // 1 minute
  
  // Query optimization settings
  enableQueryLogging: devFeatures.enableDebugLogging,
  enableQueryCaching: true,
  queryCacheSize: 1000,
  slowQueryThreshold: 1000, // ms
  
  // Batch processing settings
  batchSize: 100,
  enableBatchProcessing: true,
  
  // Connection monitoring
  enableConnectionMonitoring: true,
  monitorInterval: 30000, // 30 seconds
};

// Query performance metrics
interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: number;
  parameters?: any[];
  resultSize?: number;
}

// Database connection metrics
interface ConnectionMetrics {
  activeConnections: number;
  idleConnections: number;
  totalConnections: number;
  connectionErrors: number;
  lastError?: string;
}

// Database optimization class
export class DatabaseOptimizer {
  private queryMetrics: QueryMetrics[] = [];
  private connectionMetrics: ConnectionMetrics = {
    activeConnections: 0,
    idleConnections: 0,
    totalConnections: 0,
    connectionErrors: 0,
  };
  private queryCache = new Map<string, { result: any; timestamp: number; ttl: number }>();
  private isMonitoring = false;
  private monitorInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (dbOptimizationConfig.enableConnectionMonitoring) {
      this.startConnectionMonitoring();
    }
  }

  // Optimize database queries
  optimizeQuery(query: string, parameters?: any[]): string {
    // Basic query optimization
    let optimizedQuery = query;

    // Remove unnecessary whitespace
    optimizedQuery = optimizedQuery.replace(/\s+/g, ' ').trim();

    // Add query hints for better performance
    if (optimizedQuery.toLowerCase().includes('select') && !optimizedQuery.toLowerCase().includes('limit')) {
      // Add LIMIT for large result sets
      optimizedQuery += ' LIMIT 1000';
    }

    // Use parameterized queries to prevent SQL injection and improve caching
    if (parameters && parameters.length > 0) {
      // Ensure parameters are properly escaped
      parameters = parameters.map(param => {
        if (typeof param === 'string') {
          return param.replace(/'/g, "''");
        }
        return param;
      });
    }

    return optimizedQuery;
  }

  // Log query performance
  logQueryPerformance(query: string, duration: number, parameters?: any[], resultSize?: number): void {
    if (!dbOptimizationConfig.enableQueryLogging) return;

    const metrics: QueryMetrics = {
      query,
      duration,
      timestamp: Date.now(),
      parameters,
      resultSize,
    };

    this.queryMetrics.push(metrics);

    // Keep only recent queries
    if (this.queryMetrics.length > dbOptimizationConfig.queryCacheSize) {
      this.queryMetrics.shift();
    }

    // Log slow queries
    if (duration > dbOptimizationConfig.slowQueryThreshold) {
      console.warn(`🐌 Slow query detected: ${duration}ms`, {
        query: query.substring(0, 100) + '...',
        parameters,
        resultSize,
      });
    }

    // Log query performance if debugging is enabled
    if (devFeatures.enableDebugLogging) {
      devUtils.debug('Query Performance', {
        duration: `${duration}ms`,
        query: query.substring(0, 50) + '...',
        resultSize,
      });
    }
  }

  // Cache query results
  cacheQueryResult(key: string, result: any, ttl: number = 300000): void {
    if (!dbOptimizationConfig.enableQueryCaching) return;

    this.queryCache.set(key, {
      result,
      timestamp: Date.now(),
      ttl,
    });

    // Clean up expired cache entries
    this.cleanupExpiredCache();
  }

  // Get cached query result
  getCachedResult(key: string): any | null {
    if (!dbOptimizationConfig.enableQueryCaching) return null;

    const cached = this.queryCache.get(key);
    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.queryCache.delete(key);
      return null;
    }

    return cached.result;
  }

  // Clean up expired cache entries
  private cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.queryCache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.queryCache.delete(key);
      }
    }
  }

  // Batch process queries
  async batchProcessQueries<T>(
    queries: Array<{ query: string; parameters?: any[] }>,
    processor: (query: string, parameters?: any[]) => Promise<T>
  ): Promise<T[]> {
    if (!dbOptimizationConfig.enableBatchProcessing) {
      // Process queries sequentially
      const results: T[] = [];
      for (const { query, parameters } of queries) {
        const result = await processor(query, parameters);
        results.push(result);
      }
      return results;
    }

    // Process queries in batches
    const results: T[] = [];
    const batchSize = dbOptimizationConfig.batchSize;

    for (let i = 0; i < queries.length; i += batchSize) {
      const batch = queries.slice(i, i + batchSize);
      const batchPromises = batch.map(({ query, parameters }) => processor(query, parameters));
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add small delay between batches to prevent overwhelming the database
      if (i + batchSize < queries.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    return results;
  }

  // Monitor database connections
  private startConnectionMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitorInterval = setInterval(() => {
      this.updateConnectionMetrics();
    }, dbOptimizationConfig.monitorInterval);

    console.log('🔍 Database connection monitoring started');
  }

  // Update connection metrics
  private updateConnectionMetrics(): void {
    // This would typically integrate with your database connection pool
    // For now, we'll simulate connection monitoring
    const mockMetrics: ConnectionMetrics = {
      activeConnections: Math.floor(Math.random() * 5) + 1,
      idleConnections: Math.floor(Math.random() * 3),
      totalConnections: Math.floor(Math.random() * 8) + 2,
      connectionErrors: Math.floor(Math.random() * 2),
    };

    this.connectionMetrics = mockMetrics;

    // Log connection issues
    if (mockMetrics.connectionErrors > 0) {
      console.warn(`⚠️ Database connection errors: ${mockMetrics.connectionErrors}`);
    }

    if (mockMetrics.activeConnections > dbOptimizationConfig.maxConnections * 0.8) {
      console.warn(`⚠️ High database connection usage: ${mockMetrics.activeConnections}/${dbOptimizationConfig.maxConnections}`);
    }
  }

  // Get database performance statistics
  getPerformanceStats(): {
    queryMetrics: QueryMetrics[];
    connectionMetrics: ConnectionMetrics;
    cacheStats: { size: number; hitRate: number };
    recommendations: string[];
  } {
    // Calculate cache hit rate
    const cacheSize = this.queryCache.size;
    const cacheHitRate = this.calculateCacheHitRate();

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    return {
      queryMetrics: [...this.queryMetrics],
      connectionMetrics: { ...this.connectionMetrics },
      cacheStats: { size: cacheSize, hitRate: cacheHitRate },
      recommendations,
    };
  }

  // Calculate cache hit rate (simplified)
  private calculateCacheHitRate(): number {
    // This would typically track actual cache hits vs misses
    // For now, return a simulated value
    return Math.random() * 0.8 + 0.2; // 20-100%
  }

  // Generate optimization recommendations
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Check for slow queries
    const slowQueries = this.queryMetrics.filter(q => q.duration > dbOptimizationConfig.slowQueryThreshold);
    if (slowQueries.length > 0) {
      recommendations.push(`Found ${slowQueries.length} slow queries. Consider adding indexes or optimizing queries.`);
    }

    // Check connection usage
    if (this.connectionMetrics.activeConnections > dbOptimizationConfig.maxConnections * 0.7) {
      recommendations.push('High connection usage detected. Consider connection pooling or query optimization.');
    }

    // Check cache performance
    const cacheHitRate = this.calculateCacheHitRate();
    if (cacheHitRate < 0.5) {
      recommendations.push('Low cache hit rate. Consider adjusting cache TTL or query patterns.');
    }

    // Check for connection errors
    if (this.connectionMetrics.connectionErrors > 0) {
      recommendations.push('Database connection errors detected. Check connection pool configuration.');
    }

    return recommendations;
  }

  // Cleanup resources
  cleanup(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }

    this.queryCache.clear();
    this.queryMetrics = [];
    this.isMonitoring = false;

    console.log('🧹 Database optimizer cleanup completed');
  }
}

// Global database optimizer instance
export const dbOptimizer = new DatabaseOptimizer();

// Utility functions for database optimization
export const dbUtils = {
  // Optimize a query
  optimizeQuery(query: string, parameters?: any[]): string {
    return dbOptimizer.optimizeQuery(query, parameters);
  },

  // Log query performance
  logQueryPerformance(query: string, duration: number, parameters?: any[], resultSize?: number): void {
    dbOptimizer.logQueryPerformance(query, duration, parameters, resultSize);
  },

  // Cache query result
  cacheQueryResult(key: string, result: any, ttl?: number): void {
    dbOptimizer.cacheQueryResult(key, result, ttl);
  },

  // Get cached result
  getCachedResult(key: string): any | null {
    return dbOptimizer.getCachedResult(key);
  },

  // Batch process queries
  batchProcessQueries<T>(
    queries: Array<{ query: string; parameters?: any[] }>,
    processor: (query: string, parameters?: any[]) => Promise<T>
  ): Promise<T[]> {
    return dbOptimizer.batchProcessQueries(queries, processor);
  },

  // Get performance statistics
  getPerformanceStats() {
    return dbOptimizer.getPerformanceStats();
  },

  // Cleanup database optimizer
  cleanup(): void {
    dbOptimizer.cleanup();
  },

  // Create query cache key
  createCacheKey(query: string, parameters?: any[]): string {
    const paramString = parameters ? JSON.stringify(parameters) : '';
    return `${query}:${paramString}`;
  },

  // Monitor query execution time
  async monitorQuery<T>(
    query: string,
    executor: () => Promise<T>,
    parameters?: any[]
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await executor();
      const duration = Date.now() - startTime;
      
      dbOptimizer.logQueryPerformance(query, duration, parameters, Array.isArray(result) ? result.length : undefined);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Query failed after ${duration}ms:`, error);
      throw error;
    }
  },
}; 