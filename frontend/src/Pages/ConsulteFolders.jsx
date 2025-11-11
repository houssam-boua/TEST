import React from "react";
import { Link, useParams } from "react-router-dom";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import useRelativeTime from "../Hooks/useRelativeTime";
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
  FileText,
} from "lucide-react";
import { Button } from "../components/ui/button";

// (columns are defined inside component so we can use hooks/components safely)

// folder rows will be built dynamically from documents

const ConsulteFolders = () => {
  const { folderId } = useParams();
  const currentPath = folderId ? decodeURIComponent(folderId) : ""; // '' means root
  const { data: documents = [] } = useGetDocumentsQuery();
  const [favorites, setFavorites] = React.useState({});
  function RelativeTime({ date }) {
    const s = useRelativeTime(date);
    return <span className="text-sm text-muted-foreground/70">{s}</span>;
  }

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

  // Build rows: immediate subfolders and files in the current path
  const rows = React.useMemo(() => {
    const items = [];
    const folderMap = new Map();
    const curParts = currentPath ? currentPath.split("/").filter(Boolean) : [];
    const curDepth = curParts.length;

    for (const d of documents || []) {
      const raw = d.doc_path || d.file || d.url || "";
      const path = String(raw || "").replace(/^\/+|\/+$/g, "");
      if (!path) continue;
      const parts = path.split("/").filter(Boolean);

      // If the path aligns with currentPath (prefix), determine whether it's an immediate child folder or a file in this folder
      const matchesPrefix =
        curDepth === 0
          ? true
          : parts.slice(0, curDepth).join("/") === curParts.join("/");
      if (!matchesPrefix) continue;

      if (parts.length > curDepth + 1) {
        // document sits inside a deeper subfolder; we expose the immediate child folder
        const folderName = parts[curDepth];
        const folderKey = (currentPath ? currentPath + "/" : "") + folderName;
        if (!folderMap.has(folderKey)) {
          folderMap.set(folderKey, {
            id: folderKey,
            name: folderName,
            count: 0,
            size: 0,
            isFolder: true,
            path: folderKey,
          });
        }
        const entry = folderMap.get(folderKey);
        entry.count += 1;
        entry.size += Number(d.file_size || d.doc_size || 0) || 0;
      } else if (parts.length === curDepth + 1) {
        // file directly in the current path
        items.push({
          id: d.id ?? path,
          file_name: d.file_name || d.doc_title || parts[parts.length - 1],
          name: d.file_name || d.doc_title || parts[parts.length - 1],
          file_size: d.file_size || d.doc_size || null,
          doc_path: path,
          updated_at: d.updated_at || d.createdAt || d.created_at,
          _raw: d,
          isFolder: false,
        });
      } else if (parts.length === curDepth && curDepth === 0) {
        // file at root (when currentPath is root)
        items.push({
          id: d.id ?? path,
          file_name: d.file_name || d.doc_title || parts[parts.length - 1],
          name: d.file_name || d.doc_title || parts[parts.length - 1],
          file_size: d.file_size || d.doc_size || null,
          doc_path: path,
          updated_at: d.updated_at || d.createdAt || d.created_at,
          _raw: d,
          isFolder: false,
        });
      }
    }

    // Build final rows: folders first (sorted), then files
    const folders = Array.from(folderMap.values()).sort((a, b) =>
      String(a.name).localeCompare(String(b.name))
    );
    const files = items.sort((a, b) =>
      String(a.file_name).localeCompare(String(b.file_name))
    );
    return [...folders, ...files];
  }, [documents, currentPath]);

  // Columns for combined folders+files table
  const columns = [
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const isFolder = row.original?.isFolder;
        const label =
          row.original?.name ||
          row.original?.file_name ||
          row.original?.doc_title ||
          row.original?.doc_path ||
          "";
        return (
          <div className="flex items-center gap-2">
            {isFolder ? (
              <Folder
                strokeWidth={1.5}
                size={16}
                className="fill-primary stroke-none"
              />
            ) : (
              <FileText
                strokeWidth={1.5}
                size={16}
                className="fill-primary stroke-white"
              />
            )}
            <span>{label}</span>
          </div>
        );
      },
    },
    { id: "count", accessorKey: "count", header: "Files" },
    { id: "sharedWith", accessorKey: "sharedWith", header: "Shared With" },
    {
      id: "size",
      accessorKey: "size",
      header: "Size",
      cell: ({ row }) => {
        const size =
          row.original?.size ??
          row.original?.file_size ??
          row.original?.doc_size ??
          null;
        return size ? (
          <span>
            {typeof size === "number" ? `${Math.round(size)} B` : size}
          </span>
        ) : null;
      },
    },
    {
      id: "modifiedAt",
      accessorKey: "modifiedAt",
      header: "Last Modified",
      cell: ({ row }) => {
        const d =
          row.original?.updated_at ||
          row.original?.createdAt ||
          row.original?.created_at;
        return <RelativeTime date={d} />;
      },
    },
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

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <DataTable
          title={currentPath ? `Contents of ${currentPath}` : "Folders & files"}
          columns={combinedColumns}
          data={rows}
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
