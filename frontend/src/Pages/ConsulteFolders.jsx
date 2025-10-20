import React from "react";
import { Link } from "react-router-dom";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import {
  ChevronRight,
  Copy,
  Download,
  Eye,
  Folder,
  Info,
  Pencil,
  SquareArrowOutUpRight,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "../components/ui/button";

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
        <Button variant="secondary" className="w-6 h-6">
          <ChevronRight
            strokeWidth={1.5}
            size={20}
            className="stroke-muted-foreground/50"
          />
        </Button>
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
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [favorites, setFavorites] = React.useState({});

  const handleDetails = (row) => {
    // set the selected row data and open the sheet
    setSelectedRow(row?.original ?? null);
    setSheetOpen(true);
  };

  const handleDownload = (row) => {
    console.log("Download", row.original);
    // implement download logic here
  };

  const handleEdit = (row) => {
    console.log("Duplicate", row.original);
    // implement duplication logic here
  };

  const handleShare = (row) => {
    console.log("Share", row.original);
    // implement share logic here
  };

  const handleDelete = (row) => {
    console.log("Delete", row.original);
    // implement delete logic here
  };
  const handleFavorite = (row) => {
    const id = row?.original?.id;
    if (typeof id === "undefined") return;
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const rowActions = (row) => [
    {
      key: "favorite",
      icon: favorites[row?.original?.id] ? (
        <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
      ) : (
        <Star className="w-4 h-4" />
      ),
      label: favorites[row?.original?.id] ? "Unfavorite" : "Favorite",
      onClick: () => handleFavorite(row),
    },
    {
      key: "download",
      icon: <Download className="w-4 h-4" />,
      label: "Download",
      onClick: () => handleDownload(row),
    },
    {
      key: "Edit",
      icon: <Pencil className="w-4 h-4" />,
      label: "Edit",
      onClick: () => handleEdit(row),
    },

    {
      key: "delete",
      icon: <Trash2 className="w-4 h-4" />,
      label: "Delete",
      onClick: () => handleDelete(row),
    },
    {
      key: "move",
      icon: <SquareArrowOutUpRight className="w-4 h-4" />,
      label: "Move",
      onClick: () => handleShare(row),
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <DataTable
          title={"Folders"}
          columns={combinedColumns}
          data={groups}
          onEdit={() => {}}
          onDelete={() => {}}
          onAdd={() => {}}
          pageSize={20}
          rowActions={rowActions}
        />
      </div>
    </div>
  );
};

export default ConsulteFolders;
