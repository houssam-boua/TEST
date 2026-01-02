"use client";

import React from "react";
import { motion } from "framer-motion";
import { Pie, PieChart, Cell, Sector, Label } from "recharts";
import { useGetDashboardDocumentsByStatusQuery } from "@/slices/dashboardslices";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import CostumeCardTitle from "../collection/costume-card-title";
import { Download, FileText, PieChart as PieChartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const description = "Advanced interactive donut chart with animations";

const chartConfig = {
  accepted: { 
    label: "Accepted", 
    color: "hsl(142, 76%, 36%)",
    gradient: ["hsl(142, 76%, 36%)", "hsl(142, 76%, 46%)"]
  },
  pending: { 
    label: "Pending", 
    color: "hsl(48, 96%, 53%)",
    gradient: ["hsl(48, 96%, 53%)", "hsl(48, 96%, 63%)"]
  },
  rejected: { 
    label: "Rejected", 
    color: "hsl(0, 84%, 60%)",
    gradient: ["hsl(0, 84%, 60%)", "hsl(0, 84%, 70%)"]
  },
  approved: { 
    label: "Approved", 
    color: "hsl(221, 83%, 53%)",
    gradient: ["hsl(221, 83%, 53%)", "hsl(221, 83%, 63%)"]
  },
  archived: { 
    label: "Archived", 
    color: "hsl(215, 20%, 65%)",
    gradient: ["hsl(215, 20%, 65%)", "hsl(215, 20%, 75%)"]
  },
  original: { 
    label: "Original", 
    color: "hsl(262, 83%, 58%)",
    gradient: ["hsl(262, 83%, 58%)", "hsl(262, 83%, 68%)"]
  },
  copie: { 
    label: "Copie", 
    color: "hsl(173, 58%, 39%)",
    gradient: ["hsl(173, 58%, 39%)", "hsl(173, 58%, 49%)"]
  },
  perime: { 
    label: "Périmé", 
    color: "hsl(24, 70%, 50%)",
    gradient: ["hsl(24, 70%, 50%)", "hsl(24, 70%, 60%)"]
  },
  draft: { 
    label: "Draft", 
    color: "hsl(210, 40%, 96%)",
    gradient: ["hsl(210, 40%, 80%)", "hsl(210, 40%, 90%)"]
  },
};

// Active sector shape with smooth animation
const renderActiveShape = (props) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 12}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.3}
      />
    </g>
  );
};

// Custom center label component
const CenterLabel = ({ viewBox, total, activeItem }) => {
  const { cx, cy } = viewBox || { cx: 0, cy: 0 };

  return (
    <g>
      <text
        x={cx}
        y={cy - 10}
        className="fill-foreground text-3xl font-bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {activeItem ? activeItem.documents : total}
      </text>
      <text
        x={cx}
        y={cy + 20}
        className="fill-muted-foreground text-sm"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {activeItem ? activeItem.name : "Total Documents"}
      </text>
      {activeItem && activeItem.percentage && (
        <text
          x={cx}
          y={cy + 38}
          className="fill-muted-foreground text-xs font-medium"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {activeItem.percentage.toFixed(1)}%
        </text>
      )}
    </g>
  );
};

// Section Header Component (matching dashboard cards)
const ChartHeader = ({ total, showExport, onExport }) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
          <PieChartIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Summary Documents</h3>
          <p className="text-xs text-muted-foreground">Document status distribution</p>
        </div>
      </div>
      <div className="flex items-center gap-2">

        {showExport && total > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-8 gap-1 text-xs"
          >
            <Download className="h-3 w-3" />
            Export
          </Button>
        )}
      </div>
    </div>
  );
};

