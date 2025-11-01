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
import { useGetRolesQuery, useCreateRoleMutation } from "@/Slices/rolesSlices";
import DepartmentBadge from "../Hooks/useDepartmentBadge";
import {
  useDeleteRoleMutation,
  useUpdateRoleMutation,
} from "../Slices/rolesSlices";
import EditRole from "../components/forms/edit-role";
import DeleteRole from "../components/forms/delete-role";
import { Pencil, Trash2 } from "lucide-react";

const columns = [
  { id: "id", accessorKey: "id", header: "ID" },
  { id: "role_name", accessorKey: "role_name", header: "Nom du rôle" },
  {
    id: "role_color",
    accessorKey: "role_color",
    header: "Couleur",
    cell: ({ row }) => {
      const color = row?.original?.role_color;
      const name = row?.original?.role_name;
      return <DepartmentBadge color={color} name={name} />;
    },
  },
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
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState(null);

  const { data: roles, refetch } = useGetRolesQuery();
  const [createRole, { createLoading }] = useCreateRoleMutation();
  const [editRole, { isLoading: editLoading }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: deleteLoading }] = useDeleteRoleMutation();

  const handleCreate = () => setCreateOpen(true);
  const handleEdit = (role) => {
    setSelectedRole(role);
    setEditOpen(true);
  };
  const handleDelete = (role) => {
    setSelectedRole(role);
    setDeleteOpen(true);
  };

  const handleCreateSubmit = async (values) => {
    try {
      await createRole(values).unwrap();
      await refetch();
      setCreateOpen(false);
    } catch (err) {
      console.error("Create role failed", err);
    }
  };

  const handleEditSubmit = async (values) => {
    try {
      await editRole({ id: selectedRole.id, ...values }).unwrap();
      await refetch();
      setEditOpen(false);
    } catch (err) {
      console.error("Edit role failed", err);
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await deleteRole(selectedRole.id).unwrap();
      await refetch();
      setDeleteOpen(false);
    } catch (err) {
      console.error("Delete role failed", err);
    }
  };

  const rowActions = (row) => [
    {
      key: "Edit",
      icon: <Pencil className="w-4 h-4" />,
      label: "Edit",
      onClick: () => handleEdit(row.original),
    },

    {
      key: "delete",
      icon: <Trash2 className="w-4 h-4" />,
      label: "Delete",
      onClick: () => handleDelete(row.original),
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <DataTable
          columns={combinedColumns}
          data={roles || mockRoles}
          onEdit={() => {}}
          onDelete={() => {}}
          onAdd={handleCreate}
          rowActions={rowActions}
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
            <CreateRoleForm
              onCreate={handleCreateSubmit}
              onCancel={() => setCreateOpen(false)}
              loading={createLoading}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onOpenChange={(v) => setEditOpen(v)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>
                Please edit the role information.
              </DialogDescription>
            </DialogHeader>
            <EditRole
              role={selectedRole}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditOpen(false)}
              loading={editLoading}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={deleteOpen} onOpenChange={(v) => setDeleteOpen(v)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Role</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this role?
              </DialogDescription>
            </DialogHeader>
            <DeleteRole
              role={selectedRole}
              onDelete={handleDeleteSubmit}
              onCancel={() => setDeleteOpen(false)}
              loading={deleteLoading}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminRoles;
