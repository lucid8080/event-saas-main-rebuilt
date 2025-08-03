"use client";

import { PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart } from "recharts";

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

interface EventTypeData {
  eventType: string;
  count: number;
}

interface RealEventTypeChartProps {
  data: EventTypeData[];
  loading?: boolean;
}

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function RealEventTypeChart({ data, loading = false }: RealEventTypeChartProps) {
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

  return (
    <Card>
      <CardHeader className="pb-4 items-center">
        <CardTitle>Event Type Distribution</CardTitle>
        <CardDescription>
          Popular event types and usage patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="max-h-[350px] mx-auto 2xl:max-h-[250px] aspect-square"
        >
          <RadarChart data={data}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="eventType" />
            <PolarGrid />
            <Radar
              dataKey="count"
              fill="var(--color-count)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <div className="flex p-4 text-sm text-muted-foreground items-center justify-center">
        Total events: {totalEvents.toLocaleString()}
      </div>
    </Card>
  );
} 