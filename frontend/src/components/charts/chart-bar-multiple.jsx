import React from "react";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
export const description = "A multiple bar chart";
const chartData = [
  { month: "Hr", approved: 186, pending: 80 },
  { month: "Acc", approved: 305, pending: 200 },
  { month: "Finan", approved: 237, pending: 120 },
  { month: "Media", approved: 73, pending: 190 },
];
const chartConfig = {
  approved: {
    label: "approved",
    color: "var(--chart-1)",
  },
  pending: {
    label: "pending",
    color: "var(--chart-2)",
  },
};
const ChartBarMultiple = () => {
  return (
    <ChartContainer config={chartConfig}>
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dashed" />}
        />
        <Bar dataKey="approved" fill="var(--color-approved)" radius={4} />
        <Bar dataKey="pending" fill="var(--color-pending)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
};

export default ChartBarMultiple;
