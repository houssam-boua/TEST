"use client";

import React from "react";
import { Pie, PieChart } from "recharts";
import { useGetDashboardDocumentsByStatusQuery } from "@/Slices/dashboardSlices";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import CostumeCardTitle from "../collection/costume-card-title";

export const description = "A pie chart with a legend";

const chartData = [
  { label: "accepted", documents: 275, fill: "var(--color-accepted)" },
  { label: "rejected", documents: 200, fill: "var(--color-rejected)" },
  { label: "approved", documents: 187, fill: "var(--color-approved)" },
];

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
};

export function ChartPieLegend({ data: propData }) {
  const { data: hookData } = useGetDashboardDocumentsByStatusQuery();

  // source supports either:
  // - propData as an array
  // - propData as { data: [...] }
  // - hookData from RTK query (likely { data: [...] })
  const source = React.useMemo(() => {
    if (Array.isArray(propData)) return propData;
    if (propData && Array.isArray(propData.data)) return propData.data;
    if (hookData && Array.isArray(hookData)) return hookData;
    if (hookData && Array.isArray(hookData.data)) return hookData.data;
    return null;
  }, [propData, hookData]);

  // Map backend response to chart format { label, documents, fill }
  const mapped = React.useMemo(() => {
    if (!source || !Array.isArray(source)) return chartData;
    try {
      return source.map((item) => {
        // backend may return { doc_status, count } or { status, count } or { name, documents }
        const label =
          item.doc_status ??
          item.status ??
          item.name ??
          item.label ??
          String(item[0] ?? "unknown");
        const documents =
          item.count ?? item.documents ?? item.value ?? item.total ?? 0;
        const key = String(label).toLowerCase().replace(/\s+/g, "_");
        const cfg =
          chartConfig[key] ?? chartConfig[label?.toLowerCase?.()] ?? {};
        return {
          label,
          documents,
          fill: cfg.color ?? "var(--chart-1)",
        };
      });
    } catch {
      return chartData;
    }
  }, [source]);

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
            <Pie data={mapped} dataKey="documents" nameKey="label" />
            <ChartLegend
              content={<ChartLegendContent nameKey="label" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
