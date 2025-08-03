'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  DollarSign,
  Activity,
  HardDrive,
  Zap,
  Clock
} from 'lucide-react';

interface R2Alert {
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

interface AlertStats {
  totalAlerts: number;
  activeAlerts: number;
  criticalAlerts: number;
  alertsByType: Record<string, number>;
  alertsBySeverity: Record<string, number>;
}

export default function R2AlertsDashboard() {
  const [alerts, setAlerts] = useState<R2Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/r2-alerts');
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/r2-alerts?action=stats');
      if (!response.ok) {
        throw new Error('Failed to fetch alert stats');
      }
      
      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching alert stats:', err);
    }
  };

  const checkForNewAlerts = async () => {
    try {
      setChecking(true);
      
      const response = await fetch('/api/admin/r2-alerts?action=check');
      if (!response.ok) {
        throw new Error('Failed to check for alerts');
      }
      
      const data = await response.json();
      
      // Refresh alerts and stats
      await Promise.all([fetchAlerts(), fetchStats()]);
      
      if (data.alerts && data.alerts.length > 0) {
        console.log(`Found ${data.alerts.length} new alerts`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setChecking(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/admin/r2-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alertId,
          action: 'acknowledge'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to acknowledge alert');
      }

      // Remove the acknowledged alert from the list
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      // Refresh stats
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    fetchAlerts();
    fetchStats();
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cost':
        return <DollarSign className="h-4 w-4" />;
      case 'performance':
        return <Activity className="h-4 w-4" />;
      case 'storage':
        return <HardDrive className="h-4 w-4" />;
      case 'error':
        return <Zap className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading alerts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">R2 Alerts Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage R2 cost, performance, and storage alerts
          </p>
        </div>
        <Button onClick={checkForNewAlerts} disabled={checking}>
          <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
          Check for Alerts
        </Button>
      </div>

      {/* Alert Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAlerts}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeAlerts}</div>
              <p className="text-xs text-muted-foreground">
                Unacknowledged
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Check</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date().toLocaleTimeString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Active Alerts ({alerts.length})
          </CardTitle>
          <CardDescription>
            Monitor and manage R2 system alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-center">
              <div>
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-700">All Clear!</h3>
                <p className="text-muted-foreground">
                  No active alerts at the moment. Your R2 system is running smoothly.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Alert key={alert.id} className={`border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <AlertTitle className="flex items-center gap-2">
                          {getTypeIcon(alert.type)}
                          {alert.title}
                          <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </AlertTitle>
                        <AlertDescription className="mt-2">
                          {alert.message}
                        </AlertDescription>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span>Threshold: {alert.threshold}</span>
                          <span className="mx-2">•</span>
                          <span>Current: {alert.currentValue.toFixed(2)}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="ml-4"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Acknowledge
                    </Button>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Type Distribution */}
      {stats && Object.keys(stats.alertsByType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alerts by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.alertsByType).map(([type, count]) => (
                <div key={type} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  {getTypeIcon(type)}
                  <div>
                    <div className="font-semibold capitalize">{type}</div>
                    <div className="text-sm text-muted-foreground">{count} alerts</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 