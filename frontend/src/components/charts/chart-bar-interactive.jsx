"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "An interactive bar chart";

const chartData = [
  { date: "2024-04-01", desktop: 222 },
  { date: "2024-04-02", desktop: 97 },
  { date: "2024-04-03", desktop: 167 },
  { date: "2024-04-04", desktop: 242 },
  { date: "2024-04-05", desktop: 373 },
  { date: "2024-04-06", desktop: 301 },
  { date: "2024-04-07", desktop: 245 },
  { date: "2024-04-08", desktop: 409 },
  { date: "2024-04-09", desktop: 59 },
  { date: "2024-04-10", desktop: 261 },
  { date: "2024-04-11", desktop: 327 },
  { date: "2024-04-12", desktop: 292 },
  { date: "2024-04-13", desktop: 342 },
  { date: "2024-04-14", desktop: 137 },
  { date: "2024-04-15", desktop: 120 },
  { date: "2024-04-16", desktop: 138 },
  { date: "2024-04-17", desktop: 446 },
  { date: "2024-04-18", desktop: 364 },
  { date: "2024-04-19", desktop: 243 },
  { date: "2024-04-20", desktop: 89 },
  { date: "2024-04-21", desktop: 137 },
  { date: "2024-04-22", desktop: 224 },
  { date: "2024-04-23", desktop: 138 },
  { date: "2024-04-24", desktop: 387 },
  { date: "2024-04-25", desktop: 215 },
  { date: "2024-04-26", desktop: 75 },
  { date: "2024-04-27", desktop: 383 },
  { date: "2024-04-28", desktop: 122 },
  { date: "2024-04-29", desktop: 315 },
  { date: "2024-04-30", desktop: 454 },
  { date: "2024-05-01", desktop: 165 },
  { date: "2024-05-02", desktop: 293 },
  { date: "2024-05-03", desktop: 247 },
  { date: "2024-05-04", desktop: 385 },
  { date: "2024-05-05", desktop: 481 },
  { date: "2024-05-06", desktop: 498 },
  { date: "2024-05-07", desktop: 388 },
  { date: "2024-05-08", desktop: 149 },
  { date: "2024-05-09", desktop: 227 },
  { date: "2024-05-10", desktop: 293 },
  { date: "2024-05-11", desktop: 335 },
  { date: "2024-05-12", desktop: 197 },
  { date: "2024-05-13", desktop: 197 },
  { date: "2024-05-14", desktop: 448 },
  { date: "2024-05-15", desktop: 473 },
  { date: "2024-05-16", desktop: 338 },
  { date: "2024-05-17", desktop: 499 },
  { date: "2024-05-18", desktop: 315 },
  { date: "2024-05-19", desktop: 235 },
  { date: "2024-05-20", desktop: 177 },
  { date: "2024-05-21", desktop: 82 },
  { date: "2024-05-22", desktop: 81 },
];

const chartConfig = {
  views: {
    label: "Page Views",
  },
  desktop: {
    label: "Desktop",
    color: "var(--chart-2)",
  },
};

export function ChartBarInteractive() {
  const [activeChart, setActiveChart] = React.useState("desktop");

  const total = React.useMemo(
    () => ({
      desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
    }),
    []
  );

  return (
    <Card className="py-0 border-border">
      <CardHeader className="flex flex-col items-stretch border-b border-muted/95 !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle className="p-4">Activities by days</CardTitle>
        </div>
        <div className="flex"></div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
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
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
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
