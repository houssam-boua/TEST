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
  count: {
    label: "Documents",
    color: "var(--chart-4)",
  },
};
const ChartBarMultiple = ({ data: propData, config: propConfig }) => {
  // allow parent to pass data and config; fall back to local defaults
  const data =
    Array.isArray(propData) && propData.length ? propData : chartData;
  const cfg = propConfig || chartConfig;

  // determine which keys to render as bars. If data items include `count` use single bar.
  const keys = React.useMemo(() => {
    if (data.length && Object.prototype.hasOwnProperty.call(data[0], "count")) {
      return [
        {
          key: "count",
          color: cfg.count?.color || "var(--chart-4)",
          label: cfg.count?.label || "count",
        },
      ];
    }
    // default: if data includes `approved` show approved counts, otherwise no bars

    return [];
  }, [data, cfg]);

  return (
    <ChartContainer config={cfg}>
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) =>
            typeof value === "string" ? value.slice(0, 3) : value
          }
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dashed" />}
        />
        {keys.map((k) => (
          <Bar key={k.key} dataKey={k.key} fill={k.color} radius={4} />
        ))}
      </BarChart>
    </ChartContainer>
  );
};

export default ChartBarMultiple;
