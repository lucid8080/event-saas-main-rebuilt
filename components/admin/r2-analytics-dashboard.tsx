'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  HardDrive, 
  Clock, 
  Users, 
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface R2AnalyticsData {
  success: boolean;
  timestamp: string;
  r2Connection: boolean;
  usage: {
    totalImages: number;
    r2Images: number;
    r2Percentage: number;
    totalStorageBytes: number;
    storageGB: number;
    estimatedMonthlyStorageCost: number;
    estimatedMonthlyOperationCost: number;
    estimatedTotalMonthlyCost: number;
    imagesByEventType: Record<string, number>;
    topUsers: Array<{ userId: string; imageCount: number }>;
  };
  performance: {
    uploadSuccessRate: number;
    uploadFailures: number;
    averageUploadTime: number;
    signedUrlGenerationCount: number;
    signedUrlFailures: number;
    cacheHitRate: number;
  };
  accessPatterns: {
    totalAccesses: number;
    uniqueImagesAccessed: number;
    averageAccessesPerImage: number;
    mostAccessedImages: Array<{ imageId: string; accessCount: number }>;
  };
  cache: {
    size: number;
    activeEntries: number;
  };
  systemHealth: {
    r2Connection: string;
    cacheStatus: string;
    performanceStatus: string;
  };
  recommendations: string[];
}

export default function R2AnalyticsDashboard() {
  const [data, setData] = useState<R2AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/analytics/r2-dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        <XCircle className="h-8 w-8 mr-2" />
        <span>Error: {error}</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        <span>No data available</span>
      </div>
    );
  }

  // Show helpful message when no R2 data is available yet
  if (data.usage.r2Images === 0 && data.usage.totalImages === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">R2 Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor and analyze R2 storage usage and performance
            </p>
          </div>
          <Button onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardContent className="flex items-center justify-center p-12 text-center">
            <div>
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No R2 Data Available Yet</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                The analytics dashboard will populate once you start generating images that are stored in Cloudflare R2. 
                Currently, no images have been uploaded to R2 storage.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Generate some images to see usage statistics</p>
                <p>• R2 connection status: {data.r2Connection ? 'Connected' : 'Not connected'}</p>
                <p>• Total images in database: {data.usage.totalImages}</p>
                <p>• R2 images: {data.usage.r2Images}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'excellent':
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fair':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy':
      case 'poor':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">R2 Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </p>
        </div>
        <Button onClick={fetchAnalytics} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">R2 Connection</CardTitle>
            {getStatusIcon(data.systemHealth.r2Connection)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {data.systemHealth.r2Connection}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.r2Connection ? 'Connected' : 'Disconnected'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            {getStatusIcon(data.systemHealth.performanceStatus)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {data.systemHealth.performanceStatus}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.performance.uploadSuccessRate}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Status</CardTitle>
            {getStatusIcon(data.systemHealth.cacheStatus)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.cache.activeEntries}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.cache.size} total entries
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="access">Access Patterns</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Images</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.usage.totalImages}</div>
                <Progress value={data.usage.r2Percentage} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {data.usage.r2Percentage}% in R2
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.usage.storageGB} GB</div>
                <p className="text-xs text-muted-foreground">
                  ${data.usage.estimatedMonthlyStorageCost}/month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Operations</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.performance.signedUrlGenerationCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  ${data.usage.estimatedMonthlyOperationCost}/month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${data.usage.estimatedTotalMonthlyCost}
                </div>
                <p className="text-xs text-muted-foreground">
                  Estimated monthly
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Event Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Images by Event Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.usage.imagesByEventType).map(([eventType, count]) => (
                  <div key={eventType} className="flex items-center justify-between">
                    <span className="capitalize">{eventType || 'Unknown'}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {data.performance.uploadSuccessRate}%
                </div>
                <Progress value={data.performance.uploadSuccessRate} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  {data.performance.uploadFailures} failures
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Upload Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {data.performance.averageUploadTime}ms
                </div>
                <p className="text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Response time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache Hit Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {data.performance.cacheHitRate}%
                </div>
                <Progress value={data.performance.cacheHitRate} className="mt-2" />
                <p className="text-sm text-muted-foreground">
                  Signed URL cache efficiency
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Accesses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {data.accessPatterns.totalAccesses}
                </div>
                <p className="text-sm text-muted-foreground">
                  All time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Unique Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {data.accessPatterns.uniqueImagesAccessed}
                </div>
                <p className="text-sm text-muted-foreground">
                  Accessed at least once
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avg. Accesses/Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {data.accessPatterns.averageAccessesPerImage}
                </div>
                <p className="text-sm text-muted-foreground">
                  Per image average
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Most Accessed Images */}
          <Card>
            <CardHeader>
              <CardTitle>Most Accessed Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.accessPatterns.mostAccessedImages.slice(0, 5).map((image, index) => (
                  <div key={image.imageId} className="flex items-center justify-between">
                    <span className="text-sm">Image {index + 1}</span>
                    <Badge variant="outline">{image.accessCount} accesses</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Recommendations</CardTitle>
              <CardDescription>
                Based on current usage patterns and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.recommendations.length > 0 ? (
                <div className="space-y-3">
                  {data.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="text-sm text-green-700">
                    All systems are performing optimally. No recommendations at this time.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 