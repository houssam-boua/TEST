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
import { useGetUsersQuery, useCreateUserMutation } from "@/Slices/userSlice";
import {
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "../Slices/userSlice";
import DeleteUser from "../components/forms/delete-user";
import EditUser from "../components/forms/edit-user";
// Small wrapper component to call hook correctly and render the badge
function RoleBadge({ role }) {
  // use the hook inside a component (not inside render map)
  const badge = useRoleBadge({ role });
  return <>{badge}</>;
}

function DepartmentBadge({ departement }) {
  const badge = useDepartmentBadge({ departement });
  return <>{badge}</>;
}
// Sheet tab data now tailored for user information
const infos = [
  {
    icon: <User className="text-primary" strokeWidth={1.5} size={16} />,
    title: "Nom d'utilisateur",
    description: "jdoe",
  },
  {
    icon: <Mail className="text-primary" strokeWidth={1.5} size={16} />,
    title: "Email",
    description: "jdoe@example.com",
  },
  {
    icon: <Shield className="text-primary" strokeWidth={1.5} size={16} />,
    title: "Rôle",
    description: "Administrateur",
  },
];

const comments = [
  {
    icon: (
      <MessageCircleMore className="text-primary" strokeWidth={1.5} size={16} />
    ),
    title: "Note RH — 2025-09-21",
    description: "Utilisateur évalué positivement.",
  },
  {
    icon: (
      <MessageCircleMore className="text-primary" strokeWidth={1.5} size={16} />
    ),
    title: "Manager — 2025-09-28",
    description: "A terminé la formation sécurité.",
  },
];

const versions = [
  {
    icon: <History className="text-primary" strokeWidth={1.5} size={16} />,
    title: "Dernière connexion",
    description: "2025-10-10 09:32",
  },
  {
    icon: <History className="text-primary" strokeWidth={1.5} size={16} />,
    title: "Mot de passe changé",
    description: "2025-09-01 14:05",
  },
];

const access = [
  {
    icon: <Lock className="text-primary" strokeWidth={1.5} size={16} />,
    title: "Applications",
    description: "Portail, API Admin",
  },
  {
    icon: <Lock className="text-primary" strokeWidth={1.5} size={16} />,
    title: "Permissions",
    description: "Lecture, Écriture, Export",
  },
];
const columns = [
  { id: "id", accessorKey: "id", header: "ID" },
  { id: "username", accessorKey: "username", header: "Nom d'utilisateur" },
  { id: "email", accessorKey: "email", header: "Email" },
  {
    id: "role",
    accessorKey: "role",
    header: "Rôle",
    cell: ({ row }) => {
      return <RoleBadge role={row.original.role} />;
    },
  },
  {
    id: "departement",
    accessorKey: "departement",
    header: "Département",
    cell: ({ row }) => {
      const color = row?.original?.dep_color;
      const name = row?.original?.dep_name;
      return <DepartmentBadge color={color} name={name} />;
    },
  },

  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Créé le",
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
  {
    id: "seeDetails",
    header: "",
    cell: ({ row }) => (
      <SheetDemo
        infos={infos.map((it) =>
          it.title === "Nom d'utilisateur"
            ? { ...it, description: row.original.username }
            : it.title === "Email"
            ? { ...it, description: row.original.email }
            : it.title === "Rôle"
            ? { ...it, description: row.original.role }
            : it
        )}
        comments={comments}
        versions={versions}
        access={access}
      />
    ),
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
              <DialogTitle>Créer un utilisateur</DialogTitle>
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
