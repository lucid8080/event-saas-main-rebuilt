"use client";

import * as React from "react";
// Temporarily disabled recharts import to avoid 'self is not defined' error during build
// import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface DailyStats {
  date: string;
  newUsers: number;
  imagesGenerated: number;
  activeUsers: number;
  revenue: number;
}

interface RealInteractiveBarChartProps {
  data: DailyStats[];
  loading?: boolean;
}

const chartConfig = {
  newUsers: {
    label: "New Users",
    color: "hsl(var(--chart-1))",
  },
  imagesGenerated: {
    label: "Images Generated",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

// Stub components for build compatibility
const BarChart = ({ children, ...props }: any) => <div {...props}>{children}</div>;
const CartesianGrid = ({ ...props }: any) => <div {...props} />;
const XAxis = ({ ...props }: any) => <div {...props} />;
const Bar = ({ ...props }: any) => <div {...props} />;

export function RealInteractiveBarChart({ data, loading = false }: RealInteractiveBarChartProps) {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("newUsers");

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
          {["newUsers", "imagesGenerated"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative flex flex-1 flex-col px-6 py-4 text-left border-t sm:border-l sm:border-t-0 sm:px-8 sm:py-6 z-30 justify-center gap-1 even:border-l data-[active=true]:bg-muted/50"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg sm:text-3xl font-bold leading-none">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="w-full h-[250px] aspect-auto"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return format(date, "MMM dd");
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="value"
                  labelFormatter={(value) => {
                    return format(new Date(value), "MMM dd, yyyy");
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 