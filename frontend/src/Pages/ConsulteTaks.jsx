import React from "react";
import CostumeCardTitle from "../components/collection/costume-card-title";
import CostumeTableHeader from "../components/collection/costume-table-header";
import CollapsibleCard from "../components/collection/collapsible-card";
import { useGetTasksQuery } from "@/Slices/taskSlice";
import { useGetWorkflowsQuery } from "@/Slices/workflowSlice";
import { Card, CardHeader } from "../components/ui/card";
import { Separator } from "@/components/ui/separator";
import TaskCard from "../components/blocks/task-card";
import { useGetTasksofWorkflowQuery } from "../Slices/taskSlice";
import { useParams } from "react-router-dom";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import { ExpandableDataTable } from "../components/tables/expandable-data-table";
import StepperIcons from "../components/blocks/stepper-icon";
import PriorityBadge from "../Hooks/usePriority";
import StatusBadge from "../Hooks/useStatusBadge";

const columns = [
  { id: "id", accessorKey: "id", header: "ID", size: 50 },
  { id: "task_name", accessorKey: "task_name", header: "Task Name" },
  {
    id: "task_assigned_to",
    accessorKey: "task_assigned_to",
    header: "Assigned To",
    cell: ({ row }) => {
      const assignedTo = row.getValue("task_assigned_to");
      if (!assignedTo) return "Unassigned";
      const fullName = `${assignedTo.first_name || ""} ${
        assignedTo.last_name || ""
      }`.trim();
      return fullName || assignedTo.username || "Unassigned";
    },
    size: 150,
  },
  {
    id: "task_priorite",
    accessorKey: "task_priorite",
    header: "Priority",
    cell: ({ row }) => (
      <PriorityBadge priority={row.getValue("task_priorite")} />
    ),
  },
  {
    id: "task_statut",
    accessorKey: "task_statut",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("task_statut")} />,
  },
  {
    id: "task_date_echeance",
    accessorKey: "task_date_echeance",
    header: "Due Date",
    cell: ({ row }) => {
      const date = row.getValue("task_date_echeance");
      if (!date) return "N/A";
      const dateObj = new Date(date);
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();
      return `${day}-${month}-${year}`;
    },
  },
];

const renderSubComponent = ({ row }) => (
  <div className="p-4">
    <StepperIcons task={row.original} />
  </div>
);

const combinedColumns = [...defaultColumns.slice(0, 2), ...columns];

const ConsulteTaks = () => {
  const { workflowId } = useParams();
  const { data: tasksData = {} } = useGetTasksofWorkflowQuery(workflowId);
  const { data: workflowsData = {} } = useGetWorkflowsQuery();

  const tasks = Array.isArray(tasksData) ? tasksData : tasksData?.results || [];
  const workflows = Array.isArray(workflowsData)
    ? workflowsData
    : workflowsData?.results || [];

  const workflowsById = workflows.reduce((acc, w) => {
    acc[w.id || w.pk || w._id] = w;
    return acc;
  }, {});

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <ExpandableDataTable
          columns={combinedColumns}
          data={tasks}
          renderSubComponent={renderSubComponent}
          pageSize={20}
        />
      </div>
    </div>
  );
};

export default ConsulteTaks;
