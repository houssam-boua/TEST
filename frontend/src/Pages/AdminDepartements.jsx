import React from "react";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CreateDepartementForm from "../components/forms/create-departement";
import { Button } from "../components/ui/button";

const columns = [
  { id: "id", accessorKey: "id", header: "ID" },
  { id: "dep_name", accessorKey: "dep_name", header: "Nom" },
  { id: "dep_type", accessorKey: "dep_type", header: "Type" },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Créé le",
    cell: ({ row }) => {
      const d = row?.original?.createdAt;
      if (!d) return "-";
      return new Date(d).toLocaleDateString("fr-FR");
    },
  },
];

const initialDeps = [
  {
    id: 1,
    dep_name: "IT",
    dep_type: "Tech",
    createdAt: "2025-09-01T10:00:00Z",
  },
  {
    id: 2,
    dep_name: "HR",
    dep_type: "People",
    createdAt: "2025-08-15T09:00:00Z",
  },
];

const AdminDepartements = () => {
  const [deps, setDeps] = React.useState(initialDeps);
  const [createOpen, setCreateOpen] = React.useState(false);

  const handleAdd = () => setCreateOpen(true);

  const handleCreate = async (values) => {
    try {
      const id = (deps[deps.length - 1]?.id ?? 0) + 1;
      const newItem = {
        id,
        dep_name: values.dep_name,
        dep_type: values.dep_type,
        createdAt: new Date().toISOString(),
      };
      setDeps((p) => [...p, newItem]);
      setCreateOpen(false);
    } catch (err) {
      console.error("Create departement failed", err);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <DataTable
          columns={[
            ...defaultColumns.slice(0, 2),
            ...columns,
            defaultColumns[2],
          ]}
          data={deps}
          onAdd={handleAdd}
          pageSize={20}
          title={"Départements"}
        />

        <Dialog open={createOpen} onOpenChange={(v) => setCreateOpen(v)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un département</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau département.
              </DialogDescription>
            </DialogHeader>
            <CreateDepartementForm onCreate={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDepartements;
