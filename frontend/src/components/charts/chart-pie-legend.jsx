"use client"

import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import CostumeCardTitle from "../collection/costume-card-title"

export const description = "A pie chart with a legend"

const chartData = [
  { browser: "accepted", documents: 275, fill: "var(--color-accepted)" },
  { browser: "rejected", documents: 200, fill: "var(--color-rejected)" },
  { browser: "approved", documents: 187, fill: "var(--color-approved)" },

]

const chartConfig = {
  documents: {
    label: "documents",
  },
  accepted: {
    label: "accepted",
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
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
}

export function ChartPieLegend() {
  return (
    <Card className="flex flex-col border-border">
      <CardHeader>
        <CostumeCardTitle title="Summary Documents" />
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pt-0"
        >
          <PieChart>
            <Pie data={chartData} dataKey="documents" />
            <ChartLegend
              content={<ChartLegendContent nameKey="browser" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
