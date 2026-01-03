"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  useGetFoldersQuery,
  useGetDocumentsQuery,
  useCreateFolderMutation,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useUpdateFolderMutation,
  useArchiveDocumentMutation,
  useArchiveFolderMutation,
  useDeleteDocumentMutation,
  useSyncFoldersMutation // ✅ NEW: Import Sync Hook
} from "@/slices/documentSlice";

import { Button } from "@/components/ui/button";
import CreateFolder from "@/components/forms/create-folder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Folder,
  FileText,
  UploadCloud,
  Plus,
  MoreVertical,
  Eye,
  Pencil,
  History,
  Archive,
  ChevronRight,
  Home,
  User,
  Calendar,
  Info,
  Move,
  X,
  FolderOpen,
  RefreshCw // ✅ NEW: Import Refresh Icon
} from "lucide-react";
import { toast } from "sonner";

import EditDocumentForm from "@/components/forms/edit-document";
import DocumentHistoryDialog from "@/components/DocumentHistoryDialog";
import ArchiveDocumentDialog from "@/components/ArchiveDocumentDialog";
import ArchiveFolderDialog from "@/components/ArchiveFolderDialog";

// --- Helpers ---
function normalizePath(p) {
  if (p === undefined || p === null) return "";
  return String(p || "").trim().replace(/^\/+|\/+$/g, "");
}

function formatFolderIndexLabel(code) {
  const v = String(code || "").trim().toUpperCase();
  if (v === "PR") return "private";
  if (v === "GD") return "public";
  return code || "";
}

function normalizeFolderIndex(rawIndex) {
  let fol_index = rawIndex == null || rawIndex === "" ? null : String(rawIndex).trim();
  const key = (fol_index || "").toLowerCase();
  if (key === "private" || key === "privet" || key === "prive" || key === "privée" || key === "privee") return { value: "PR", error: null };
  if (key === "public" || key === "general" || key === "général" || key === "publique") return { value: "GD", error: null };
  if (fol_index && fol_index.length > 5) return { value: null, error: `Folder type invalid: "${fol_index}"` };
  return { value: fol_index, error: null };
}

function formatDateTime(val) {
  if (!val) return "-";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric", 
    hour: "2-digit", minute: "2-digit"
  }).format(d);
}

// Keep strictly for history dialogs if needed, but NOT for main table
function getLatestVersionPath(doc) {
  if (!doc) return "";
  const vs = doc.versions || [];
  if (Array.isArray(vs) && vs.length > 0) {
    const sorted = [...vs].sort((a, b) => (b.version_number || 0) - (a.version_number || 0));
    return sorted[0]?.version_path || doc.doc_path || "";
  }
  return doc.doc_path || "";
}

function getFolderNameFromPayload(payload) {
  return payload?.fol_name || payload?.folname || payload?.name || "";
}

function getFolderPathFromPayload({ payload, currentPath, folderName }) {
  const raw = payload?.fol_path || "";
  if (raw) return normalizePath(raw);
  return normalizePath(currentPath ? `${currentPath}/${folderName}` : folderName);
}

// --- Bulk Action Dialogs ---

