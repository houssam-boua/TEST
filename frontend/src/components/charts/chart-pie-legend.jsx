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

const chartConfig = {
  accepted: {
    label: "Accepted",
    color: "var(--chart-4)",
  },
  pending: {
    label: "Pending",
    color: "var(--chart-1)",
  },
  rejected: {
    label: "Rejected",
    color: "var(--chart-3)",
  },
  approved: {
    label: "Approved",
    color: "var(--chart-2)",
  },
  archived: {
    label: "Archived",
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
    if (hookData && Array.isArray(hookData.data)) return hookData.data;
    if (hookData && Array.isArray(hookData)) return hookData;
    return null;
  }, [propData, hookData]);

  // Map backend response to chart format { label, name, documents, fill }
  // and aggregate entries that normalize to the same key so the legend/chart
  // shows a single slice per status (summing counts when duplicates exist).
  const mapped = React.useMemo(() => {
    if (!source) return [];

    // normalize string (remove diacritics, trim, lowercase, replace non-word with underscore)
    const normalize = (s) =>
      String(s || "")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim()
        .toLowerCase()
        .replace(/[^\w]+/g, "_")
        .replace(/^_+|_+$/g, "");

    // synonyms map for common variants
    const synonyms = {
      rejete: "rejected",
      rejetee: "rejected",
      rejetees: "rejected",
      refuse: "rejected",
      refused: "rejected",
      reject: "rejected",
      rejected: "rejected",
      approuve: "approved",
      approuvee: "approved",
      approved: "approved",
      accepte: "accepted",
      acceptee: "accepted",
      accepted: "accepted",
      pending: "pending",
      en_attente: "pending",
    };

    const counts = {};
    for (const item of source) {
      const rawLabel =
        item.doc_status ??
        item.status ??
        item.name ??
        item.label ??
        String(item[0] ?? "unknown");
      const documents =
        Number(item.count ?? item.documents ?? item.value ?? item.total ?? 0) ||
        0;
      const key0 = normalize(rawLabel);
      const key = synonyms[key0] ?? key0;
      counts[key] = (counts[key] || 0) + documents;
    }

    // Build mapped array: include only statuses with positive counts
    const mappedArr = [];
    const orderedKeys = Object.keys(chartConfig).filter(
      (k) => k !== "documents"
    );
    for (const k of orderedKeys) {
      const cfg = chartConfig[k] || {};
      const name = cfg.label ?? k;
      const fill = cfg.color ?? "var(--chart-1)";
      const documents = counts[k] || 0;
      if (documents > 0) mappedArr.push({ label: k, name, documents, fill });
      delete counts[k];
    }

    // Append any remaining keys (unknown statuses)
    for (const [k, v] of Object.entries(counts)) {
      if (v <= 0) continue;
      mappedArr.push({
        label: k,
        name: k,
        documents: v,
        fill: "var(--chart-1)",
      });
    }

    return mappedArr;
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
            <Pie data={mapped} dataKey="documents" nameKey="name" />
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
