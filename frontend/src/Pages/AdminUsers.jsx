import React from "react";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import { Info, Lock, MessageCircleMore, History, User, Shield, Mail } from "lucide-react";
import { SheetDemo } from "../components/blocks/sheet";
import useRoleBadge from "../Hooks/useRoleBage";
import useDepartmentBadge from "../Hooks/useDepartmentBadge";
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
      return <DepartmentBadge departement={row.original.departement} />;
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

// Mock user list
const users = [
  {
    id: 1,
    username: "jdoe",
    email: "jdoe@example.com",
    role: "admin",
    departement: "IT",
    createdAt: "2025-09-15T10:00:00Z",
  },
  {
    id: 2,
    username: "asmith",
    email: "asmith@example.com",
    role: "user",
    departement: "HR",
    createdAt: "2025-08-01T08:30:00Z",
  },
  {
    id: 3,
    username: "mbrown",
    email: "mbrown@example.com",
    role: "validator",
    departement: "Finance",
    createdAt: "2025-07-20T14:15:00Z",
  },
  {
    id: 4,
    username: "cwhite",
    email: "cwhite@example.com",
    role: "user",
    departement: "Marketing",
    createdAt: "2025-06-10T12:00:00Z",
  },
  {
    id: 5,
    username: "tgreen",
    email: "tgreen@example.com",
    role: "admin",
    departement: "IT",
    createdAt: "2025-05-05T09:45:00Z",
  },
];
const AdminUsers = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <DataTable
          columns={combinedColumns}
          data={users}
          onEdit={() => {}}
          onDelete={() => {}}
          onAdd={() => {}}
          pageSize={20}
          title={"Users"}
        />
      </div>
    </div>
  );
};

export default AdminUsers;
