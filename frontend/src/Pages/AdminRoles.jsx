import React from "react";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CreateRoleForm from "../components/forms/create-role";

const columns = [
  { id: "id", accessorKey: "id", header: "ID" },
  { id: "role_name", accessorKey: "role_name", header: "Nom du rôle" },
  { id: "role_type", accessorKey: "role_type", header: "Type" },
];

const combinedColumns = [
  ...defaultColumns.slice(0, 2),
  ...columns,
  defaultColumns[2],
];

// mock roles list
const mockRoles = [
  { id: 1, role_name: "admin", role_type: "system" },
  { id: 2, role_name: "user", role_type: "normal" },
  { id: 3, role_name: "validator", role_type: "normal" },
];

const AdminRoles = () => {
  const [list, setList] = React.useState(mockRoles);
  const [createOpen, setCreateOpen] = React.useState(false);

  const handleAdd = () => setCreateOpen(true);

  const handleCreate = async (values) => {
    try {
      const id = (list[list.length - 1]?.id ?? 0) + 1;
      const newRole = {
        id,
        role_name: values.role_name,
        role_type: values.role_type,
      };
      setList((prev) => [...prev, newRole]);
      setCreateOpen(false);
    } catch (err) {
      console.error("Create role failed", err);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <DataTable
          columns={combinedColumns}
          data={list}
          onEdit={() => {}}
          onDelete={() => {}}
          onAdd={handleAdd}
          pageSize={20}
          title={"Roles"}
        />

        <Dialog open={createOpen} onOpenChange={(v) => setCreateOpen(v)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un rôle</DialogTitle>
              <DialogDescription>
                Remplissez les informations du rôle.
              </DialogDescription>
            </DialogHeader>
            <CreateRoleForm onCreate={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminRoles;
