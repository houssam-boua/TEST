import React, { useState, useMemo } from "react";
import CostumeCardTitle from "../components/collection/costume-card-title";
import CostumeTableHeader from "../components/collection/costume-table-header";
import CollapsibleCard from "../components/collection/collapsible-card";
import { useGetTasksQuery, useUpdateTaskMutation } from "@/slices/taskSlice";
import { useGetWorkflowsQuery } from "@/slices/workflowSlice";
import { Card, CardHeader } from "../components/ui/card";
import { Separator } from "@/components/ui/separator";
import TaskCard from "../components/blocks/task-card";
import { useGetTasksofWorkflowQuery } from "../slices/taskSlice";
import { useParams } from "react-router-dom";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import { ExpandableDataTable } from "../components/tables/expandable-data-table";
import StepperIcons from "../components/blocks/stepper-icon";
import PriorityBadge from "../Hooks/usePriority";
import StatusBadge from "../Hooks/useStatusBadge";
import { useSelector } from "react-redux";
import { selectHasRole } from "@/slices/authSlice";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import SheetInfoSection from "../components/blocks/sheet-info-section";
import { ArrowDownToLine, Check, X } from "lucide-react";

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

// combinedColumns will be created inside component to allow role-based columns

const ConsulteTaks = () => {
  const { workflowId } = useParams();
  const { data: tasksData = {} } = useGetTasksofWorkflowQuery(workflowId);
  const { data: workflowsData = {} } = useGetWorkflowsQuery();

  const isValidator = useSelector(selectHasRole("admin"));
  const [docOpen, setDocOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const tasks = Array.isArray(tasksData) ? tasksData : tasksData?.results || [];
  const workflows = Array.isArray(workflowsData)
    ? workflowsData
    : workflowsData?.results || [];

  const workflowsById = workflows.reduce((acc, w) => {
    acc[w.id || w.pk || w._id] = w;
    return acc;
  }, {});

  const combinedColumns = useMemo(() => {
    const base = [...defaultColumns.slice(0, 2), ...columns];
    if (isValidator) {
      // helper to build absolute encoded url
      const buildFileUrl = (filePath) => {
        if (!filePath) return null;
        if (/^https?:\/\//i.test(filePath)) return filePath;
        const encodePath = (p) =>
          String(p || "")
            .split("/")
            .map((s) => encodeURIComponent(s))
            .join("/");
        let base = import.meta.env.VITE_MINIO_BASE_URL || "";
        if (!base) base = "https://s3.ramaqs.com/smartdocspro";
        let baseClean = base.replace(/\/$/, "");
        if (!/^https?:\/\//i.test(baseClean))
          baseClean = `https://${baseClean}`;
        if (!baseClean.includes("smartdocspro"))
          baseClean = baseClean.replace(/\/$/, "") + "/smartdocspro";
        const pathOnly = String(filePath).split("?")[0].replace(/^\/?/, "");
        return (
          `${baseClean}/${encodePath(pathOnly)}` +
          (String(filePath).includes("?")
            ? `?${String(filePath).split("?").slice(1).join("?")}`
            : "")
        );
      };

      // Download column
      base.push({
        id: "download",
        header: "",
        cell: ({ row }) => {
          const doc =
            row.original?.task_workflow?.document ||
            row.original?.document ||
            null;
          const path = doc?.doc_path || doc?.document_path || null;
          const url = buildFileUrl(path);
          return url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              download
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <ArrowDownToLine size={14} />
              Download
            </a>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      });

      // Validate column (opens modal)
      base.push({
        id: "validate",
        header: "",
        cell: ({ row }) => {
          const doc =
            row.original?.task_workflow?.document ||
            row.original?.document ||
            null;
          return (
            <span
              variant="secondary"
              className="cursor-pointer inline-flex items-center gap-1 text-green-600 hover:underline"
              onClick={() => {
                setSelectedDoc(doc);
                setSelectedTaskId(
                  row.original?.id ||
                    row.original?.pk ||
                    row.original?._id ||
                    null
                );
                setValidateOpen(true);
              }}
            >
              <Check size={14} />
              validate
            </span>
          );
        },
      });

      // Invalidate column (opens modal)
      base.push({
        id: "invalidate",
        header: "",
        cell: ({ row }) => {
          const doc =
            row.original?.task_workflow?.document ||
            row.original?.document ||
            null;
          return (
            <span
              variant="destructive"
              className="cursor-pointer inline-flex items-center gap-1 text-red-600 hover:underline"
              onClick={() => {
                setSelectedDoc(doc);
                setSelectedTaskId(
                  row.original?.id ||
                    row.original?.pk ||
                    row.original?._id ||
                    null
                );
                setInvalidateOpen(true);
              }}
            >
              <X size={14} />
              Invalidate
            </span>
          );
        },
      });
    }
    return base;
  }, [isValidator]);

  // dialog states for validation actions
  const [validateOpen, setValidateOpen] = useState(false);
  const [invalidateOpen, setInvalidateOpen] = useState(false);
  const [updateTask] = useUpdateTaskMutation();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <ExpandableDataTable
          columns={combinedColumns}
          data={tasks}
          renderSubComponent={renderSubComponent}
          pageSize={20}
        />

        <Dialog open={docOpen} onOpenChange={setDocOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Document</DialogTitle>
              <DialogDescription>Document preview</DialogDescription>
            </DialogHeader>
            <div className="py-2"></div>
          </DialogContent>
        </Dialog>

        <Dialog open={validateOpen} onOpenChange={setValidateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Validate Document</DialogTitle>
              <DialogDescription>Confirm validation</DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => {
                    (async () => {
                      if (!selectedTaskId) return setValidateOpen(false);
                      try {
                        await updateTask({
                          id: selectedTaskId,
                          data: { task_statut: "completed" },
                        }).unwrap();
                        setValidateOpen(false);
                      } catch (e) {
                        console.error(e);
                      }
                    })();
                  }}
                >
                  Confirm
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setValidateOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={invalidateOpen} onOpenChange={setInvalidateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invalidate Document</DialogTitle>
              <DialogDescription>Confirm invalidation</DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <div className="flex gap-2 mt-4">
                <Button
                  variant="destructive"
                  onClick={() => {
                    (async () => {
                      if (!selectedTaskId) return setInvalidateOpen(false);
                      try {
                        await updateTask({
                          id: selectedTaskId,
                          data: { task_statut: "not_started" },
                        }).unwrap();
                        setInvalidateOpen(false);
                      } catch (e) {
                        console.error(e);
                      }
                    })();
                  }}
                >
                  Confirm
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setInvalidateOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ConsulteTaks;
