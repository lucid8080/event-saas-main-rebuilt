"use client";

import * as React from "react";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DailyStats {
  date: string;
  newUsers: number;
  imagesGenerated: number;
  activeUsers: number;
  revenue: number;
}

interface SimpleBarChartProps {
  data: DailyStats[];
  loading?: boolean;
}

export function SimpleBarChart({ data, loading = false }: SimpleBarChartProps) {
  const [activeChart, setActiveChart] = React.useState<"newUsers" | "imagesGenerated">("newUsers");

  const total = React.useMemo(
    () => ({
      newUsers: data.reduce((acc, curr) => acc + curr.newUsers, 0),
      imagesGenerated: data.reduce((acc, curr) => acc + curr.imagesGenerated, 0),
    }),
    [data],
  );

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-col p-0 space-y-0 border-b sm:flex-row items-stretch">
          <div className="flex flex-1 flex-col px-6 py-5 sm:py-6 justify-center gap-1">
            <div className="w-32 h-6 bg-muted rounded animate-pulse" />
            <div className="w-48 h-4 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex">
            {["newUsers", "imagesGenerated"].map((key) => (
              <div key={key} className="relative flex flex-1 flex-col px-6 py-4 text-left border-t sm:border-l sm:border-t-0 sm:px-8 sm:py-6 z-30 justify-center gap-1 even:border-l">
                <div className="w-16 h-3 bg-muted rounded animate-pulse" />
                <div className="w-20 h-8 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <div className="w-full h-[250px] bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-col p-0 space-y-0 border-b sm:flex-row items-stretch">
          <div className="flex flex-1 flex-col px-6 py-5 sm:py-6 justify-center gap-1">
            <CardTitle>User Activity Trends</CardTitle>
            <CardDescription>
              No data available yet. Activity will appear here as users interact with the system.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <div className="flex h-[250px] text-muted-foreground items-center justify-center">
            No data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate max value for scaling
  const maxValue = Math.max(
    ...data.map(day => activeChart === "newUsers" ? day.newUsers : day.imagesGenerated)
  );

  return (
    <Card>
      <CardHeader className="flex flex-col p-0 space-y-0 border-b sm:flex-row items-stretch">
        <div className="flex flex-1 flex-col px-6 py-5 sm:py-6 justify-center gap-1">
          <CardTitle>User Activity Trends</CardTitle>
          <CardDescription>
            Showing user activity for the last {data.length} days
          </CardDescription>
        </div>
        <div className="flex">
          {(["newUsers", "imagesGenerated"] as const).map((key) => {
            return (
              <button
                key={key}
                data-active={activeChart === key}
                className="relative flex flex-1 flex-col px-6 py-4 text-left border-t sm:border-l sm:border-t-0 sm:px-8 sm:py-6 z-30 justify-center gap-1 even:border-l data-[active=true]:bg-muted/50 hover:bg-muted/30 transition-colors"
                onClick={() => setActiveChart(key)}
              >
                <span className="text-xs text-muted-foreground">
                  {key === "newUsers" ? "New Users" : "Images Generated"}
                </span>
                <span className="text-lg sm:text-3xl font-bold leading-none">
                  {total[key].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <div className="w-full h-[250px] flex items-end justify-between gap-1 p-4">
          {data.slice(-14).map((day, index) => {
            const value = activeChart === "newUsers" ? day.newUsers : day.imagesGenerated;
            const height = maxValue > 0 ? (value / maxValue) * 200 : 0;
            
            return (
              <div
                key={day.date}
                className="flex flex-col items-center gap-1 flex-1 group"
                title={`${format(new Date(day.date), "MMM dd, yyyy")}: ${value} ${activeChart === "newUsers" ? "new users" : "images generated"}`}
              >
                <div
                  className={`w-full rounded-t transition-all duration-300 group-hover:opacity-80 ${
                    activeChart === "newUsers" 
                      ? "bg-blue-500 hover:bg-blue-600" 
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                  style={{ height: `${height}px`, minHeight: value > 0 ? "4px" : "0px" }}
                />
                <span className="text-xs text-muted-foreground rotate-45 origin-left whitespace-nowrap">
                  {format(new Date(day.date), "MMM dd")}
                </span>
                {value > 0 && (
                  <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {value}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex justify-center mt-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-sm text-muted-foreground">New Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-sm text-muted-foreground">Images Generated</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}