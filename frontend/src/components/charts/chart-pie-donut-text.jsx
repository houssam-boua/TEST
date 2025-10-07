"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A donut chart with text";

const chartData = [
  { browser: "pending", visitors: 275, fill: "var(--color-pending)" },
  { browser: "rejected", visitors: 200, fill: "var(--color-rejected)" },
  { browser: "approved", visitors: 287, fill: "var(--color-approved)" },
 
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  pending: {
    label: "pending",
    color: "var(--chart-1)",
  },
  rejected: {
    label: "rejected",
    color: "var(--chart-2)",
  },
  approved: {
    label: "approved",
    color: "var(--chart-3)",
  },
  
};
const ChartPieDonutText = () => {
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);

  return (
    <Card className="flex flex-col border-0 ">
      <CardHeader className="items-center pb-0">
        <CardTitle>Document summary</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[250px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="visitors"
            nameKey="browser"
            innerRadius={60}
            strokeWidth={5}
          >
            <Label
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
                        className="fill-foreground text-3xl font-bold"
                      >
                        {totalVisitors.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        Document
                      </tspan>
                    </text>
                  );
                }
              }}
              />
               <ChartLegend
              content={<ChartLegendContent nameKey="browser" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </CardContent>
    </Card>
  );
};

export default ChartPieDonutText;
