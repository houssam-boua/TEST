import React from "react";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import {
  Info,
  Lock,
  MessageCircleMore,
  History,
  User,
  Shield,
  Mail,
  Pencil,
  Trash2,
} from "lucide-react";
import { SheetDemo } from "../components/blocks/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CreateUserForm from "../components/forms/create-user";
import { Button } from "../components/ui/button";
import useRoleBadge from "../Hooks/useRoleBage";
import useDepartmentBadge from "../Hooks/useDepartmentBadge";
import { useGetUsersQuery, useCreateUserMutation } from "@/slices/userSlice";
import {
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "../slices/userSlice";
import DeleteUser from "../components/forms/delete-user";
import EditUser from "../components/forms/edit-user";
import { Avatarr } from "../components/blocks/avatarr";
import { RowExpanding } from "@tanstack/react-table";
// Small wrapper component to call hook correctly and render the badge
function RoleBadge({ role }) {
  // use the hook inside a component (not inside render map)
  const badge = useRoleBadge({ role });
  return <>{badge}</>;
}

function DepartmentBadge({ departement, color, name }) {
  // Accept both the older `departement` prop and explicit `color`/`name` props
  // so callers can pass either shape. Prefer explicit `name`/`color` when provided.
  const badge = useDepartmentBadge({
    color: color ?? undefined,
    name: name ?? departement,
  });
  return <>{badge}</>;
}
// Sheet tab data now tailored for user information





const columns = [
  {
    id: "id",
    accessorKey: "id",
    header: "",
    cell: ({ row }) => (
      <Avatarr
        fstName={
          row.original.first_name ??
          row.original.firstName ??
          row.original.name ??
          row.original.username
        }
        lstName={row.original.last_name ?? row.original.lastName ?? undefined}
      />
    ),
  },
  { id: "username", accessorKey: "username", header: "Username" },
  { id: "email", accessorKey: "email", header: "Email" },
  {
    id: "role",
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      // support nested role object: { role_name, role_color }
      const roleObj = row.original.role || {};
      const roleName = roleObj.role_name ?? roleObj.role ?? roleObj;
      return <RoleBadge role={roleName} />;
    },
  },
  {
    id: "departement",
    accessorKey: "departement",
    header: "Department",
    cell: ({ row }) => {
      // support nested departement object: { dep_name, dep_color }
      const depObj = row.original.departement || {};
      const color =
        depObj.dep_color ?? row.original.departement_color ?? undefined;
      const name = depObj.dep_name ?? row.original.departement ?? undefined;
      return <DepartmentBadge color={color} name={name} />;
    },
  },

  {
    id: "createdAt",
    accessorKey: "created_At",
    header: "Created",
    cell: ({ row }) => {
      const dateValue = row?.original?.createdAt || row?.createdAt;
      if (!dateValue) return "-";
      const date = new Date(dateValue);
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
  },
];

const combinedColumns = [
  ...defaultColumns.slice(0, 2),
  ...columns,
  defaultColumns[2],
];

// users are loaded from the API via useGetUsersQuery
const AdminUsers = () => {
  const {
    data: users,
    refetch,
    isLoading,
    isError,
    error,
  } = useGetUsersQuery();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  const [selectedUser, setSelectedUser] = React.useState(null);
  const [createUser] = useCreateUserMutation();
  const [deleteUser, { isLoading: deleteLoading }] = useDeleteUserMutation();
  const [editUser, { isLoading: editLoading }] = useUpdateUserMutation();

  const handleAdd = () => setCreateOpen(true);
  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditOpen(true);
  };
  const handleDelete = (user) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };
  const handleCreate = async (user) => {
    try {
      await createUser(user).unwrap();
      refetch();
      setCreateOpen(false);
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleConfirmDelete = async (user) => {
    try {
      await deleteUser(user.id).unwrap();
      refetch();
      setDeleteOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const handleConfirmEdit = async (user) => {
    try {
      await editUser({ id: user.id, data: user }).unwrap();
      refetch();
      setEditOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to edit user:", error);
    }
  };

  if (isLoading) return <div className="p-4">Loading users…</div>;
  if (isError)
    return (
      <div className="p-4 text-red-600">
        Error loading users: {String(error)}
      </div>
    );

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
          data={users}
          onEdit={() => {}}
          onDelete={() => {}}
          onAdd={handleAdd}
          rowActions={rowActions}
          pageSize={20}
          title={"Users"}
        />

        {/* Debug console: shows last payload/request and API response */}

        <Dialog open={createOpen} onOpenChange={(v) => setCreateOpen(v)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create un utilisateur</DialogTitle>
              <DialogDescription>
                Remplissez les informations utilisateur.
              </DialogDescription>
            </DialogHeader>
            <CreateUserForm
              onCreate={handleCreate}
              onCancel={() => setCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={deleteOpen} onOpenChange={(v) => setDeleteOpen(v)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this user?
              </DialogDescription>
            </DialogHeader>
            <DeleteUser
              user={selectedUser}
              onDelete={handleConfirmDelete}
              onCancel={() => setDeleteOpen(false)}
              loading={deleteLoading}
            />
          </DialogContent>
        </Dialog>
        <Dialog open={editOpen} onOpenChange={(v) => setEditOpen(v)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Please edit the user information.
              </DialogDescription>
            </DialogHeader>
            <EditUser
              user={selectedUser}
              onSubmit={handleConfirmEdit}
              onCancel={() => setEditOpen(false)}
              loading={editLoading}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminUsers;
