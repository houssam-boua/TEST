import React from "react";
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
import { Button } from "../components/ui/button";
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
    header: "État",
    accessorKey: "etat",
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
  const [workflows, setWorkflows] = React.useState(groups);
  const [createOpen, setCreateOpen] = React.useState(false);

  const handleAdd = () => setCreateOpen(true);

  const handleCreate = async (formData, values) => {
    try {
      const id = (workflows[workflows.length - 1]?.id ?? 0) + 1;
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

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <DataTable
          columns={combinedColumns}
          data={workflows}
          onEdit={() => {}}
          onDelete={() => {}}
          onAdd={handleAdd}
          title={"Workflows"}
          pageSize={20}
        />{" "}
        <Dialog open={createOpen} onOpenChange={(v) => setCreateOpen(v)} className="w-full">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un workflow</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour ajouter un nouveau workflow.
              </DialogDescription>
            </DialogHeader>
            <CreateWorkflowForm onCreate={handleCreate} documents={[]} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ConsulteWorkflow;
