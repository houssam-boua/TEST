import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import CostumeCardTitle from "../collection/costume-card-title";
import { CircleAlert, FileText } from "lucide-react";
import useIcon from "../../Hooks/useIcon";
import ChartBarMultiple from "../charts/chart-bar-multiple";
import useIconColor from "../../Hooks/useIconColor";
import useRelativeTime from "../../Hooks/useRelativeTime";
import {
  useGetDashboardDocumentsByDepartementQuery,
  useGetDashboardDocumentsRecentQuery,
} from "../../Slices/dashboardSlices";

// Render a status-based icon using hooks inside a proper component
const StatusIcon = React.memo(function StatusIcon({
  status,
  className,
  IconComponent,
}) {
  const normalized = String(status || "").toLowerCase();
  const color = useIconColor(normalized);
  const iconEl = useIcon(normalized, color, IconComponent, className);
  return iconEl || null;
});

const recentActivities = [
  {
    title: "User A uploaded Document 1",
    time: "2 hours ago",
    status: "approved",
    icon: CircleAlert,
  },
  {
    title: "User B commented on Document 2",
    time: "5 hours ago",
    status: "pending",
    icon: CircleAlert,
  },
];
const sampleRecentDocuments = [
  {
    title: "Sample Document",
    size: "1MB",
    day: "-",
    status: "pending",
    icon: FileText,
  },
];

const DashboardSectionCards = ({ departmentCounts }) => {
  const {
    data: recentDocumentsResponse,
    isLoading,
    isError,
  } = useGetDashboardDocumentsRecentQuery();

  // fetch dashboard-by-department if parent didn't provide props
  const {
    data: byDeptResponse,
    isLoading: byDeptLoading,
    isError: byDeptError,
  } = useGetDashboardDocumentsByDepartementQuery();

  // small component that uses the `useRelativeTime` hook per-item
  function RelativeTimeDisplay({ date }) {
    const rel = useRelativeTime(date);
    return <span className="text-xs text-muted-foreground">{rel}</span>;
  }

  // normalize API response ({ data: [...] }) into UI-friendly items
  const recentDocs = React.useMemo(() => {
    // support either { data: [...] } response or a bare array
    const items = Array.isArray(recentDocumentsResponse)
      ? recentDocumentsResponse
      : recentDocumentsResponse?.data ?? sampleRecentDocuments;
    return (items || []).map((it) => ({
      title: it.title || it.name || "Untitled",
      size: it.size || it.filesize || "-",
      rawDate: it.created_at || it.createdAt || it.created,
      status: String(it.status || "pending").toLowerCase(),
      icon: it.icon || FileText,
      raw: it,
    }));
  }, [recentDocumentsResponse]);

  // normalize department counts for the chart
  const deptItems = React.useMemo(() => {
    const source = departmentCounts || byDeptResponse?.data || [];
    return (source || []).map((d) => ({ month: d.dep_name, count: d.count }));
  }, [departmentCounts, byDeptResponse]);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4  *:data-[slot=card]:shadow-xs *:data-[slot=card]:bg-card *:data-[slot=card]:border-border lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      <Card className="@container/card ">
        <CardHeader>
          <CostumeCardTitle title="Recent documents" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : isError ? (
            <div className="text-sm text-destructive">
              Unable to load recent documents
            </div>
          ) : (
            <ul>
              {recentDocs.map((doc, index) => (
                <li
                  key={index}
                  className="mb-2 flex items-center justify-start gap-2"
                >
                  <StatusIcon
                    status={doc.status}
                    className="h-6 w-6"
                    IconComponent={doc.icon}
                  />
                  <div className="flex-1 flex flex-col ">
                    <span className="text-xs">{doc.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {doc.size}
                    </span>
                  </div>
                  <RelativeTimeDisplay date={doc.rawDate} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="@container/card ">
        <CardHeader>
          <CostumeCardTitle title="Recent Activities" />
        </CardHeader>

        <CardContent>
          <ul>
            {recentActivities.map((doc, index) => (
              <li
                key={index}
                className="mb-2 flex items-center justify-start gap-2"
              >
                <StatusIcon
                  status={doc.status}
                  className="h-6 w-6"
                  IconComponent={doc.icon}
                />
                <div className="flex-1 flex flex-col ">
                  <span className="text-xs">{doc.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {doc.status}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {doc.time}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="@container/card ">
        <CardHeader>
          <CostumeCardTitle title="Analysis" />
        </CardHeader>

        <CardContent>
          <ChartBarMultiple
            data={deptItems}
          />
          {byDeptLoading && (
            <div className="text-xs text-muted-foreground mt-2">
              Loading department stats...
            </div>
          )}
          {byDeptError && (
            <div className="text-xs text-destructive mt-2">
              Unable to load department stats
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSectionCards;