export function ChartPieLegend({ 
  data: propData, 
  showExport = true,
  showPercentages = true,
  animationDuration = 800
}) {
  const { data: hookData, isLoading, isError } = useGetDashboardDocumentsByStatusQuery();
  const [activeIndex, setActiveIndex] = React.useState(undefined);

  const source = React.useMemo(() => {
    if (Array.isArray(propData)) return propData;
    if (propData && Array.isArray(propData.data)) return propData.data;
    if (hookData && Array.isArray(hookData.data)) return hookData.data;
    if (hookData && Array.isArray(hookData)) return hookData;
    return [];
  }, [propData, hookData]);

  const mapped = React.useMemo(() => {
    const normalize = (s) =>
      String(s || "")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim()
        .toLowerCase()
        .replace(/[^\w]+/g, "_")
        .replace(/^_+|_+$/g, "");

    const synonyms = {
      rejete: "rejected",
      rejetee: "rejected",
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
      en_attente: "pending",
      pending: "pending",
      original: "original",
      copie: "copie",
      perime: "perime",
      draft: "draft",
      archived: "archived",
    };

    const counts = {};
    for (const item of source) {
      const rawLabel =
        item?.doc_status_type ??
        item?.doc_status ??
        item?.status ??
        item?.name ??
        item?.label ??
        "unknown";

      const documents = Number(item?.count ?? item?.documents ?? item?.value ?? 0) || 0;
      const key0 = normalize(rawLabel);
      const key = synonyms[key0] ?? key0;
      counts[key] = (counts[key] || 0) + documents;
    }

    const mappedArr = [];
    const orderedKeys = Object.keys(chartConfig);

    for (const k of orderedKeys) {
      const v = counts[k] || 0;
      if (v > 0) {
        mappedArr.push({
          key: k,
          label: k,
          name: chartConfig[k]?.label ?? k,
          documents: v,
          fill: chartConfig[k]?.color ?? "hsl(var(--chart-1))",
        });
      }
      delete counts[k];
    }

    for (const [k, v] of Object.entries(counts)) {
      if (v <= 0) continue;
      mappedArr.push({
        key: k,
        label: k,
        name: k,
        documents: v,
        fill: "hsl(var(--chart-1))",
      });
    }

    return mappedArr;
  }, [source]);

  const total = React.useMemo(
    () => mapped.reduce((acc, x) => acc + (x.documents || 0), 0),
    [mapped]
  );

  const dataWithPercentages = React.useMemo(() => {
    return mapped.map(item => ({
      ...item,
      percentage: total > 0 ? (item.documents / total) * 100 : 0
    }));
  }, [mapped, total]);

  const activeItem = React.useMemo(() => {
    return activeIndex !== undefined ? dataWithPercentages[activeIndex] : null;
  }, [activeIndex, dataWithPercentages]);

  const handleExport = React.useCallback(() => {
    const csvContent = [
      ["Status", "Documents", "Percentage"],
      ...dataWithPercentages.map(item => [
        item.name,
        item.documents,
        `${item.percentage?.toFixed(2)}%`
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `documents-summary-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [dataWithPercentages]);

  const onPieEnter = React.useCallback((_, index) => {
    setActiveIndex(index);
  }, []);

  const onPieLeave = React.useCallback(() => {
    setActiveIndex(undefined);
  }, []);

  return (
    <Card className="flex flex-col border-border shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-4 pt-6 px-6">
        <ChartHeader 
          total={total} 
          showExport={showExport} 
          onExport={handleExport} 
        />
      </CardHeader>

      <CardContent className="flex-1 pb-6 px-6 pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading chart...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="flex flex-col items-center gap-2 text-center">
              <FileText className="h-12 w-12 text-destructive/50" />
              <p className="text-sm font-medium text-destructive">Unable to load summary</p>
              <p className="text-xs text-muted-foreground">Please try again later</p>
            </div>
          </div>
        ) : total === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="flex flex-col items-center gap-2 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">No documents found</p>
              <p className="text-xs text-muted-foreground">Start by adding documents to see statistics</p>
            </div>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[320px]"
          >
            <PieChart>
              <defs>
                {Object.entries(chartConfig).map(([key, config]) => (
                  <linearGradient 
                    key={key} 
                    id={`gradient-${key}`} 
                    x1="0" 
                    y1="0" 
                    x2="0" 
                    y2="1"
                  >
                    <stop offset="0%" stopColor={config.gradient?.[0] || config.color} />
                    <stop offset="100%" stopColor={config.gradient?.[1] || config.color} />
                  </linearGradient>
                ))}
              </defs>

              <Pie
                data={dataWithPercentages}
                dataKey="documents"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={105}
                paddingAngle={2}
                animationBegin={0}
                animationDuration={animationDuration}
                animationEasing="ease-out"
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                style={{ 
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                {dataWithPercentages.map((entry, index) => (
                  <Cell 
                    key={`cell-${entry.key}`} 
                    fill={`url(#gradient-${entry.key})`}
                    className="transition-all duration-300 hover:opacity-90"
                    strokeWidth={activeIndex === index ? 2 : 0}
                  />
                ))}
                <Label
                  content={
                    <CenterLabel 
                      total={total} 
                      activeItem={activeItem}
                    />
                  }
                  position="center"
                />
              </Pie>

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent 
                    labelKey="name" 
                    indicator="dot"
                    formatter={(value, name, item) => (
                      <div className="flex items-center justify-between gap-3 min-w-[140px]">
                        <span className="font-medium">{value} docs</span>
                        {showPercentages && item.payload.percentage && (
                          <span className="text-muted-foreground text-xs">
                            ({item.payload.percentage.toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    )}
                  />
                }
              />

              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                wrapperStyle={{
                  paddingTop: "20px"
                }}
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
