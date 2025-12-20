import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import { ChevronRight, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CreateWorkflowForm from "../components/forms/create-workflow";
import { useGetWorkflowsQuery } from "@/Slices/workflowSlice";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import DepartmentBadge from "../Hooks/useDepartmentBadge";
import StatusBadge from "../Hooks/useStatusBadge";
import { SheetDemo } from "../components/blocks/sheet";

// Small helper component used inside the table cell so we can use hooks
function DocumentCell({ row }) {
  const [open, setOpen] = useState(false);

  // prefer nested task_workflow.document if present, otherwise fall back to document
  const taskWorkflow = row?.original?.task_workflow || row?.original;
  const doc = taskWorkflow?.document || row?.original?.document || null;

  const infos = doc ? [doc] : [];

  return (
    <>
      <Button
        variant="secondary"
        className="w-6 h-6"
        onClick={() => setOpen(true)}
      >
        <Eye strokeWidth={1.5} size={16} />
      </Button>
      <SheetDemo open={open} onOpenChange={setOpen} infos={infos} />
    </>
  );
}
const columns = [
  {
    id: "id",
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span className="italic">#{row?.original?.id}</span>,
  },
  {
    id: "nom",
    accessorKey: "nom",
    header: "Document Title",
  },
  {
    id: "etat",
    header: "Status",
    accessorKey: "etat",
    cell: ({ row }) => {
      const etat = row?.original?.etat;

      // Normalize and compute a friendly label + color

      return <StatusBadge status={etat} />;
    },
  },

  {
    id: "created_at",
    header: "Created At",
    accessorKey: "created_at",
    cell: ({ row }) => {
      const date = row?.original?.created_at;
      if (!date) return "-";
      return new Date(date).toLocaleDateString("fr-FR");
    },
  },
  {
    id: "document",
    header: "Document",
    accessorKey: "document",
    cell: ({ row }) => <DocumentCell row={row} />,
  },

  {
    id: "seeDetails",
    header: "",
    cell: ({ row }) => (
      <Link
        to={`/consulter-workflow/${row.original.id}/tasks`}
        className="text-muted-foreground/50"
        rel="noopener noreferrer"
      >
        <Button variant="secondary" className="w-6 h-6">
          <ChevronRight
            strokeWidth={1.5}
            size={20}
            className="stroke-muted-foreground/50"
          />
        </Button>{" "}
      </Link>
    ),
  },
];

const combinedColumns = [
  ...defaultColumns.slice(0, 2),
  ...columns,
  defaultColumns[2],
];

// Mock data matching the columns used in combinedColumns
const groups = [
  {
    id: 1,
    nom: "Groupe A",
    description: "Projet Alpha",
    etat: "2025-09-15T10:00:00Z",
    document: 101,
  },
  {
    id: 2,
    nom: "Groupe B",
    description: "Projet Beta",
    etat: "In progress",
    document: 102,
  },
  {
    id: 3,
    nom: "Groupe C",
    description: "Projet Gamma",
    etat: "In progress",
    document: 103,
  },
  {
    id: 4,
    nom: "Groupe D",
    description: "Projet Delta",
    etat: "In progress",
    document: 104,
  },
  {
    id: 5,
    nom: "Groupe E",
    description: "Projet Epsilon",
    etat: "In progress",
    document: 105,
  },
];
const ConsulteWorkflow = () => {
  const {
    data: fetchedWorkflows = [],
    isLoading,
    isError,
  } = useGetWorkflowsQuery();

  const [workflows, setWorkflows] = useState(groups);
  const [createOpen, setCreateOpen] = useState(false);
  const [expanded, setExpanded] = useState({});

  const handleAdd = () => setCreateOpen(true);

  const handleCreate = async (formData, values) => {
    try {
      const id =
        (workflows[workflows.length - 1]?.id ??
          fetchedWorkflows[fetchedWorkflows.length - 1]?.id ??
          0) + 1;
      const newItem = {
        id,
        nom: values.nom || `Workflow ${id}`,
        description: values.description || "",
        etat: values.etat || "in_progress",
        document: values.document || "",
      };
      setWorkflows((prev) => [...prev, newItem]);
      setCreateOpen(false);
    } catch (err) {
      console.error("Failed to create workflow", err);
    }
  };

  const displayed = isLoading || isError ? workflows : fetchedWorkflows;

  const toggleExpanded = (id) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  const localColumns = useMemo(() => {
    // Clone combinedColumns and replace the seeDetails cell to toggle expansion
    const cols = combinedColumns.map((c) => ({ ...c }));
    const idx = cols.findIndex((c) => c && c.id === "seeDetails");
    if (idx !== -1) {
      cols[idx].cell = ({ row }) => (
        <Link
          to={`/consulter-workflow/${row.original.id}/tasks`}
          className="text-muted-foreground/50"
          rel="noopener noreferrer"
        >
          <Button variant="secondary" className="w-6 h-6">
            <ChevronRight
              strokeWidth={1.5}
              size={20}
              className="stroke-muted-foreground/50"
            />
          </Button>
        </Link>
      );
    }
    return cols;
  }, [expanded]);

  const navigate = useNavigate();

  const redirectAdd = () => {
    navigate("/creer-workflow");
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-2 md:py-6 px-4">
        <DataTable
          columns={localColumns}
          data={displayed}
          onEdit={() => {}}
          onDelete={() => {}}
          onAdd={redirectAdd}
          title={"Workflows"}
          pageSize={20}
        />

        {/* Collapsible task cards below the table, one block per expanded workflow */}

        <Dialog
          open={createOpen}
          onOpenChange={(v) => setCreateOpen(v)}
          className="w-full"
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a workflow</DialogTitle>
              <DialogDescription>
                Fill in the information to add a new workflow.
              </DialogDescription>
            </DialogHeader>
            <CreateWorkflowForm
              onCreate={handleCreate}
              documents={fetchedWorkflows}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ConsulteWorkflow;
