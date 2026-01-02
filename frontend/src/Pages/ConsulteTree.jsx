import React from "react";
import {
  Folder,
  FileText,
  Download,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useGetDocumentsQuery } from "@/slices/documentSlice";
import { Button } from "../components/ui/button";

// utility: derive folder prefix from a document path
function getFolderFromPath(path) {
  if (!path || typeof path !== "string") return "root";
  const p = path.replace(/^\/+/, "");
  const parts = p.split("/");
  if (parts.length <= 1) return "root";
  return parts.slice(0, parts.length - 1).join("/");
}

export default function ConsulteTree() {
  const { data: documents = [], isLoading, error } = useGetDocumentsQuery();
  const [openFolders, setOpenFolders] = React.useState({});

  const minioBase = (import.meta.env?.VITE_MINIO_BASE_URL || "").replace(
    /\/$/,
    ""
  );

  // helper to make an absolute URL if the path appears relative
  const toAbsolute = React.useCallback(
    (p) => {
      if (!p || typeof p !== "string") return p;
      if (p.startsWith("http://") || p.startsWith("https://")) return p;
      if (!minioBase) return p;
      return `${minioBase.replace(/\/$/, "")}/${p.replace(/^\/+/, "")}`;
    },
    [minioBase]
  );

  // group docs by folder prefix
  const groups = React.useMemo(() => {
    const map = new Map();
    (documents || []).forEach((doc) => {
      const rawPath = doc.doc_path || doc.file || doc.url || "";
      const path = toAbsolute(rawPath);
      const folder = getFolderFromPath(path);
      if (!map.has(folder)) map.set(folder, []);
      map.get(folder).push({ ...doc, _path: path, _rawPath: rawPath });
    });
    // ensure consistent ordering
    return Array.from(map.entries()).map(([folder, items]) => ({
      folder,
      items,
    }));
  }, [documents, toAbsolute]);

  const toggle = (folder) =>
    setOpenFolders((s) => ({ ...s, [folder]: !s[folder] }));

  const openDocument = (doc) => {
    const path = doc._path || doc.doc_path || doc.file || doc.url;
    if (!path) return;
    try {
      window.open(path, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) return <div className="p-4">Loading documents...</div>;
  if (error)
    return <div className="p-4 text-destructive">Failed to load documents</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Folders</h2>
      <div className="space-y-3">
        {groups.length === 0 && (
          <div className="text-sm">No documents found.</div>
        )}
        {groups.map(({ folder, items }) => (
          <div key={folder} className="border rounded-md">
            <button
              className="w-full flex items-center justify-between px-3 py-2"
              onClick={() => toggle(folder)}
              aria-expanded={!!openFolders[folder]}
            >
              <div className="flex items-center gap-2">
                <Folder className="text-primary" />
                <span className="font-medium">
                  {folder === "root" ? "Root" : folder}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({items.length})
                </span>
              </div>
              <div>
                {openFolders[folder] ? <ChevronDown /> : <ChevronRight />}
              </div>
            </button>
            {openFolders[folder] && (
              <div className="p-2 space-y-1">
                {items.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between px-2 py-1 rounded hover:bg-muted"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText />
                      <div className="flex flex-col">
                        <span className="truncate max-w-xs">
                          {doc.doc_description || doc.file_name || doc._path}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-xs">
                          {doc._path}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDocument(doc)}
                      >
                        <Download size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
