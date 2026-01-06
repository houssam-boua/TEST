import React, { useState, useMemo } from "react";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";
import CreateUserForm from "../components/forms/create-user";
import DeleteUser from "../components/forms/delete-user";
import EditUser from "../components/forms/edit-user";
import useRoleBadge from "../Hooks/useRoleBage";
import useDepartmentBadge from "../Hooks/useDepartmentBadge";
import { 
  useGetUsersQuery, 
  useCreateUserMutation, 
  useDeleteUserMutation, 
  useUpdateUserMutation 
} from "@/slices/userSlice";

import { useGetRolesQuery } from "@/slices/rolesSlices";
import { useGetDepartementsQuery } from "@/slices/departementSlice";
import { Avatarr } from "../components/blocks/avatarr";

// Badge Helpers
function RoleBadge({ role }) {
  const badge = useRoleBadge({ role });
  return <>{badge}</>;
}

function DepartmentBadge({ color, name }) {
  const badge = useDepartmentBadge({ color, name });
  return <>{badge}</>;
}

const AdminUsers = () => {
  const { data: users = [], refetch, isLoading } = useGetUsersQuery();
  const { data: rolesList = [] } = useGetRolesQuery();
  const { data: deptsList = [] } = useGetDepartementsQuery();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  
  const [formError, setFormError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [createUser, { isLoading: createLoading }] = useCreateUserMutation();
  const [deleteUser, { isLoading: deleteLoading }] = useDeleteUserMutation();
  const [editUser, { isLoading: editLoading }] = useUpdateUserMutation();

  const columns = useMemo(() => [
    {
      id: "id",
      accessorKey: "id",
      header: "",
      size: 50,
      cell: ({ row }) => (
        <Avatarr
          fstName={row.original.first_name || row.original.username}
          lstName={row.original.last_name}
        />
      ),
    },
    { id: "username", accessorKey: "username", header: "Username" },
    { id: "email", accessorKey: "email", header: "Email" },
    {
      id: "role",
      header: "Role",
      cell: ({ row }) => {
        // According to your JSON, "role" is an object
        const roleData = row.original.role; 
        let roleDisplayName = "Unknown";

        // 1. Check if it's the nested object structure from your JSON
        if (roleData && typeof roleData === 'object' && roleData.role_name) {
          roleDisplayName = roleData.role_name;
        } 
        // 2. Fallback: If it's an ID, look it up in rolesList
        else if (roleData !== null && roleData !== undefined) {
          const found = rolesList.find(item => String(item.id) === String(roleData));
          if (found) roleDisplayName = found.role_name;
        }

        return <RoleBadge role={roleDisplayName} />;
      },
    },
    {
      id: "departement",
      header: "Department",
      cell: ({ row }) => {
        // According to your JSON, "departement" is also an object
        const deptData = row.original.departement;
        let deptName = "Unknown";
        let deptColor = "#cbd5e1";

        if (deptData && typeof deptData === 'object' && deptData.dep_name) {
          deptName = deptData.dep_name;
          deptColor = deptData.dep_color || deptColor;
        } 
        else if (deptData !== null && deptData !== undefined) {
          const found = deptsList.find(item => String(item.id) === String(deptData));
          if (found) {
            deptName = found.dep_name;
            deptColor = found.dep_color;
          }
        }

        return <DepartmentBadge color={deptColor} name={deptName} />;
      },
    },
    {
      id: "date_joined", 
      header: "Created",
      cell: ({ row }) => {
        const dateVal = row.original.date_joined; // Matches "2025-12-30T15:23:38..."
        return dateVal ? new Date(dateVal).toLocaleDateString("en-GB") : "-";
      },
    },
  ], [rolesList, deptsList]); 

  const combinedColumns = useMemo(() => [
    ...defaultColumns.slice(0, 2),
    ...columns,
    defaultColumns[2],
  ], [columns]);

  // Actions Handlers
  const handleEditConfirm = async (data) => {
    setFormError(null);
    try {
      await editUser({ id: data.id, data }).unwrap();
      refetch();
      setEditOpen(false);
      setSelectedUser(null);
    } catch (error) {
      setFormError(error?.data?.detail || "Failed to update user");
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading users...</div>;

  return (
    <div className="flex flex-1 flex-col p-4">
      <DataTable
        columns={combinedColumns}
        data={users}
        onAdd={() => { setFormError(null); setCreateOpen(true); }}
        rowActions={(row) => [
          {
            key: "Edit",
            icon: <Pencil className="w-4 h-4" />,
            label: "Edit",
            onClick: () => { setFormError(null); setSelectedUser(row.original); setEditOpen(true); },
          },
          {
            key: "delete",
            icon: <Trash2 className="w-4 h-4" />,
            label: "Delete",
            onClick: () => { setFormError(null); setSelectedUser(row.original); setDeleteOpen(true); },
          },
        ]}
        pageSize={20}
        title="Users"
      />

      {/* Dialogs for Create/Edit/Delete remain the same as your original file */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create User</DialogTitle></DialogHeader>
          <CreateUserForm
            onSubmit={async (data) => {
              try {
                await createUser(data).unwrap();
                refetch();
                setCreateOpen(false);
              } catch (e) { setFormError(e?.data?.error || "Error"); }
            }}
            onCancel={() => setCreateOpen(false)}
            loading={createLoading}
            error={formError}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          {selectedUser && (
            <EditUser
              user={selectedUser}
              onSubmit={handleEditConfirm}
              onCancel={() => setEditOpen(false)}
              loading={editLoading}
              error={formError}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
          <DeleteUser
            user={selectedUser}
            onDelete={async (user) => {
              try {
                await deleteUser(user.id).unwrap();
                refetch();
                setDeleteOpen(false);
              } catch (e) { setFormError("Error"); }
            }}
            onCancel={() => setDeleteOpen(false)}
            loading={deleteLoading}
            error={formError}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;