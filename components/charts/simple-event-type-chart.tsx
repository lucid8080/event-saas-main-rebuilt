"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EventTypeData {
  eventType: string;
  count: number;
}

interface SimpleEventTypeChartProps {
  data: EventTypeData[];
  loading?: boolean;
}

export function SimpleEventTypeChart({ data, loading = false }: SimpleEventTypeChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-4 items-center">
          <div className="w-32 h-6 bg-muted rounded animate-pulse" />
          <div className="w-48 h-4 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="pb-0">
          <div className="w-full h-[250px] bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4 items-center">
          <CardTitle>Event Type Distribution</CardTitle>
          <CardDescription>
            No event data available yet. Event types will appear here as users generate images.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <div className="flex h-[250px] text-muted-foreground items-center justify-center">
            No data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalEvents = data.reduce((acc, curr) => acc + curr.count, 0);
  const maxCount = Math.max(...data.map(item => item.count));

  // Color palette for different event types
  const colors = [
    "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", 
    "bg-pink-500", "bg-indigo-500", "bg-red-500", "bg-yellow-500",
    "bg-teal-500", "bg-cyan-500", "bg-emerald-500", "bg-violet-500",
    "bg-amber-500", "bg-rose-500"
  ];

  return (
    <Card>
      <CardHeader className="pb-4 items-center">
        <CardTitle>Event Type Distribution</CardTitle>
        <CardDescription>
          Popular event types and usage patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = totalEvents > 0 ? (item.count / totalEvents) * 100 : 0;
            const widthPercentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            const colorClass = colors[index % colors.length];
            
            return (
              <div
                key={item.eventType}
                className="group hover:bg-muted/50 rounded-lg p-2 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {item.eventType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {percentage.toFixed(1)}%
                    </span>
                    <span className="text-sm font-medium">
                      {item.count}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${colorClass} transition-all duration-500 ease-out group-hover:brightness-110`}
                    style={{ width: `${widthPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total Events:</span>
            <span className="font-medium">{totalEvents.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-muted-foreground">Event Types:</span>
            <span className="font-medium">{data.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}