function BulkMoveDialog({ open, onOpenChange, selectedItems, allFolders, currentFolderId, onMoveSuccess }) {
  const [targetFolder, setTargetFolder] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [updateDoc] = useUpdateDocumentMutation();
  const [updateFolder] = useUpdateFolderMutation();

  const availableTargets = useMemo(() => {
    // Filter out: 
    // 1. The selected items themselves (can't move folder into itself)
    // 2. The current folder (can't move items to where they already are)
    const movingIds = new Set(selectedItems.filter(i => i.type === "folder").map(i => i.id));
    return allFolders.filter(f => !movingIds.has(f.id) && f.id !== currentFolderId);
  }, [allFolders, selectedItems, currentFolderId]);

  const handleMove = async () => {
    setIsMoving(true);
    let errors = 0;
    try {
      const targetId = targetFolder === "root" ? null : targetFolder;
      
      const promises = selectedItems.map(item => {
        if (item.type === "folder") {
          // Safety: Can't move virtual folders (ID is string)
          if (typeof item.id !== 'number') return Promise.resolve(); 
          if (item.id === targetId) return Promise.resolve();
          return updateFolder({ id: item.id, data: { parent_folder: targetId } }).unwrap();
        } else {
          return updateDoc({ id: item.id, data: { parent_folder: targetId } }).unwrap();
        }
      });

      await Promise.allSettled(promises).then(results => {
        results.forEach(res => { if (res.status === 'rejected') errors++; });
      });

      if (errors > 0) toast.warning(`Moved with ${errors} errors.`);
      else toast.success("Items moved successfully.");
      
      onMoveSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Bulk move failed.");
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Move {selectedItems.length} items to...</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto min-h-[300px] border rounded-md p-2">
          <div 
            className={`p-2 rounded cursor-pointer flex items-center gap-2 ${targetFolder === "root" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
            onClick={() => setTargetFolder("root")}
          >
            <Home size={16} /> <span>Root Directory</span>
          </div>
          {availableTargets.map(folder => (
            <div 
              key={folder.id} 
              className={`p-2 ml-4 rounded cursor-pointer flex items-center gap-2 truncate ${targetFolder === folder.id ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
              onClick={() => setTargetFolder(folder.id)}
            >
              <Folder size={16} /> 
              <span>{folder.fol_name}</span>
              <span className="text-xs text-muted-foreground ml-auto max-w-[150px] truncate">{folder.fol_path}</span>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleMove} disabled={!targetFolder || isMoving}>
            {isMoving ? "Moving..." : "Move Here"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BulkArchiveDialog({ open, onOpenChange, selectedItems, onArchiveSuccess }) {
  const [mode, setMode] = useState("permanent");
  const [until, setUntil] = useState("");
  const [note, setNote] = useState("");
  const [isArchiving, setIsArchiving] = useState(false);

  const [archiveDoc] = useArchiveDocumentMutation();
  const [archiveFolder] = useArchiveFolderMutation();

  const handleArchive = async () => {
    setIsArchiving(true);
    const isoUntil = mode === "until" && until ? new Date(until).toISOString() : null;
    let errors = 0;

    const promises = selectedItems.map(item => {
      // Skip virtual items
      if (item.type === "folder" && typeof item.id !== "number") return Promise.resolve();

      const payload = { id: item.id, mode, until: isoUntil, note };
      if (item.type === "folder") return archiveFolder(payload).unwrap();
      return archiveDoc(payload).unwrap();
    });

    await Promise.allSettled(promises).then(results => {
        results.forEach(res => { if (res.status === 'rejected') errors++; });
    });

    setIsArchiving(false);
    if (errors === 0) {
      toast.success("Archived successfully.");
      onArchiveSuccess();
      onOpenChange(false);
    } else {
      toast.warning(`${errors} items failed to archive.`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Archive {selectedItems.length} items</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" checked={mode==="permanent"} onChange={()=>setMode("permanent")} className="accent-primary" /> Permanent
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" checked={mode==="until"} onChange={()=>setMode("until")} className="accent-primary" /> Temporarily (Until date)
            </label>
          </div>
          {mode === "until" && <Input type="datetime-local" value={until} onChange={e=>setUntil(e.target.value)} />}
          <Input placeholder="Archive Note..." value={note} onChange={e=>setNote(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleArchive} disabled={isArchiving}>{isArchiving ? "Archiving..." : "Confirm"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Component ---

export default function FolderManager({ initialPath = "/", className = "" }) {
  const [currentPath, setCurrentPath] = useState(normalizePath(initialPath));
  const [selectedItems, setSelectedItems] = useState({});

  // Dialog States
  const [createOpen, setCreateOpen] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editDocId, setEditDocId] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyDocId, setHistoryDocId] = useState(null);
  const [archiveDocOpen, setArchiveDocOpen] = useState(false);
  const [archiveDocId, setArchiveDocId] = useState(null);
  const [archiveFolderOpen, setArchiveFolderOpen] = useState(false);
  const [archiveFolderObj, setArchiveFolderObj] = useState(null);

  const [bulkMoveOpen, setBulkMoveOpen] = useState(false);
  const [bulkArchiveOpen, setBulkArchiveOpen] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [localFolders, setLocalFolders] = useState([]); 

  const { data: foldersApiData = [], refetch: refetchFolders } = useGetFoldersQuery();
  const { data: documents = [], refetch: refetchDocuments } = useGetDocumentsQuery(
    currentPath ? { folder: currentPath } : undefined
  );

  const [createFolder] = useCreateFolderMutation();
  const [createDocument] = useCreateDocumentMutation();
  const [syncFolders, { isLoading: isSyncing }] = useSyncFoldersMutation(); // ✅ Sync Hook

  // ✅ AUTO-SYNC ON MOUNT/REFRESH
  const hasSyncedRef = useRef(false);
  useEffect(() => {
    if (!hasSyncedRef.current) {
      syncFolders()
        .unwrap()
        .then((res) => {
          if (res.deleted_ghost_folders > 0) {
            console.log(`Synced: Removed ${res.deleted_ghost_folders} ghost folders.`);
            refetchFolders(); // Refresh list after sync
          }
        })
        .catch(err => console.error("Sync failed", err));
      hasSyncedRef.current = true;
    }
  }, [syncFolders, refetchFolders]);

  const folderPaths = useMemo(() => {
    if (Array.isArray(foldersApiData)) return foldersApiData;
    if (Array.isArray(foldersApiData?.results)) return foldersApiData.results;
    if (Array.isArray(foldersApiData?.folders)) return foldersApiData.folders;
    return [];
  }, [foldersApiData]);

  const currentFolderObj = useMemo(() => {
    return folderPaths.find(fp => {
      const p = typeof fp === "string" ? normalizePath(fp) : normalizePath(fp.fol_path);
      return p === currentPath || p === `Documents/${currentPath}` || p === `documents/${currentPath}`;
    });
  }, [folderPaths, currentPath]);

  const _autoFixedRef = useRef(false);
  useEffect(() => {
    if (_autoFixedRef.current) return;
    if (folderPaths.length > 0 || documents.length > 0) {
      const cur = normalizePath(currentPath);
      let candidate = cur;
      if (candidate.toLowerCase() === "documents") candidate = "";
      else if (candidate.toLowerCase().startsWith("documents/")) candidate = candidate.slice("documents/".length);
      if (candidate !== cur) setCurrentPath(candidate);
      _autoFixedRef.current = true;
    }
  }, [folderPaths, documents, currentPath]);

  const { folders: immediateFolders, files: immediateFiles } = useMemo(() => {
    const folderSet = new Set();
    const fileList = [];
    const cur = normalizePath(currentPath || "");
    const curParts = cur ? cur.split("/").filter(Boolean) : [];
    const curDepth = curParts.length;

    const sourcePaths = (
      folderPaths.map((fp) => typeof fp === "string" ? fp : fp.fol_path || "")
    ).concat(localFolders);

    for (const raw of sourcePaths) {
      const p = normalizePath(raw);
      if (!p) continue;
      
      let effectivePath = p;
      if (effectivePath.toLowerCase().startsWith("documents/") && cur === "") {
         effectivePath = effectivePath.substring("documents/".length);
      } else if (effectivePath.toLowerCase() === "documents" && cur === "") {
         continue; 
      }

      const parts = effectivePath.split("/").filter(Boolean);
      
      if (curDepth === 0) {
        if (parts.length >= 1) folderSet.add(parts[0]);
      } else {
        const prefix = curParts.join("/");
        if (effectivePath.startsWith(prefix + "/") || effectivePath === prefix) {
           const relative = effectivePath.slice(prefix.length).replace(/^\//, "");
           const relativeParts = relative.split("/").filter(Boolean);
           if (relativeParts.length > 0) folderSet.add(relativeParts[0]);
        }
      }
    }

    for (const d of documents) {
      // ✅ Use doc_path directly and strip optional prefix if needed
      let p = normalizePath(d.doc_path || "");
      if (p.toLowerCase().startsWith("documents/") && cur === "") {
         p = p.substring("documents/".length);
      }
      const parts = p.split("/").filter(Boolean);
      if (curDepth === 0) {
        if (parts.length === 1) fileList.push(d);
      } else {
        const prefix = curParts.join("/");
        if (p.startsWith(prefix + "/")) {
          const rest = p.replace(prefix + "/", "");
          if (rest && !rest.includes("/")) fileList.push(d);
        }
      }
    }

    return { folders: Array.from(folderSet).sort(), files: fileList };
  }, [folderPaths, documents, currentPath, localFolders]);

  const breadcrumbs = useMemo(() => {
    const parts = normalizePath(currentPath).split("/").filter(Boolean);
    const crumbs = [{ name: "Root", path: "" }];
    let accum = "";
    parts.forEach(part => {
      accum = accum ? `${accum}/${part}` : part;
      crumbs.push({ name: part, path: accum });
    });
    return crumbs;
  }, [currentPath]);

  const tableRows = useMemo(() => {
    const rows = [];

    immediateFolders.forEach(name => {
      const path = currentPath ? `${currentPath}/${name}` : name;
      let folderObj = folderPaths.find(fp => {
         const p = typeof fp === "string" ? normalizePath(fp) : normalizePath(fp.fol_path);
         return p === path || p === `Documents/${path}` || p === `documents/${path}`;
      });

      rows.push({
        id: folderObj?.id ?? `folder:${path}`,
        name: name,
        path: path,
        type: "folder",
        index: folderObj?.fol_index ?? "",
        owner: folderObj?.created_by?.username || "-",
        date: folderObj?.created_at,
        raw: folderObj
      });
    });

    immediateFiles.forEach(f => {
      rows.push({
        id: f.id,
        name: f.doc_title,
        // ✅ CHANGED: Use doc_path directly (Live path) instead of version path
        path: f.doc_path, 
        type: "file",
        index: f.doc_code || "",
        owner: f.doc_owner?.username || "-",
        date: f.created_at,
        status: f.doc_status_type || "ORIGINAL",
        description: f.doc_description || "",
        downloadUrl: f.download_url,
        raw: f
      });
    });

    return rows;
  }, [immediateFolders, immediateFiles, currentPath, folderPaths]);

  const toggleSelectAll = () => {
    if (Object.keys(selectedItems).length === tableRows.length) {
      setSelectedItems({});
    } else {
      const newSel = {};
      tableRows.forEach(r => { newSel[r.id] = r; });
      setSelectedItems(newSel);
    }
  };

  const toggleSelectRow = (row) => {
    setSelectedItems(prev => {
      const next = { ...prev };
      if (next[row.id]) delete next[row.id];
      else next[row.id] = row;
      return next;
    });
  };

  const handleNavigate = (path) => {
    setCurrentPath(path);
    setSelectedItems({});
  };

  const handleCreateFolderAction = async (payload) => {
    const folderName = getFolderNameFromPayload(payload);
    if (!folderName) return toast.error("Folder name required");
    const fol_path = getFolderPathFromPayload({ payload, currentPath, folderName });
    const { value: fol_index, error: indexErr } = normalizeFolderIndex(payload?.fol_index || "GD");
    
    if (indexErr) return toast.error(indexErr);
    
    let parentId = null;
    if (currentPath) {
      const parentObj = folderPaths.find(fp => {
        const p = typeof fp === "string" ? normalizePath(fp) : normalizePath(fp.fol_path);
        return p === currentPath || p === `Documents/${currentPath}` || p === `documents/${currentPath}`;
      });
      if (parentObj && typeof parentObj !== "string") parentId = parentObj.id;
    }

    try {
      await createFolder({
        fol_name: folderName,
        fol_path: fol_path,
        fol_index: fol_index,
        parent_folder: parentId
      }).unwrap();

      setLocalFolders(prev => [...prev, normalizePath(fol_path)]);
      setTimeout(() => { refetchFolders(); refetchDocuments(); }, 500);
      setCreateOpen(false);
      toast.success("Folder created");
    } catch (err) {
      const msg = err?.data?.fol_name?.[0] || err?.data?.detail || "Failed to create folder";
      toast.error(msg);
    }
  };

  const handleUploadFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const tasks = Array.from(files).map(f => {
      const fd = new FormData();
      fd.append("file", f, f.name);
      // ✅ Pass current path context so backend knows where to save
      if (currentPath) fd.append("doc_path", currentPath);
      
      // Also try to find parent ID for reference
      let parentId = null;
      if (currentPath) {
        const parentObj = folderPaths.find(fp => {
            const p = typeof fp === "string" ? normalizePath(fp) : normalizePath(fp.fol_path);
            return p === currentPath || p === `Documents/${currentPath}` || p === `documents/${currentPath}`;
        });
        if (parentObj && typeof parentObj !== 'string') parentId = parentObj.id;
      }
      if (parentId) fd.append("parent_folder", parentId);

      return createDocument(fd).unwrap().catch(console.error);
    });
    await Promise.allSettled(tasks);
    setUploading(false);
    refetchDocuments();
    toast.success("Files uploaded");
  };

  const selectedList = Object.values(selectedItems);
  const [newFileName, setNewFileName] = useState("");
  const [newFileObj, setNewFileObj] = useState(null);

  const handleSubmitNewFile = async (e) => {
    e?.preventDefault();
    if (!newFileObj) return toast.error("Please choose a file");
    const fd = new FormData();
    fd.append("file", newFileObj, newFileObj.name);
    if (currentPath) fd.append("doc_path", currentPath);
    if (newFileName) fd.append("doc_title", newFileName);
    
    // Find parent ID logic (same as bulk upload)
    let parentId = null;
    if (currentPath) {
        const parentObj = folderPaths.find(fp => {
            const p = typeof fp === "string" ? normalizePath(fp) : normalizePath(fp.fol_path);
            return p === currentPath || p === `Documents/${currentPath}` || p === `documents/${currentPath}`;
        });
        if (parentObj && typeof parentObj !== 'string') parentId = parentObj.id;
    }
    if (parentId) fd.append("parent_folder", parentId);

    try {
      await createDocument(fd).unwrap();
      await Promise.all([refetchDocuments(), refetchFolders()]);
      setShowNewDialog(false);
      setNewFileName("");
      setNewFileObj(null);
      toast.success("File uploaded");
    } catch (err) {
      toast.error("Failed to upload file");
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className} h-full`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 bg-card p-3 rounded-lg border shadow-sm">
        {selectedList.length > 0 ? (
          <div className="flex items-center gap-2 w-full animate-in fade-in slide-in-from-top-1 duration-200">
            <span className="text-sm font-medium text-primary mr-2 bg-primary/10 px-2 py-1 rounded">
              {selectedList.length} selected
            </span>
            <div className="h-6 w-px bg-border mx-1" />
            <Button variant="outline" size="sm" onClick={() => setBulkMoveOpen(true)}>
              <Move size={14} className="mr-2" /> Move To...
            </Button>
            <Button variant="outline" size="sm" onClick={() => setBulkArchiveOpen(true)}>
              <Archive size={14} className="mr-2" /> Archive
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" size="icon" onClick={() => setSelectedItems({})}>
              <X size={16} />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold tracking-tight">Folder Management</h1>
              {/* ✅ NEW: Sync Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                disabled={isSyncing} 
                onClick={() => syncFolders().then(() => { refetchFolders(); refetchDocuments(); })}
                title="Sync with S3"
              >
                <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2" size={14} /> New Folder
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/archived-documents">
                  <Archive className="mr-2" size={14} /> Archives
                </Link>
              </Button>
              <label className="m-0">
                <input type="file" multiple onChange={(e) => handleUploadFiles(e.target.files)} style={{ display: "none" }} />
                <Button size="sm" disabled={uploading}>
                  <UploadCloud className="mr-2" size={14} /> {uploading ? "Uploading..." : "Upload"}
                </Button>
              </label>
            </div>
          </>
        )}
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/40 p-2 rounded-md border">
        <button 
          onClick={() => handleNavigate("")} 
          className={`flex items-center px-2 py-1 rounded hover:bg-background transition-colors ${!currentPath ? "font-bold text-foreground bg-background shadow-sm" : "hover:text-primary"}`}
        >
          <Home className="w-4 h-4 mr-2" /> Root
        </button>
        {breadcrumbs.slice(1).map((crumb, i) => (
          <React.Fragment key={crumb.path}>
            <ChevronRight className="w-4 h-4 opacity-40" />
            <button
              onClick={() => handleNavigate(crumb.path)}
              className={`flex items-center px-2 py-1 rounded hover:bg-background transition-colors max-w-[150px] truncate ${
                crumb.path === currentPath ? "font-bold text-foreground bg-background shadow-sm" : "hover:text-primary"
              }`}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Table Content */}
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden flex-1 min-h-[500px]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={tableRows.length > 0 && selectedList.length === tableRows.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead className="min-w-[200px]">Name</TableHead>
                <TableHead className="min-w-[120px]">Path</TableHead> {/* Renamed Header for clarity */}
                <TableHead className="min-w-[120px]"><div className="flex items-center gap-1"><Info className="w-3 h-3" /> Index</div></TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[200px]">Description</TableHead>
                <TableHead className="min-w-[120px]"><div className="flex items-center gap-1"><User className="w-3 h-3" /> Owner</div></TableHead>
                <TableHead className="min-w-[120px]"><div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</div></TableHead>
                <TableHead className="text-right w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-40 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FolderOpen className="w-10 h-10 opacity-20" />
                      <p>This folder is empty.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tableRows.map((row) => (
                  <TableRow 
                    key={row.id} 
                    className={`group transition-colors ${row.type === "folder" ? "hover:bg-muted/40 cursor-pointer" : "hover:bg-muted/30"} ${selectedItems[row.id] ? "bg-muted/60" : ""}`}
                    onDoubleClick={() => row.type === "folder" && handleNavigate(row.path)}
                    onClick={(e) => {
                      if(e.ctrlKey || e.metaKey) toggleSelectRow(row);
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={!!selectedItems[row.id]} 
                        onCheckedChange={() => toggleSelectRow(row)} 
                      />
                    </TableCell>
                    <TableCell>
                      {row.type === "folder" ? <Folder className="w-5 h-5 text-amber-500 fill-amber-500/20" /> : <FileText className="w-5 h-5 text-blue-500" />}
                    </TableCell>
                    <TableCell className="font-medium">
                      {row.type === "folder" ? (
                        <button onClick={() => handleNavigate(row.path)} className="hover:underline text-left text-foreground">
                          {row.name}
                        </button>
                      ) : (
                        <span className="text-sm text-foreground">{row.name}</span>
                      )}
                    </TableCell>
                    {/* ✅ NEW: Display clean path column */}
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]" title={row.path}>
                         {row.path}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.type === "folder" ? formatFolderIndexLabel(row.index) : row.index}</TableCell>
                    <TableCell>{row.type === "file" && <Badge variant="outline" className="text-[10px] h-5 font-normal">{row.status}</Badge>}</TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]" title={row.description}>{row.description || "-"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.owner}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(row.date)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {row.type === "file" && (
                          <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); setHistoryDocId(row.id); setHistoryOpen(true); }} title="History">
                            <History className="w-4 h-4" />
                          </button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"><MoreVertical className="w-4 h-4" /></button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {row.type === "file" && (
                              <>
                                <DropdownMenuItem onClick={() => { if (row.downloadUrl) window.open(row.downloadUrl, "_blank"); }}><Eye className="w-3.5 h-3.5 mr-2" /> Preview</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setEditDocId(row.id); setEditOpen(true); }}><Pencil className="w-3.5 h-3.5 mr-2" /> Edit</DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem className="text-orange-600 focus:text-orange-700 focus:bg-orange-50" onClick={() => { if (row.type === "folder") { setArchiveFolderObj(row.raw); setArchiveFolderOpen(true); } else { setArchiveDocId(row.id); setArchiveDocOpen(true); } }}>
                              <Archive className="w-3.5 h-3.5 mr-2" /> Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* --- Bulk Dialogs --- */}
      <BulkMoveDialog 
        open={bulkMoveOpen} 
        onOpenChange={setBulkMoveOpen} 
        selectedItems={selectedList} 
        allFolders={folderPaths} 
        currentFolderId={currentFolderObj?.id}
        onMoveSuccess={() => { setSelectedItems({}); refetchFolders(); refetchDocuments(); }} 
      />

      <BulkArchiveDialog 
        open={bulkArchiveOpen} 
        onOpenChange={setBulkArchiveOpen} 
        selectedItems={selectedList}
        onArchiveSuccess={() => { setSelectedItems({}); refetchFolders(); refetchDocuments(); }} 
      />

      {/* --- Standard Dialogs --- */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent><DialogHeader><DialogTitle>Create Folder</DialogTitle></DialogHeader><CreateFolder prefix={currentPath ? `${currentPath}/` : "/"} onCreate={handleCreateFolderAction} onCancel={() => setCreateOpen(false)} /></DialogContent>
      </Dialog>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent><DialogHeader><DialogTitle>Upload New File</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmitNewFile}>
            <FieldGroup><FieldLabel>Title</FieldLabel><Input value={newFileName} onChange={e=>setNewFileName(e.target.value)} placeholder="File title" /><FieldLabel>File</FieldLabel><input type="file" onChange={e=>setNewFileObj(e.target.files?.[0])} className="text-sm" /></FieldGroup>
            <DialogFooter><Button variant="ghost" onClick={()=>setShowNewDialog(false)}>Cancel</Button><Button type="submit">Upload</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if(!v) setEditDocId(null); }}>
        <DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>Edit Document</DialogTitle></DialogHeader>{editDocId && <EditDocumentForm documentId={editDocId} onClose={() => { setEditOpen(false); setEditDocId(null); refetchDocuments(); }} />}</DialogContent>
      </Dialog>

      <DocumentHistoryDialog open={historyOpen} documentId={historyDocId} onOpenChange={(v) => { setHistoryOpen(v); if(!v) setHistoryDocId(null); }} />
      <ArchiveDocumentDialog open={archiveDocOpen} documentId={archiveDocId} onOpenChange={(v) => { setArchiveDocOpen(v); if(!v) { setArchiveDocId(null); refetchDocuments(); } }} />
      <ArchiveFolderDialog open={archiveFolderOpen} folder={archiveFolderObj} onOpenChange={(v) => { setArchiveFolderOpen(v); if(!v) { setArchiveFolderObj(null); refetchFolders(); refetchDocuments(); } }} />
    </div>
  );
}