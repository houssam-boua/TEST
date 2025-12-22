import React, { useMemo, useState } from "react";
import {
  useGetFoldersQuery,
  useGetDocumentsQuery,
  useCreateFolderMutation,
  useCreateDocumentMutation,
} from "@/Slices/documentSlice";
import { Button } from "@/components/ui/button";
import CreateFolder from "@/components/forms/create-folder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Folder,
  FileText,
  UploadCloud,
  Plus,
  MoreVertical,
  Eye,
  Trash2,
  Pencil,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import EditDocumentForm from "@/components/forms/edit-document";

function normalizePath(p) {
  if (p === undefined || p === null) return "";
  return String(p || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
}

function detectCommonPrefix(paths = []) {
  const cleaned = (paths || [])
    .map((p) =>
      String(p || "")
        .trim()
        .replace(/^\/+|\/+$/g, "")
    )
    .filter(Boolean);
  if (!cleaned.length) return null;
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
    return topSeg;
  }
  return null;
}

export default function FolderManager({ initialPath = "/", className = "" }) {
  const [currentPath, setCurrentPath] = useState(normalizePath(initialPath));
  const [createOpen, setCreateOpen] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editDocId, setEditDocId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [localFolders, setLocalFolders] = useState([]); // optimistic local-created folders (full normalized paths)

  const { data: foldersApiData = [], refetch: refetchFolders } =
    useGetFoldersQuery();
  // Always pass an explicit params object so RTK Query key includes the folder
  // even when `currentPath` is empty (root). This ensures the hook fetches
  // the correct data on mount instead of relying on a user click to trigger it.
  // Request documents for currentPath; when currentPath is empty (root)
  // pass `undefined` so the API receives no `folder` filter and returns root contents.
  const { data: documents = [], refetch: refetchDocuments } =
    useGetDocumentsQuery("/");

  const [createFolder] = useCreateFolderMutation();
  const [createDocument] = useCreateDocumentMutation();

  const folderPaths = React.useMemo(
    () =>
      Array.isArray(foldersApiData)
        ? foldersApiData
        : (foldersApiData && foldersApiData.folders) || [],
    [foldersApiData]
  );

  const commonPrefix = useMemo(
    () =>
      detectCommonPrefix(
        folderPaths.length
          ? folderPaths
          : (documents || []).map((d) => d.doc_path || d.file || "")
      ),
    [folderPaths, documents]
  );

  const { folders: immediateFolders, files: immediateFiles } = useMemo(() => {
    const folderSet = new Set();
    const fileList = [];
    const cur = normalizePath(currentPath || "");
    const curParts = cur ? cur.split("/").filter(Boolean) : [];
    const curDepth = curParts.length;

    // helper to process a path (strip common prefix if detected).
    // Do NOT strip the commonPrefix when it equals the current path's first segment,
    // otherwise a path like `Documents/child` becomes `child` and won't match when
    // the current path is `Documents` (off-by-one depth).
    const curFirst = curParts[0] || null;
    const stripPrefix = (p) => {
      if (!p) return "";
      let s = normalizePath(p);
      if (
        commonPrefix &&
        commonPrefix !== curFirst &&
        s.startsWith(commonPrefix + "/")
      ) {
        s = s.slice(commonPrefix.length + 1);
      }
      return s;
    };

    // derive folders from folderPaths when available, include local optimistic folders
    // `folderPaths` may contain objects (API returns folder objects) or strings; normalize to strings
    const sourcePaths = (
      folderPaths && folderPaths.length
        ? folderPaths.map((fp) =>
            typeof fp === "string" ? fp : fp.fol_path || fp.path || ""
          )
        : (documents || []).map((d) => d.doc_path || d.file || "")
    ).concat(localFolders || []);
    for (const raw of sourcePaths || []) {
      const p = stripPrefix(raw);
      if (!p) continue;
      const parts = p.split("/").filter(Boolean);
      if (curDepth === 0) {
        if (parts.length >= 1) folderSet.add(parts[0]);
      } else {
        if (
          parts.length > curDepth &&
          parts.slice(0, curDepth).join("/") === curParts.join("/")
        ) {
          folderSet.add(parts[curDepth]);
        }
      }
    }

    // derive immediate files from documents (only those directly under current path)
    for (const d of documents || []) {
      const raw = d.doc_path || d.file || "";
      const p = stripPrefix(raw);
      if (!p) continue;
      const parts = p.split("/").filter(Boolean);
      if (curDepth === 0) {
        if (parts.length === 1) {
          fileList.push(d);
        }
      } else {
        const prefix = curParts.join("/");
        if (p === prefix || p.startsWith(prefix + "/")) {
          const rest = p.replace(prefix + "/", "");
          if (rest && !rest.includes("/")) {
            fileList.push(d);
          }
        }
      }
    }

    return { folders: Array.from(folderSet).sort(), files: fileList };
  }, [folderPaths, documents, currentPath, commonPrefix, localFolders]);

  const breadcrumbs = useMemo(() => {
    const p = normalizePath(currentPath || "");
    if (!p) return [{ name: "/", path: "" }];
    const parts = p.split("/").filter(Boolean);
    const crumbs = [{ name: "/", path: "" }];
    let accum = "";
    for (const part of parts) {
      accum = accum ? `${accum}/${part}` : part;
      crumbs.push({ name: part, path: accum });
    }
    return crumbs;
  }, [currentPath]);

  // hide top-level 'Documents' breadcrumb (UX choice to avoid duplicate root label)
  const visibleBreadcrumbs = useMemo(() => {
    if (!Array.isArray(breadcrumbs)) return breadcrumbs;
    // remove any single top-level 'Documents' entry when root is shown as '/'
    return breadcrumbs.filter((c, idx) => {
      if (c && c.name === "Documents") {
        // if it's the only non-root crumb and root exists, hide it
        const nonRoot = breadcrumbs.filter((b) => b.name !== "/");
        if (nonRoot.length === 1 && nonRoot[0].name === "Documents")
          return false;
      }
      return true;
    });
  }, [breadcrumbs]);

  const tableRows = useMemo(() => {
    const rows = [];
    for (const name of immediateFolders) {
      const path = currentPath ? `${currentPath}/${name}` : name;
      // attempt to resolve a full folder object from API data if available
      let folderObj = null;
      if (Array.isArray(folderPaths) && folderPaths.length) {
        folderObj =
          folderPaths.find((fp) => {
            if (!fp) return false;
            // fp may be a string path or an object
            if (typeof fp === "string")
              return (
                fp.replace(/^\/+|\/+$/g, "") === path.replace(/^\/+|\/+$/g, "")
              );
            const fpPath = (fp.fol_path || fp.path || "").replace(
              /^\/+|\/+$/g,
              ""
            );
            return (
              fpPath === path.replace(/^\/+|\/+$/g, "") || fp.fol_name === name
            );
          }) || null;
      }
      rows.push({
        id: folderObj?.id ?? `folder:${path}`,
        fol_name: folderObj?.fol_name ?? name,
        fol_path: folderObj?.fol_path ?? path,
        fol_index: folderObj?.fol_index ?? "",
        parent_folder: folderObj?.parent_folder ?? null,
        isFolder: true,
        raw: folderObj,
      });
    }
    for (const f of immediateFiles) {
      rows.push({
        id: f.id ?? `file:${f.doc_path}`,
        fol_name:
          f.file_name || f.doc_title || (f.doc_path || "").split("/").pop(),
        fol_path: f.doc_path || f.file || "",
        fol_index: f.doc_code || f.doc_number || f.doc_index || "",
        parent_folder: null,
        isFolder: false,
        file: f,
      });
    }
    return rows;
  }, [immediateFolders, immediateFiles, currentPath]);

  // create file form state
  const [newFileName, setNewFileName] = useState("");
  const [newFileObj, setNewFileObj] = useState(null);

  async function handleSubmitNewFile(e) {
    e && e.preventDefault && e.preventDefault();
    if (!newFileObj) {
      alert("Please choose a file");
      return;
    }
    const fd = new FormData();
    fd.append("file", newFileObj, newFileObj.name);
    const docPath = normalizePath(currentPath || "");
    if (docPath) fd.append("doc_path", docPath);
    if (newFileName) fd.append("doc_title", newFileName);
    try {
      await createDocument(fd).unwrap();
      await Promise.all([refetchDocuments?.(), refetchFolders?.()]);
      setShowNewDialog(false);
      setNewFileName("");
      setNewFileObj(null);
    } catch (err) {
      console.error("create document failed", err);
      alert("Failed to create file");
    }
  }

  // Share action removed; use `handleRowEdit` for editing instead.

  async function handleCreateFolder(payload) {
    // payload expected from CreateFolder: { fol_name, fol_path, fol_index, parent_folder, created_by, combined_path }
    try {
      console.debug("CreateFolder payload:", payload);
      // build request body for folders API
      const fol_name = payload.fol_name || payload.path || payload.name || "";
      const fol_path =
        (payload.fol_path && String(payload.fol_path).trim()) ||
        (payload.combined_path && String(payload.combined_path).trim()) ||
        (currentPath ? `${currentPath}/${fol_name}` : fol_name);
      // determine parent_folder id from the currentPath when available
      const normalizedCurrent = normalizePath(currentPath || "");
      let parentId = null;
      if (normalizedCurrent) {
        if (Array.isArray(folderPaths) && folderPaths.length) {
          const match = folderPaths.find((fp) => {
            if (!fp) return false;
            if (typeof fp === "string")
              return normalizePath(fp) === normalizedCurrent;
            const fpPath = normalizePath(fp.fol_path || fp.path || "");
            return fpPath === normalizedCurrent;
          });
          if (match && typeof match !== "string") parentId = match.id ?? null;
        }
      }

      const body = {
        fol_name,
        fol_path: String(fol_path).replace(/^\/+|\/+$/g, ""),
        fol_index: payload.fol_index || null,
        parent_folder: payload.parent_folder ?? parentId ?? null,
      };

      const resp = await createFolder(body).unwrap();
      console.debug("CreateFolder response:", resp);
      // compute expected key first and add optimistic local folder so UI shows it immediately
      const expectedKey = String(body.fol_path || "")
        .trim()
        .replace(/^\/+|\/+$/g, "");
      const expectedLeaf = expectedKey.split("/").filter(Boolean).pop();
      setLocalFolders((prev) =>
        prev.includes(expectedKey) ? prev : [...prev, expectedKey]
      );

      // Try a few refetches (sometimes S3/MinIO list is eventually consistent)
      let found = false;
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const r1 = await refetchFolders();
          const data = (r1 && r1.data) || folderPaths || [];
          const cleaned = (
            Array.isArray(data) ? data : (data && data.folders) || []
          ).map((p) =>
            String(p || "")
              .trim()
              .replace(/^\/+|\/+$/g, "")
          );
          if (
            cleaned.includes(expectedKey) ||
            cleaned.some((p) => p.split("/").pop() === expectedLeaf)
          ) {
            found = true;
            break;
          }
        } catch (e) {
          console.debug("refetch attempt failed", attempt, e);
        }
        // wait briefly before retrying
        await new Promise((res) => setTimeout(res, 500));
      }

      // also refresh documents list
      try {
        await Promise.all([refetchFolders(), refetchDocuments()]);
      } catch (e) {
        console.debug("refetch documents failed", e);
      }

      setCreateOpen(false);
      if (found) {
        // remove optimistic entry once server confirms presence
        setLocalFolders((prev) => prev.filter((p) => p !== expectedKey));
      } else {
        console.debug(
          "Created folder not found in list after retries",
          expectedKey
        );
      }
    } catch (err) {
      console.error("create folder failed", err);
      alert("Failed to create folder");
    }
  }

  // ensure we fetch folders/documents on mount so root loads immediately
  React.useEffect(() => {
    try {
      refetchFolders();
    } catch (e) {
      /* ignore */
    }
    try {
      refetchDocuments();
    } catch (e) {
      /* ignore */
    }
  }, []);

  async function handleUploadFiles(files) {
    if (!files || !files.length) return;
    setUploading(true);
    const tasks = Array.from(files).map(async (f) => {
      const fd = new FormData();
      fd.append("file", f, f.name);
      const docPath = normalizePath(currentPath || "");
      if (docPath) fd.append("doc_path", docPath);
      try {
        await createDocument(fd).unwrap();
      } catch (err) {
        console.error("upload failed", err);
      }
    });
    await Promise.allSettled(tasks);
    setUploading(false);
    try {
      await Promise.all([refetchDocuments?.(), refetchFolders?.()]);
    } catch (e) {
      console.debug("refetch after upload failed", e);
    }
  }

  // row action handlers (basic implementations)
  const navigate = useNavigate();
  function handleRowEdit(r) {
    if (r.isFolder) {
      // For folder edit, open create modal prefilled? For now prompt rename placeholder
      const newName = window.prompt("Rename folder", r.name);
      if (newName && newName !== r.name) {
        console.log("rename folder", r.path, "->", newName);
        // TODO: call rename API
      }
    } else {
      // open edit modal for document
      const id = r.file?.id;
      if (id) {
        setEditDocId(id);
        setEditOpen(true);
      } else {
        console.log("edit file", r.file);
      }
    }
  }

  function handleRowDelete(r) {
    if (
      !window.confirm(`Delete ${r.isFolder ? "folder" : "file"} '${r.name}'?`)
    )
      return;
    console.log("delete", r);
    // TODO: call delete API then refetch
  }

  function handleRowPreview(r) {
    if (r.isFolder) {
      setCurrentPath(r.path);
    } else {
      const url = r.file.url || r.file.file;
      if (url) window.open(url, "_blank", "noopener noreferrer");
      else console.log("no preview url", r.file);
    }
  }

  function RowActions({ r }) {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative inline-block text-left">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((s) => !s);
          }}
          className="p-1 rounded hover:bg-muted/20"
          aria-haspopup="true"
          aria-expanded={open}
        >
          <MoreVertical size={16} />
        </button>
        {open && (
          <div
            className="absolute right-0 mt-2 w-40 bg-popover border rounded shadow z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="py-1">
              <li>
                <button
                  className="w-full text-left px-3 py-2 hover:bg-muted/10 flex items-center gap-2"
                  onClick={() => {
                    setOpen(false);
                    handleRowPreview(r);
                  }}
                >
                  <Eye size={14} /> Preview
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left px-3 py-2 hover:bg-muted/10 flex items-center gap-2"
                  onClick={() => {
                    setOpen(false);
                    handleRowEdit(r);
                  }}
                >
                  <Pencil size={14} /> Edit
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                  onClick={() => {
                    setOpen(false);
                    handleRowDelete(r);
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Top toolbar: breadcrumbs + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            {visibleBreadcrumbs.map((c, i) => (
              <span
                key={c.path || i}
                className="inline-flex items-center gap-2"
              >
                <button
                  type="button"
                  className={`px-2 py-1 rounded text-sm hover:underline ${
                    c.path === currentPath
                      ? "bg-muted/30 text-primary font-medium"
                      : ""
                  }`}
                  onClick={() => setCurrentPath(c.path)}
                >
                  {c.name}
                </button>
                {i < visibleBreadcrumbs.length - 1 && (
                  <span className="text-muted-foreground/60">/</span>
                )}
              </span>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-2" size={14} /> New Folder
          </Button>

          <label className="m-0">
            <input
              type="file"
              multiple
              onChange={(e) => handleUploadFiles(e.target.files)}
              style={{ display: "none" }}
            />
            <Button size="sm">
              <UploadCloud className="mr-2" size={14} />
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </label>
        </div>
      </div>

      {/* Main area: single table with folders and files */}
      <div className="bg-card rounded shadow-sm overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm min-w-full">
            <thead className="bg-muted/10 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left w-1/6">ID</th>
                <th className="px-4 py-3 text-left w-1/3">Name</th>
                <th className="px-4 py-3 text-left w-1/4">Path</th>
                <th className="px-4 py-3 text-left w-1/6">Index</th>
                <th className="px-4 py-3 text-left w-1/6">Parent</th>
                <th className="px-4 py-3 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tableRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No folders or files in this path. Use New Folder or Upload
                    to get started.
                  </td>
                </tr>
              ) : (
                tableRows.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/5">
                    <td className="px-4 py-3 text-sm">{r.id}</td>
                    <td className="px-4 py-3">
                      {r.isFolder ? (
                        <button
                          onClick={() => setCurrentPath(r.fol_path)}
                          className="flex items-center gap-3 w-full text-left"
                        >
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded text-primary">
                            <Folder size={16} />
                          </span>
                          <div>
                            <div className="font-medium">{r.fol_name}</div>
                          </div>
                        </button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-primary/10 text-primary">
                            <FileText size={16} />
                          </span>
                          <div>
                            <a
                              href={r.file?.url || r.file?.file || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium"
                            >
                              {r.fol_name}
                            </a>
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 text-sm">{r.fol_path}</td>
                    <td className="px-4 py-3 text-sm">{r.fol_index || ""}</td>
                    <td className="px-4 py-3 text-sm">
                      {r.parent_folder ?? "-"}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-1 rounded hover:bg-muted/20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>
                            {r.isFolder ? "Folder" : "File"}
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              if (r.isFolder) setCreateOpen(true);
                              else setShowNewDialog(true);
                            }}
                          >
                            New
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowEdit(r);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
          </DialogHeader>
          <CreateFolder
            prefix={currentPath ? `${currentPath}/` : "/"}
            onCreate={handleCreateFolder}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(v) => {
          setEditOpen(v);
          if (!v) setEditDocId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          {editDocId && (
            <EditDocumentForm
              documentId={editDocId}
              onClose={() => {
                setEditOpen(false);
                setEditDocId(null);
                try {
                  refetchDocuments();
                } catch (e) {
                  /* ignore */
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitNewFile}>
            <FieldGroup>
              <FieldLabel>File name (optional)</FieldLabel>
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Document title"
              />

              <FieldLabel>File</FieldLabel>
              <input
                type="file"
                onChange={(e) => setNewFileObj(e.target.files?.[0] || null)}
              />
            </FieldGroup>
            <DialogFooter>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowNewDialog(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Share dialog removed */}
    </div>
  );
}
