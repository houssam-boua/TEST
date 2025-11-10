import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
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
const columns = [
  {
    id: "id",
    accessorKey: "id",
    header: "ID",
  },
  {
    id: "nom",
    accessorKey: "nom",
    header: "Title",
  },
  {
    id: "document",
    header: "Document",
    accessorKey: "document",
  },

  {
    id: "etat",
    header: "Status",
    accessorKey: "etat",
    cell: ({ row }) => {
      const etat = row?.original?.etat;

      // Normalize and compute a friendly label + color
      let label = "Unknown";
      let color = "blue";

      if (etat) {
        const raw = String(etat).trim();
        const lower = raw.toLowerCase();

        // If etat looks like an ISO date, show a localized date (treat as completed)
        const parsed = Date.parse(raw);
        if (!Number.isNaN(parsed)) {
          label = new Date(parsed).toLocaleDateString();
          color = "var(--chart-4)"; // completed color
        } else if (lower === "completed" || lower === "done") {
          label = "Completed";
          color = "var(--chart-4)";
        } else if (
          lower === "in_progress" ||
          lower === "in progress" ||
          lower === "inprogress"
        ) {
          label = "In Progress";
          color = "var(--chart-1)";
        } else {
          // Fallback: display the raw value but keep default color
          label = raw;
          color = "blue";
        }
      }

      return <StatusBadge name={label} color={color} />;
    },
  },
  {
    id: "description",
    header: "Description",
    accessorKey: "description",
  },
  {
    id: "seeDetails",
    header: "",
    cell: ({ row }) => (
      <Link
        to={`/a/consulter-workflow/${row.original.id}/tasks`}
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
        <Button
          variant="secondary"
          className="w-6 h-6"
          onClick={() => toggleExpanded(row.original.id)}
          aria-expanded={!!expanded[row.original.id]}
        >
          <ChevronRight
            strokeWidth={1.5}
            size={20}
            className={`transition-transform ${
              expanded[row.original.id] ? "rotate-90" : ""
            }`}
          />
        </Button>
      );
    }
    return cols;
  }, [expanded]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <DataTable
          columns={localColumns}
          data={displayed}
          onEdit={() => {}}
          onDelete={() => {}}
          onAdd={handleAdd}
          title={"Workflows"}
          pageSize={20}
        />

        {/* Collapsible task cards below the table, one block per expanded workflow */}
        {displayed.map((wf) =>
          expanded[wf.id] ? (
            <div key={`expanded-${wf.id}`} className="mt-3">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-medium">Tâches — {wf.nom}</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleExpanded(wf.id)}
                  >
                    Fermer
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-3">
                  {wf.tasks && wf.tasks.length > 0 ? (
                    wf.tasks.map((task) => (
                      <Card key={task.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {task.nom || task.title || task.name}
                            </div>
                            {task.description ? (
                              <div className="text-sm text-muted-foreground">
                                {task.description}
                              </div>
                            ) : null}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {task.etat || task.status || "-"}
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Pas de tâches trouvées.{" "}
                      <Link to={`/a/consulter-workflow/${wf.id}/tasks`}>
                        Ouvrir la page des tâches
                      </Link>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ) : null
        )}

        <Dialog
          open={createOpen}
          onOpenChange={(v) => setCreateOpen(v)}
          className="w-full"
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un workflow</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour ajouter un nouveau workflow.
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
