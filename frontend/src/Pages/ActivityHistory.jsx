import React from "react";
import { ChartBarInteractive } from "../components/charts/chart-bar-interactive";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import { useGetLogsQuery } from "@/Slices/logsSlice";
import useLogsTableData from "@/Hooks/useLogsTableData";
import useRelativeTime from "@/Hooks/useRelativeTime";
import useRoleBadge from "@/Hooks/useRoleBage";
import useActionBadge from "@/Hooks/useActionBadge";

const ActivityHistory = () => {
  const { data: logs, isLoading, isError } = useGetLogsQuery();

  const { rows, columns } = useLogsTableData(logs);

  function RelativeTime({ date }) {
    const s = useRelativeTime(date);
    return <span className="text-sm text-muted-foreground/80">{s}</span>;
  }

  // Small wrappers to call hook-helpers which return JSX
  function RoleBadgeCell({ role }) {
    const badge = useRoleBadge({ role });
    return <>{badge}</>;
  }

  function ActionBadgeCell({ action }) {
    const badge = useActionBadge({ action });
    return <>{badge}</>;
  }

  const columnsWithRenderer = columns.map((c) => {
    if (c.accessorKey === "created_at" || c.id === "date") {
      return {
        ...c,
        cell: ({ row }) => <RelativeTime date={row.original.created_at} />,
      };
    }
    if (c.accessorKey === "role") {
      return {
        ...c,
        cell: ({ row }) => <RoleBadgeCell role={row.original.role} />,
      };
    }
    if (c.accessorKey === "action") {
      return {
        ...c,
        cell: ({ row }) => <ActionBadgeCell action={row.original.action} />,
      };
    }
    return c;
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="px-4 lg:px-6">
            <ChartBarInteractive />
          </div>

          <div className="px-4 lg:px-6">
            <DataTable
              columns={[
                ...defaultColumns.slice(0, 2),
                ...columnsWithRenderer,
                defaultColumns[2],
              ]}
              data={rows}
              pageSize={20}
              title={"Activity History"}
              loading={isLoading}
              error={isError}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHistory;
