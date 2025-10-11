import React from "react";
import { Link } from "react-router-dom";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import { ChevronRight, Eye } from "lucide-react";

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
        <ChevronRight strokeWidth={1.5} />
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

export default ConsulteWorkflow;
