"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Building, FileText, Route, User, TrendingUp, Clock } from "lucide-react";

import {
  useGetDashboardUsersCountQuery,
  useGetDashboardDocumentsCountQuery,
  useGetDashboardDepartementsCountQuery,
  useGetDashboardWorkflowsCountQuery,
} from "@/slices/dashboardslices";

/**
 * Unwrap common API shapes:
 * - backend returns { data: <payload>, message: "..." }
 * - sometimes you may already get <payload> directly
 */
const unwrapPayload = (resp) => (resp && typeof resp === "object" && "data" in resp ? resp.data : resp);

const safeExtractCount = (resp) => {
  const data = unwrapPayload(resp);

  if (data == null) return null;
  if (typeof data === "number") return data;

  // Supports payload shape: { count: 150, trend: {...} }
  if (typeof data.count === "number") return data.count;

  // Supports alternative shapes if you ever use them
  if (typeof data.count_total === "number") return data.count_total;
  if (Array.isArray(data)) return data.length;
  if (Array.isArray(data.results)) return data.results.length;
  if (Array.isArray(data.data)) return data.data.length;

  return null;
};

/**
 * Trend extraction supports:
 * 1) payload: { count: 150, trend: { percentage: 12.5, direction: "up" } }
 * 2) payload: { count: 150, previous_count: 134 } => auto compute %.
 *
 * Also supports wrapped response: { data: <payload>, message: ... }
 */
const safeExtractTrend = (resp) => {
  const data = unwrapPayload(resp);
  if (!data || typeof data !== "object") return null;

  // Format 1: explicit trend object (recommended)
  const trend = data.trend;
  if (trend && typeof trend === "object") {
    const percentage = Number(trend.percentage);
    const direction = trend.direction;

    if (Number.isFinite(percentage) && (direction === "up" || direction === "down")) {
      const sign = direction === "up" ? "+" : "-";
      return {
        dir: direction,
        label: `${sign}${percentage}%`,
      };
    }
  }

  // Format 2: compute from previous_count
  const count = Number(data.count);
  const previous = Number(data.previous_count);

  if (Number.isFinite(count) && Number.isFinite(previous) && previous > 0) {
    const change = ((count - previous) / previous) * 100;
    const dir = change >= 0 ? "up" : "down";
    const sign = dir === "up" ? "+" : "-";

    return {
      dir,
      label: `${sign}${Math.abs(change).toFixed(1)}%`,
    };
  }

  return null;
};

function StatCard({
  title,
  subtitle,
  value,
  loading,
  icon: Icon,
  iconTheme = "blue",
  trend = null,
}) {
  const themes = {
    blue: {
      ring: "from-blue-500 to-cyan-500",
      soft: "from-blue-50/70 to-cyan-50/40",
      text: "text-blue-700",
      border: "border-blue-200/50",
      bg: "bg-blue-50/30",
    },
    purple: {
      ring: "from-purple-500 to-pink-500",
      soft: "from-purple-50/70 to-pink-50/40",
      text: "text-purple-700",
      border: "border-purple-200/50",
      bg: "bg-purple-50/30",
    },
    green: {
      ring: "from-emerald-500 to-lime-500",
      soft: "from-emerald-50/70 to-lime-50/40",
      text: "text-emerald-700",
      border: "border-emerald-200/50",
      bg: "bg-emerald-50/30",
    },
    orange: {
      ring: "from-orange-500 to-amber-500",
      soft: "from-orange-50/70 to-amber-50/40",
      text: "text-orange-700",
      border: "border-orange-200/50",
      bg: "bg-orange-50/30",
    },
  };

  const t = themes[iconTheme] ?? themes.blue;

  return (
    <Card className="@container/card group relative overflow-hidden border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div
        className={`pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br ${t.soft} blur-3xl opacity-60 transition-opacity duration-300 group-hover:opacity-100`}
      />

      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${t.ring}`} />

      <CardHeader className="pb-4 pt-5">
        <div className="flex items-start gap-3">
          <div
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${t.ring} shadow-lg transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className="h-5 w-5 text-white" strokeWidth={1.8} />
          </div>

          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-semibold leading-5 text-foreground">
              {title}
            </CardTitle>
            <CardDescription className="mt-1 text-xs text-muted-foreground">
              {subtitle}
            </CardDescription>
          </div>

          <div className="flex h-6 items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/50 px-2.5 py-0.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-[10px] font-medium text-emerald-700">Active</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-5 pt-0">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-4xl font-bold tabular-nums tracking-tight text-foreground">
              {loading ? <span className="inline-block animate-pulse">…</span> : value ?? "-"}
            </div>
          </div>

          {!loading && value != null && (
            <div
              className={`hidden @lg/card:flex items-center gap-1.5 rounded-lg border ${t.border} ${t.bg} px-2.5 py-1.5`}
            >
              <TrendingUp className={`h-3.5 w-3.5 ${t.text}`} />
              <span className={`text-xs font-medium ${t.text}`}>Total</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t border-gray-100 bg-gray-50/50 py-3">
        {trend?.dir ? (
          <div className="flex items-center justify-between w-full">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                trend.dir === "up"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {trend.dir === "up" ? <IconTrendingUp size={14} /> : <IconTrendingDown size={14} />}
              {trend.label}
            </span>
            <span className="text-xs text-muted-foreground">vs last period</span>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span>Updated just now</span>
            </div>
            <span className="hidden @md/card:inline font-medium text-primary">Real-time</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default function SectionCards() {
  const { data: docsCountData, isLoading: loadingDocs } = useGetDashboardDocumentsCountQuery();
  const { data: usersCountData, isLoading: loadingUsers } = useGetDashboardUsersCountQuery();
  const { data: departementsCountData, isLoading: loadingDepartements } =
    useGetDashboardDepartementsCountQuery();
  const { data: workflowsCountData, isLoading: loadingWorkflows } =
    useGetDashboardWorkflowsCountQuery();

  const usersCount = safeExtractCount(usersCountData);
  const docsCount = safeExtractCount(docsCountData);
  const departementsCount = safeExtractCount(departementsCountData);
  const workflowsCount = safeExtractCount(workflowsCountData);

  const usersTrend = safeExtractTrend(usersCountData);
  const docsTrend = safeExtractTrend(docsCountData);
  const deptsTrend = safeExtractTrend(departementsCountData);
  const workflowsTrend = safeExtractTrend(workflowsCountData);

  return (
    <div className="grid grid-cols-1 gap-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <StatCard
        title="Users"
        subtitle="Total active accounts"
        value={usersCount}
        loading={loadingUsers}
        icon={User}
        iconTheme="purple"
        trend={usersTrend}
      />

      <StatCard
        title="Departments"
        subtitle="Organizational units"
        value={departementsCount}
        loading={loadingDepartements}
        icon={Building}
        iconTheme="orange"
        trend={deptsTrend}
      />

      <StatCard
        title="Workflows"
        subtitle="Active processes"
        value={workflowsCount}
        loading={loadingWorkflows}
        icon={Route}
        iconTheme="green"
        trend={workflowsTrend}
      />

      <StatCard
        title="Documents"
        subtitle="Total files stored"
        value={docsCount}
        loading={loadingDocs}
        icon={FileText}
        iconTheme="blue"
        trend={docsTrend}
      />
    </div>
  );
}
