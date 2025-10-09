import React from "react";
import { Link } from "react-router-dom";
import { DataTable, defaultColumns } from "../components/tables/data-table";

const columns = [
  {
    id: "id",
    accessorKey: "id",
    header: "ID",
  },
  {
    id: "groupname",
    accessorKey: "groupname",
    header: "Nom du groupe",
  },
  {
    id: "project",
    header: "Projet",
    accessorKey: "projectName",
  },
  {
    id: "devicesCount",
    header: "Nombre d'appareils",
    cell: ({ row }) => row.original?.devices?.length || 0,
    enableSorting: false,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Date de début",
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
    header: "Voir les détails",
    cell: ({ row }) => (
      <Link
        to={`/admin/devicegrp/project/${row.original.projetId}`}
        className="text-blue-600 underline hover:text-blue-800"
        rel="noopener noreferrer"
      >
        Détails
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
    groupname: "Groupe A",
    projectName: "Projet Alpha",
    devices: [{ id: "DA-1" }, { id: "DA-2" }, { id: "DA-3" }],
    createdAt: "2025-09-15T10:00:00Z",
    projetId: 101,
  },
  {
    id: 2,
    groupname: "Groupe B",
    projectName: "Projet Beta",
    devices: [{ id: "DB-1" }],
    createdAt: "2025-08-01T08:30:00Z",
    projetId: 102,
  },
  {
    id: 3,
    groupname: "Groupe C",
    projectName: "Projet Gamma",
    devices: [],
    createdAt: "2025-07-20T14:15:00Z",
    projetId: 103,
  },
  {
    id: 4,
    groupname: "Groupe D",
    projectName: "Projet Delta",
    devices: [{ id: "DD-1" }, { id: "DD-2" }],
    createdAt: "2025-06-10T12:00:00Z",
    projetId: 104,
  },
  {
    id: 5,
    groupname: "Groupe E",
    projectName: "Projet Epsilon",
    devices: [{ id: "DE-1" }, { id: "DE-2" }, { id: "DE-3" }, { id: "DE-4" }],
    createdAt: "2025-05-05T09:45:00Z",
    projetId: 105,
  },
];

const ConsulteDocuments = () => {
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

export default ConsulteDocuments;
