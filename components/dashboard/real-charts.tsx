"use client";

import { useState, useEffect } from "react";
import { SimpleBarChart } from "@/components/charts/simple-bar-chart";
import { SimpleEventTypeChart } from "@/components/charts/simple-event-type-chart";

interface ChartStats {
  userActivity: Array<{
    date: string;
    newUsers: number;
    imagesGenerated: number;
    activeUsers: number;
    revenue: number;
  }>;
  deviceDistribution: Array<{ device: string; users: number }>;
  eventTypeDistribution: Array<{ eventType: string; count: number }>;
  stylePreferences: Array<{ style: string; count: number }>;
  performanceMetrics: Array<{ metric: string; value: number }>;
}

export default function RealCharts() {
  const [stats, setStats] = useState<ChartStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChartData = async () => {
    try {
      console.log("🔍 RealCharts: Fetching chart data from /api/admin/charts");
      const response = await fetch("/api/admin/charts");
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("🔍 RealCharts: API response not ok:", response.status, errorText);
        throw new Error(`Failed to fetch chart data: ${response.status} ${errorText}`);
      }
      
      const data: ChartStats = await response.json();
      console.log("🔍 RealCharts: Chart data received:", {
        userActivity: data.userActivity?.length || 0,
        deviceDistribution: data.deviceDistribution?.length || 0,
        eventTypeDistribution: data.eventTypeDistribution?.length || 0,
        hasUserActivityData: data.userActivity?.some(day => day.newUsers > 0 || day.imagesGenerated > 0)
      });
      
      setStats(data);
    } catch (error) {
      console.error("🔍 RealCharts: Error fetching chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  return (
    <div className="space-y-6">
      {/* User Activity Trends */}
      <div className="space-y-4">
        <SimpleBarChart 
          data={stats?.userActivity || []} 
          loading={loading} 
        />
      </div>

      {/* Event Type Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <SimpleEventTypeChart 
            data={stats?.eventTypeDistribution || []} 
            loading={loading} 
          />
        </div>
      </div>

      {/* Placeholder for other charts */}
      {!loading && (!stats || (stats.userActivity.length === 0 && stats.eventTypeDistribution.length === 0)) && (
        <div className="py-8 text-center">
          <p className="mb-4 text-muted-foreground">
            No chart data available yet. Data will appear here as users interact with the system.
          </p>
          <p className="text-sm text-muted-foreground">
            The system is now tracking real statistics. Charts will populate as activity occurs.
          </p>
        </div>
      )}
    </div>
  );
} 