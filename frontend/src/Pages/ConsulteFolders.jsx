import React from "react";
import { Link } from "react-router-dom";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import { useGetDocumentsQuery } from "@/Slices/documentSlice";
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
    header: "Folder",
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
  { id: "count", accessorKey: "count", header: "Files" },
  { id: "size", accessorKey: "size", header: "Size" },
  {
    id: "seeDetails",
    header: "",
    cell: ({ row }) => (
      <Link
        to={`/a/consulter/${encodeURIComponent(row.original.id)}/documents/`}
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

// folder rows will be built dynamically from documents

const ConsulteFolders = () => {
  const { data: documents = [] } = useGetDocumentsQuery();
  const [favorites, setFavorites] = React.useState({});

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

  // group documents by folder prefix
  const folderMap = React.useMemo(() => {
    const m = new Map();
    (documents || []).forEach((d) => {
      const path = d.doc_path || d.file || d.url || "";
      const key = path ? path.replace(/\/[^/]*$/, "") || "root" : "root";
      if (!m.has(key))
        m.set(key, {
          id: key,
          name: key === "root" ? "Root" : key,
          count: 0,
          size: null,
        });
      const entry = m.get(key);
      entry.count = (entry.count || 0) + 1;
    });
    return Array.from(m.values());
  }, [documents]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <DataTable
          title={"Folders"}
          columns={combinedColumns}
          data={folderMap}
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
