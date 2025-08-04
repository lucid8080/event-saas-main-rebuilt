"use client";

import { TrendingUp } from "lucide-react";
// Temporarily disabled recharts import to avoid 'self is not defined' error during build
// import { PolarGrid, PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

// Stub components for build compatibility
const RadialBarChart = ({ children, ...props }: any) => <div {...props}>{children}</div>;
const PolarGrid = ({ ...props }: any) => <div {...props} />;
const PolarAngleAxis = ({ ...props }: any) => <div {...props} />;
const RadialBar = ({ ...props }: any) => <div {...props} />;

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

const chartData = [
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function RadialTextChart() {
  return (
    <Card className="flex flex-col">
      {/* <CardHeader className="pb-0 items-center">
        <CardTitle>Radial Chart - Text</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader> */}
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="max-h-[250px] mx-auto aspect-square"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={250}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="visitors" background cornerRadius={10} />
            <PolarAngleAxis tick={false} tickLine={false} axisLine={false}>
              {/* <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="text-4xl fill-foreground font-bold"
                        >
                          {chartData[0].visitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Visitors
                        </tspan>
                      </text>
                    );
                  }
                }}
              /> */}
            </PolarAngleAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col text-pretty text-center text-sm gap-2">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="size-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Total visitors in the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
