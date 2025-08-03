import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { 
  getR2UsageStats, 
  getR2PerformanceStats, 
  getImageAccessPatterns 
} from '@/lib/r2-analytics';
import { r2Cache } from '@/lib/r2-cache';
import { testR2Connection } from '@/lib/r2';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin or hero
    if (session.user.role !== 'ADMIN' && session.user.role !== 'HERO') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get all analytics data - handle R2 connection failure gracefully
    let r2Connection = false;
    let cacheStats = { size: 0, entries: [] };
    
    try {
      r2Connection = await testR2Connection();
      cacheStats = r2Cache.getStats();
    } catch (error) {
      console.log('R2 connection test failed, continuing with basic analytics:', error);
    }

    const [usageStats, performanceStats, accessPatterns] = await Promise.all([
      getR2UsageStats(),
      getR2PerformanceStats(),
      getImageAccessPatterns()
    ]);

    // Calculate cost estimates (Cloudflare R2 pricing)
    const storageCostPerGB = 0.015; // $0.015 per GB per month
    const classAOperations = performanceStats.signedUrlGenerationCount; // $4.50 per million
    const classBOperations = 0; // Downloads, $0.36 per million

    const storageGB = usageStats.totalStorageBytes / (1024 * 1024 * 1024);
    const estimatedMonthlyStorageCost = storageGB * storageCostPerGB;
    const estimatedMonthlyOperationCost = (classAOperations / 1000000) * 4.50 + (classBOperations / 1000000) * 0.36;
    const estimatedTotalMonthlyCost = estimatedMonthlyStorageCost + estimatedMonthlyOperationCost;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      r2Connection,
      
      // Usage Statistics
      usage: {
        ...usageStats,
        storageGB: Math.round(storageGB * 100) / 100,
        estimatedMonthlyStorageCost: Math.round(estimatedMonthlyStorageCost * 100) / 100,
        estimatedMonthlyOperationCost: Math.round(estimatedMonthlyOperationCost * 100) / 100,
        estimatedTotalMonthlyCost: Math.round(estimatedTotalMonthlyCost * 100) / 100
      },

      // Performance Statistics
      performance: {
        ...performanceStats,
        cacheHitRate: cacheStats.size > 0 ? Math.round((cacheStats.size / (cacheStats.size + performanceStats.signedUrlGenerationCount)) * 100) : 0
      },

      // Access Patterns
      accessPatterns,

      // Cache Statistics
      cache: {
        ...cacheStats,
        activeEntries: cacheStats.entries.filter(entry => entry.expiresAt > Date.now()).length
      },

      // System Health
      systemHealth: {
        r2Connection: r2Connection ? 'healthy' : 'unhealthy',
        cacheStatus: cacheStats.size > 0 ? 'active' : 'empty',
        performanceStatus: performanceStats.uploadSuccessRate > 95 ? 'excellent' : 
                          performanceStats.uploadSuccessRate > 90 ? 'good' : 
                          performanceStats.uploadSuccessRate > 80 ? 'fair' : 'poor'
      },

      // Recommendations
      recommendations: generateRecommendations(usageStats, performanceStats, accessPatterns)
    });

  } catch (error) {
    console.error('Error getting R2 analytics dashboard:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get analytics dashboard',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateRecommendations(
  usage: any, 
  performance: any, 
  access: any
): string[] {
  const recommendations: string[] = [];

  // Storage recommendations
  if (usage.r2Percentage < 50) {
    recommendations.push('Consider migrating more images to R2 for better performance and cost savings');
  }

  if (usage.totalStorageBytes > 10 * 1024 * 1024 * 1024) { // 10GB
    recommendations.push('Large storage usage detected. Consider implementing image compression or cleanup policies');
  }

  // Performance recommendations
  if (performance.uploadSuccessRate < 95) {
    recommendations.push('Upload success rate below 95%. Review error logs and consider implementing retry logic');
  }

  if (performance.averageUploadTime > 5000) { // 5 seconds
    recommendations.push('Average upload time is high. Consider optimizing image sizes or implementing background uploads');
  }

  // Access pattern recommendations
  if (access.averageAccessesPerImage > 10) {
    recommendations.push('High image access frequency detected. Consider implementing CDN caching for frequently accessed images');
  }

  if (access.totalAccesses > 1000) {
    recommendations.push('High traffic detected. Monitor R2 costs and consider implementing access rate limiting');
  }

  // Cache recommendations
  if (performance.signedUrlGenerationCount > 1000) {
    recommendations.push('High signed URL generation. Cache is working well, consider extending cache duration');
  }

  return recommendations;
} 