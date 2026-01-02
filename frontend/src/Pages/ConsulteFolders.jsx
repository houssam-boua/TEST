import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import useRelativeTime from "../Hooks/useRelativeTime";
import {
  useGetDocumentsQuery,
  useGetFoldersQuery,
} from "@/slices/documentSlice";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import CreateFolder from "../components/forms/create-folder";
import { useCreateFolderMutation } from "../slices/documentSlice";
// (columns are defined inside component so we can use hooks/components safely)
// (columns are defined inside component so we can use hooks/components safely)

// folder rows will be built dynamically from documents

const ConsulteFolders = () => {
  const { folderId } = useParams();
  const [newPathOpen, setNewPathOpen] = React.useState(false);
  const [newPathValue, setNewPathValue] = React.useState("");

  const [createFolder, { createFolderLoading }] = useCreateFolderMutation();
  // Normalize currentPath: remove leading/trailing slashes and surrounding whitespace
  function normalizePath(p) {
    if (!p && p !== "") return "";
    const s = String(p || "").trim();
    return s.replace(/^\/+|\/+$/g, "");
  }

  const currentPath = folderId
    ? normalizePath(decodeURIComponent(folderId))
    : ""; // '' means root

  // Prefer folder-list API when available; fallback to deriving folders from documents
  const { data: foldersApiData = [] } = useGetFoldersQuery();
  const { data: documents = [] } = useGetDocumentsQuery(
    folderId ? { folder: currentPath } : undefined
  );
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

  // NOTE: helper logic inlined into memo below to satisfy hook lint rules

  const rows = React.useMemo(() => {
    const items = [];
    const folderMap = new Map();

    // Use folders API when available
    const folderPaths = Array.isArray(foldersApiData)
      ? foldersApiData
      : (foldersApiData && foldersApiData.folders) || [];

    if (folderPaths && folderPaths.length > 0) {
      // derive immediate child names from folderPaths, stripping a common prefix if detected
      const cleaned = (folderPaths || [])
        .map((p) =>
          String(p || "")
            .trim()
            .replace(/^\/+|\/+$/g, "")
        )
        .filter(Boolean);
      let prefixToStrip = null;
      if (cleaned.length > 0) {
        const firstSegments = cleaned.map((p) => p.split("/")[0]);
        const counts = firstSegments.reduce((acc, seg) => {
          acc[seg] = (acc[seg] || 0) + 1;
          return acc;
        }, {});
        const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const [topSeg, topCount] = entries[0] || [null, 0];
        if (
          topSeg &&
          topCount / cleaned.length >= 0.6 &&
          /^[A-Za-z0-9-]+$/.test(topSeg)
        ) {
          prefixToStrip = topSeg;
        }
      }
      const curNorm = normalizePath(currentPath || "");
      const curParts = curNorm ? curNorm.split("/").filter(Boolean) : [];
      const curDepth = curParts.length;
      const childrenSet = new Map();
      for (const raw of cleaned) {
        let p = raw;
        if (prefixToStrip && p.startsWith(prefixToStrip + "/")) {
          p = p.slice(prefixToStrip.length + 1);
        }
        const parts = p.split("/").filter(Boolean);
        if (curDepth === 0) {
          if (parts.length >= 1) {
            const name = parts[0];
            childrenSet.set(name, (childrenSet.get(name) || 0) + 1);
          }
        } else {
          if (parts.length > curDepth) {
            const matches =
              parts.slice(0, curDepth).join("/") === curParts.join("/");
            if (!matches) continue;
            const name = parts[curDepth];
            childrenSet.set(name, (childrenSet.get(name) || 0) + 1);
          }
        }
      }
      const childNames = Array.from(childrenSet.keys()).sort();
      for (const name of childNames) {
        const key = (currentPath ? currentPath + "/" : "") + name;
        folderMap.set(key, {
          id: key,
          name,
          count: 0,
          size: 0,
          isFolder: true,
          path: key,
        });
      }
    }

    // Derive files (and fallback folders) from documents data
    const curParts = currentPath ? currentPath.split("/").filter(Boolean) : [];
    const curDepth = curParts.length;
    for (const d of documents || []) {
      const raw = d.doc_path || d.file || d.url || "";
      const path = String(raw || "")
        .trim()
        .replace(/^\/+|\/+$/g, "");
      if (!path) continue;
      // If foldersApiData was empty, derive folder entries from documents
      if (!folderPaths || folderPaths.length === 0) {
        const parts = path.split("/").filter(Boolean);
        const matchesPrefix =
          curDepth === 0
            ? true
            : parts.slice(0, curDepth).join("/") === curParts.join("/");
        if (!matchesPrefix) continue;
        if (parts.length > curDepth + 1) {
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
          continue;
        }
      }

      // File directly in current path
      const parts = path.split("/").filter(Boolean);
      if (curDepth === 0) {
        if (parts.length === 1) {
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
      } else {
        const prefix = curParts.join("/");
        if (path === prefix || path.startsWith(prefix + "/")) {
          const rest = curDepth === 0 ? path : path.replace(prefix + "/", "");
          if (rest && !rest.includes("/")) {
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
      }
    }

    const folders = Array.from(folderMap.values()).sort((a, b) =>
      String(a.name).localeCompare(String(b.name))
    );
    const files = items.sort((a, b) =>
      String(a.file_name).localeCompare(String(b.file_name))
    );
    return [...folders, ...files];
  }, [documents, foldersApiData, currentPath]);

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
      accessorKey: "updated_at",
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
          to={`/a/consulter/${encodeURIComponent(row.original.id)}/`}
          className="text-primary-"
          rel="noopener noreferrer"
        >
          <span
            role="button"
            aria-label="open"
            className="inline-flex items-center justify-center w-6 h-6 rounded bg-transparent hover:bg-muted"
          >
            <ChevronRight
              strokeWidth={1.5}
              size={20}
              className="stroke-muted-foreground/50"
            />
          </span>
        </Link>
      ),
    },
  ];

  const combinedColumns = [
    ...defaultColumns.slice(0, 2),
    ...columns,
    defaultColumns[2],
  ];

  function openNewPathDialog() {
    setNewPathValue("");
    setNewPathOpen(true);
  }

  const handleCreateFolder = async (data) => {
    try {
      await createFolder(data).unwrap();
      setNewPathOpen(false);
    } catch (err) {
      console.error("Create folder failed", err);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <DataTable
          title={currentPath ? `Path: /${currentPath}` : "Folders & files"}
          columns={combinedColumns}
          data={rows}
          onEdit={() => {}}
          onDelete={() => {}}
          onAdd={() => {}}
          pageSize={20}
          rowActions={rowActions}
          toolbarActions={
            <Button variant="outline" size="sm" onClick={openNewPathDialog}>
              New Path
            </Button>
          }
        />
      </div>

      <Dialog open={newPathOpen} onOpenChange={setNewPathOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Path</DialogTitle>
          </DialogHeader>

          <CreateFolder
            onCancel={() => setNewPathOpen(false)}
            onCreate={handleCreateFolder}
            loading={createFolderLoading}
            prefix={currentPath ? currentPath + "/" : "/"}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsulteFolders;
