import React from "react";
import { Link } from "react-router-dom";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import { ChevronRight, Eye, Folder, Users } from "lucide-react";

const columns = [
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Folder
            strokeWidth={1.5}
            size={16}
            className="fill-primary stroke-none"
          />
          <span>{row.original.name}</span>
        </div>
      );
    },
  },
  {
    id: "size",
    accessorKey: "size",
    header: "Size",
  },
  {
    id: "modifiedAt",
    accessorKey: "modifiedAt",
    header: "Modified",
  },
  {
    id: "sharedWith",
    accessorKey: "sharedWith",
    header: "Access",
    cell: ({ row }) => {
      return (
        <Users
          strokeWidth={1.5}
          size={20}
          className="stroke-muted-foreground/50"
        />
      );
    },
  },
  {
    id: "seeDetails",
    header: "",
    cell: ({ row }) => (
      <Link
        to={`/a/consulter/${row.original.id}/documents`}
        className="text-primary-"
        rel="noopener noreferrer"
      >
        <ChevronRight
          strokeWidth={1.5}
          size={20}
          className="stroke-muted-foreground/50"
        />
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
    name: "Dossier Alpha",
    size: "2MB",
    modifiedAt: "6 minutes ago",
    projetId: 101,
  },
  {
    id: 2,
    name: "Dossier Beta",
    size: "5.7MB",
    modifiedAt: "10 days ago",

    projetId: 102,
  },
  {
    id: 3,
    name: "Dossier Gamma",
    size: "9.1MB",
    modifiedAt: "20 hrs ago",
    projetId: 103,
  },
  {
    id: 4,
    size: "20MB",
    name: "Dossier Delta",
    modifiedAt: "1 day ago",
    projetId: 104,
  },
  {
    id: 5,
    size: "25MB",
    name: "Dossier Epsilon",
    modifiedAt: "6 day ago",
    projetId: 105,
  },
];

const ConsulteFolders = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <DataTable
          columns={combinedColumns}
          data={groups}
          onEdit={() => {}}
          onDelete={() => {}}
          onAdd={() => {}}
          pageSize={20}
        />{" "}
      </div>
    </div>
  );
};

export default ConsulteFolders;
