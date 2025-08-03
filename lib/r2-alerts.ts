import { prisma } from '@/lib/db';
import { getR2UsageStats, getR2PerformanceStats } from '@/lib/r2-analytics';

// Alert types
export interface R2Alert {
  id: string;
  type: 'cost' | 'performance' | 'storage' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

// Alert thresholds configuration
export interface AlertThresholds {
  // Cost alerts
  monthlyCostThreshold: number; // $ amount
  dailyCostThreshold: number; // $ amount
  
  // Performance alerts
  uploadSuccessRateThreshold: number; // percentage
  averageUploadTimeThreshold: number; // milliseconds
  cacheHitRateThreshold: number; // percentage
  
  // Storage alerts
  storageUsageThreshold: number; // GB
  storageGrowthRateThreshold: number; // GB per day
  
  // Error rate alerts
  errorRateThreshold: number; // percentage
}

// Default alert thresholds
export const DEFAULT_ALERT_THRESHOLDS: AlertThresholds = {
  monthlyCostThreshold: 50, // $50/month
  dailyCostThreshold: 5, // $5/day
  uploadSuccessRateThreshold: 95, // 95%
  averageUploadTimeThreshold: 5000, // 5 seconds
  cacheHitRateThreshold: 80, // 80%
  storageUsageThreshold: 10, // 10GB
  storageGrowthRateThreshold: 1, // 1GB/day
  errorRateThreshold: 5, // 5%
};

// Check for alerts based on current metrics
export async function checkR2Alerts(thresholds: AlertThresholds = DEFAULT_ALERT_THRESHOLDS): Promise<R2Alert[]> {
  const alerts: R2Alert[] = [];
  
  try {
    // Get current metrics
    const [usageStats, performanceStats] = await Promise.all([
      getR2UsageStats(),
      getR2PerformanceStats()
    ]);

    // Calculate current values
    const currentMonthlyCost = (usageStats.totalStorageBytes / (1024 * 1024 * 1024)) * 0.015; // $0.015 per GB
    const currentDailyCost = currentMonthlyCost / 30; // Rough estimate
    const currentStorageGB = usageStats.totalStorageBytes / (1024 * 1024 * 1024);

    // Check cost alerts
    if (currentMonthlyCost > thresholds.monthlyCostThreshold) {
      alerts.push({
        id: `cost-monthly-${Date.now()}`,
        type: 'cost',
        severity: currentMonthlyCost > thresholds.monthlyCostThreshold * 2 ? 'critical' : 'high',
        title: 'High Monthly R2 Cost',
        message: `Monthly R2 cost ($${currentMonthlyCost.toFixed(2)}) exceeds threshold ($${thresholds.monthlyCostThreshold})`,
        threshold: thresholds.monthlyCostThreshold,
        currentValue: currentMonthlyCost,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    if (currentDailyCost > thresholds.dailyCostThreshold) {
      alerts.push({
        id: `cost-daily-${Date.now()}`,
        type: 'cost',
        severity: currentDailyCost > thresholds.dailyCostThreshold * 2 ? 'critical' : 'medium',
        title: 'High Daily R2 Cost',
        message: `Daily R2 cost ($${currentDailyCost.toFixed(2)}) exceeds threshold ($${thresholds.dailyCostThreshold})`,
        threshold: thresholds.dailyCostThreshold,
        currentValue: currentDailyCost,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    // Check performance alerts
    if (performanceStats.uploadSuccessRate < thresholds.uploadSuccessRateThreshold) {
      alerts.push({
        id: `performance-upload-${Date.now()}`,
        type: 'performance',
        severity: performanceStats.uploadSuccessRate < 80 ? 'critical' : 'high',
        title: 'Low Upload Success Rate',
        message: `Upload success rate (${performanceStats.uploadSuccessRate}%) below threshold (${thresholds.uploadSuccessRateThreshold}%)`,
        threshold: thresholds.uploadSuccessRateThreshold,
        currentValue: performanceStats.uploadSuccessRate,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    if (performanceStats.averageUploadTime > thresholds.averageUploadTimeThreshold) {
      alerts.push({
        id: `performance-time-${Date.now()}`,
        type: 'performance',
        severity: performanceStats.averageUploadTime > thresholds.averageUploadTimeThreshold * 2 ? 'critical' : 'medium',
        title: 'High Upload Time',
        message: `Average upload time (${performanceStats.averageUploadTime}ms) exceeds threshold (${thresholds.averageUploadTimeThreshold}ms)`,
        threshold: thresholds.averageUploadTimeThreshold,
        currentValue: performanceStats.averageUploadTime,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    if (performanceStats.cacheHitRate < thresholds.cacheHitRateThreshold) {
      alerts.push({
        id: `performance-cache-${Date.now()}`,
        type: 'performance',
        severity: performanceStats.cacheHitRate < 50 ? 'high' : 'medium',
        title: 'Low Cache Hit Rate',
        message: `Cache hit rate (${performanceStats.cacheHitRate}%) below threshold (${thresholds.cacheHitRateThreshold}%)`,
        threshold: thresholds.cacheHitRateThreshold,
        currentValue: performanceStats.cacheHitRate,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    // Check storage alerts
    if (currentStorageGB > thresholds.storageUsageThreshold) {
      alerts.push({
        id: `storage-usage-${Date.now()}`,
        type: 'storage',
        severity: currentStorageGB > thresholds.storageUsageThreshold * 2 ? 'critical' : 'high',
        title: 'High Storage Usage',
        message: `Storage usage (${currentStorageGB.toFixed(2)}GB) exceeds threshold (${thresholds.storageUsageThreshold}GB)`,
        threshold: thresholds.storageUsageThreshold,
        currentValue: currentStorageGB,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    // Check error rate alerts
    const totalOperations = performanceStats.signedUrlGenerationCount + performanceStats.uploadFailures;
    const errorRate = totalOperations > 0 ? (performanceStats.uploadFailures / totalOperations) * 100 : 0;
    
    if (errorRate > thresholds.errorRateThreshold) {
      alerts.push({
        id: `error-rate-${Date.now()}`,
        type: 'error',
        severity: errorRate > thresholds.errorRateThreshold * 2 ? 'critical' : 'high',
        title: 'High Error Rate',
        message: `Error rate (${errorRate.toFixed(2)}%) exceeds threshold (${thresholds.errorRateThreshold}%)`,
        threshold: thresholds.errorRateThreshold,
        currentValue: errorRate,
        timestamp: new Date(),
        acknowledged: false
      });
    }

  } catch (error) {
    console.error('Error checking R2 alerts:', error);
    
    // Add system error alert
    alerts.push({
      id: `system-error-${Date.now()}`,
      type: 'error',
      severity: 'critical',
      title: 'R2 Alert System Error',
      message: 'Failed to check R2 metrics for alerts',
      threshold: 0,
      currentValue: 0,
      timestamp: new Date(),
      acknowledged: false
    });
  }

  return alerts;
}

// Save alerts to database
export async function saveR2Alerts(alerts: R2Alert[]): Promise<void> {
  try {
    for (const alert of alerts) {
      await prisma.r2Alert.upsert({
        where: { id: alert.id },
        update: {
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          threshold: alert.threshold,
          currentValue: alert.currentValue,
          timestamp: alert.timestamp,
          acknowledged: alert.acknowledged,
          acknowledgedBy: alert.acknowledgedBy,
          acknowledgedAt: alert.acknowledgedAt
        },
        create: {
          id: alert.id,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          threshold: alert.threshold,
          currentValue: alert.currentValue,
          timestamp: alert.timestamp,
          acknowledged: alert.acknowledged,
          acknowledgedBy: alert.acknowledgedBy,
          acknowledgedAt: alert.acknowledgedAt
        }
      });
    }
  } catch (error) {
    console.error('Error saving R2 alerts:', error);
  }
}

// Get active alerts
export async function getActiveR2Alerts(): Promise<R2Alert[]> {
  try {
    const alerts = await prisma.r2Alert.findMany({
      where: { acknowledged: false },
      orderBy: { timestamp: 'desc' }
    });

    return alerts.map(alert => ({
      id: alert.id,
      type: alert.type as 'cost' | 'performance' | 'storage' | 'error',
      severity: alert.severity as 'low' | 'medium' | 'high' | 'critical',
      title: alert.title,
      message: alert.message,
      threshold: alert.threshold,
      currentValue: alert.currentValue,
      timestamp: alert.timestamp,
      acknowledged: alert.acknowledged,
      acknowledgedBy: alert.acknowledgedBy || undefined,
      acknowledgedAt: alert.acknowledgedAt || undefined
    }));
  } catch (error) {
    console.error('Error getting active R2 alerts:', error);
    return [];
  }
}

// Acknowledge an alert
export async function acknowledgeR2Alert(alertId: string, acknowledgedBy: string): Promise<void> {
  try {
    await prisma.r2Alert.update({
      where: { id: alertId },
      data: {
        acknowledged: true,
        acknowledgedBy,
        acknowledgedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error acknowledging R2 alert:', error);
  }
}

// Get alert statistics
export async function getR2AlertStats(): Promise<{
  totalAlerts: number;
  activeAlerts: number;
  criticalAlerts: number;
  alertsByType: Record<string, number>;
  alertsBySeverity: Record<string, number>;
}> {
  try {
    const [totalAlerts, activeAlerts, criticalAlerts, alertsByType, alertsBySeverity] = await Promise.all([
      prisma.r2Alert.count(),
              prisma.r2Alert.count({ where: { acknowledged: false } }),
              prisma.r2Alert.count({ where: { severity: 'critical', acknowledged: false } }),
      prisma.r2Alert.groupBy({
        by: ['type'],
        _count: { type: true }
      }),
      prisma.r2Alert.groupBy({
        by: ['severity'],
        _count: { severity: true }
      })
    ]);

    return {
      totalAlerts,
      activeAlerts,
      criticalAlerts,
      alertsByType: Object.fromEntries(
        alertsByType.map(item => [item.type, item._count.type])
      ),
      alertsBySeverity: Object.fromEntries(
        alertsBySeverity.map(item => [item.severity, item._count.severity])
      )
    };
  } catch (error) {
    console.error('Error getting R2 alert stats:', error);
    return {
      totalAlerts: 0,
      activeAlerts: 0,
      criticalAlerts: 0,
      alertsByType: {},
      alertsBySeverity: {}
    };
  }
} 