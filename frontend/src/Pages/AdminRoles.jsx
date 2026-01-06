import React, { useState } from "react";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Shield } from "lucide-react";

// API Hooks
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from "@/slices/rolesSlices";

// Forms
import CreateRoleForm from "../components/forms/create-role";
import EditRoleForm from "../components/forms/edit-role";
import DeleteRoleForm from "../components/forms/delete-role";

// --- Custom Badge ---
const RoleBadge = ({ name, color }) => (
  <Badge
    variant="outline"
    style={{
      backgroundColor: color ? `${color}20` : "#f3f4f6",
      color: color || "#374151",
      borderColor: color ? `${color}40` : "#d1d5db",
    }}
    className="gap-1.5"
  >
    <Shield size={12} fill={color} />
    {name}
  </Badge>
);

const columns = [
  { id: "id", accessorKey: "id", header: "ID", size: 50 },
  { 
    id: "role_name", 
    accessorKey: "role_name", 
    header: "Role Name",
    cell: ({ row }) => <span className="font-medium">{row.original.role_name}</span>
  },
  {
    id: "role_color",
    accessorKey: "role_color",
    header: "Badge Preview",
    cell: ({ row }) => (
      <RoleBadge name={row.original.role_name} color={row.original.role_color} />
    ),
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      const d = row?.original?.created_at;
      return d ? new Date(d).toLocaleDateString("en-GB") : "-";
    },
  },
];

const AdminRoles = () => {
  const { data: roles = [], refetch } = useGetRolesQuery();
  
  const [createRole, { isLoading: createLoading }] = useCreateRoleMutation();
  const [updateRole, { isLoading: updateLoading, error: updateError }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: deleteLoading, error: deleteError }] = useDeleteRoleMutation();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  // Local state for errors to clear them when modal opens/closes
  const [formError, setFormError] = useState(null);
  
  const [selectedRole, setSelectedRole] = useState(null);

  // --- Handlers ---
  const handleCreate = async (formData) => {
    setFormError(null);
    try {
      await createRole(formData).unwrap();
      refetch();
      setCreateOpen(false);
    } catch (error) {
      console.error("Failed to create role:", error);
      setFormError(error?.data?.detail || "Failed to create role");
    }
  };

  const handleEdit = (role) => {
    setFormError(null);
    setSelectedRole(role);
    setEditOpen(true);
  };

  const handleConfirmEdit = async (formData) => {
    setFormError(null);
    try {
      await updateRole({ id: selectedRole.id, ...formData }).unwrap();
      refetch();
      setEditOpen(false);
      setSelectedRole(null);
    } catch (error) {
      console.error("Failed to update role:", error);
      // ✅ Now the form will display this error instead of closing silently
      setFormError(error?.data?.detail || "Failed to update role");
    }
  };

  const handleDelete = (role) => {
    setFormError(null);
    setSelectedRole(role);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    setFormError(null);
    try {
      await deleteRole(selectedRole.id).unwrap();
      refetch();
      setDeleteOpen(false);
      setSelectedRole(null);
    } catch (error) {
      console.error("Failed to delete role:", error);
      setFormError(error?.data?.detail || "Failed to delete role");
    }
  };

  const rowActions = (row) => [
    {
      key: "edit",
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
      <div className="flex flex-1 flex-col gap-4 md:py-6 px-4">
        <DataTable
          columns={[...defaultColumns.slice(0, 2), ...columns, defaultColumns[2]]}
          data={roles}
          onAdd={() => {
            setFormError(null);
            setCreateOpen(true);
          }}
          rowActions={rowActions}
          pageSize={20}
          title="User Roles"
        />

        {/* Create Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>Define a functional role (e.g., Author).</DialogDescription>
            </DialogHeader>
            <CreateRoleForm
              onCreate={handleCreate}
              onCancel={() => setCreateOpen(false)}
              loading={createLoading}
              error={formError}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>Update the role name or color.</DialogDescription>
            </DialogHeader>
            {selectedRole && (
              <EditRoleForm
                initialData={selectedRole}
                onSave={handleConfirmEdit}
                onCancel={() => setEditOpen(false)}
                loading={updateLoading}
                error={formError || updateError} // ✅ Pass error to form
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Role</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{selectedRole?.role_name}</strong>?
              </DialogDescription>
            </DialogHeader>
            <DeleteRoleForm
              onConfirm={handleConfirmDelete}
              onCancel={() => setDeleteOpen(false)}
              loading={deleteLoading}
              error={formError || deleteError} // ✅ Pass error to form
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminRoles;