"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  useSyncFoldersMutation,
} from "@/slices/documentSlice";

// ✅ Import Auth Hook
import { useAuth } from "@/Hooks/useAuth";

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
  DropdownMenuSeparator,
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
  FolderPlus,
  FileText,
  UploadCloud,
  Plus,
  MoreVertical,
  Eye,
  Pencil,
  History,
  Archive,
  User,
  Calendar,
  Info,
  Move,
  X,
  FolderOpen,
  RefreshCw,
  MapPin,
  FileType,
  GitBranch,
  Sparkles,
  Search,
  Filter,
  Download,
  Grid3x3,
  List,
  SortAsc,
  SortDesc,
  TrendingUp,
  FileCheck,
  Clock,
  ArrowUpDown,
  Hash,
  Building2,
  FolderTree,
  AlignLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Circle,
  Copy,
  Share2,
  Star,
  Tag,
  Code2,
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

  if (key === "private" || key === "privet" || key === "prive" || key === "privée" || key === "privee")
    return { value: "PR", error: null };
  if (key === "public" || key === "general" || key === "général" || key === "publique")
    return { value: "GD", error: null };

  if (fol_index && fol_index.length > 5)
    return { value: null, error: `Folder type invalid: "${fol_index}"` };

  return { value: fol_index, error: null };
}

function formatDateTime(val) {
  if (!val) return "-";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(d);
}

function getFolderNameFromPayload(payload) {
  return payload?.fol_name || payload?.folname || payload?.name || "";
}

function getFolderPathFromPayload({ payload, currentPath, folderName }) {
  const raw = payload?.fol_path || "";
  if (raw) return normalizePath(raw);
  return normalizePath(currentPath ? `${currentPath}/${folderName}` : folderName);
}

// ✅ REVERTED: Status design restored to original (Blue default for "Original")
function getStatusInfo(status) {
  const statusLower = (status || "").toLowerCase();
  switch(statusLower) {
    case "approved":
      return { icon: CheckCircle2, color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" };
    case "pending":
      return { icon: Clock, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" };
    case "rejected":
      return { icon: XCircle, color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" };
    case "draft":
      return { icon: AlertCircle, color: "text-gray-600", bgColor: "bg-gray-50", borderColor: "border-gray-200" };
    // "ORIGINAL" and "PUBLIC" fall to default (Blue), matching your original design.
    default:
      return { icon: Circle, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" };
  }
}

// --- Enhanced Bulk Action Dialogs ---
function BulkMoveDialog({ open, onOpenChange, selectedItems, allFolders, currentFolderId, onMoveSuccess }) {
  const [targetFolder, setTargetFolder] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  const [updateDoc] = useUpdateDocumentMutation();
  const [updateFolder] = useUpdateFolderMutation();

  const availableTargets = useMemo(() => {
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
          if (typeof item.id !== 'number') return Promise.resolve();
          if (item.id === targetId) return Promise.resolve();
          return updateFolder({ id: item.id, data: { parent_folder: targetId } }).unwrap();
        } else {
          return updateDoc({ id: item.id, data: { parent_folder: targetId } }).unwrap();
        }
      });

      await Promise.allSettled(promises).then(results => {
        results.forEach(res => {
          if (res.status === 'rejected') errors++;
        });
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
      <DialogContent className="max-h-[80vh] flex flex-col shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Move {selectedItems.length} items
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-[300px] border-2 border-gray-100 rounded-xl p-3 bg-gradient-to-br from-gray-50 to-white shadow-inner">
          <div
            className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-all duration-300 hover:scale-[1.02] ${
              targetFolder === "root"
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-200/50 transform scale-[1.02]"
                : "bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border border-gray-200 hover:border-blue-300 hover:shadow-md"
            }`}
            onClick={() => setTargetFolder("root")}
          >
            <Folder size={18} className={targetFolder === "root" ? "" : "text-blue-500"} />
            <span className="font-medium">Root Directory</span>
          </div>

          {availableTargets.map(folder => (
            <div
              key={folder.id}
              className={`p-3 ml-4 rounded-lg cursor-pointer flex items-center gap-3 mt-2 truncate transition-all duration-300 hover:scale-[1.02] ${
                targetFolder === folder.id
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-200/50 transform scale-[1.02]"
                  : "bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border border-gray-200 hover:border-blue-300 hover:shadow-md"
              }`}
              onClick={() => setTargetFolder(folder.id)}
            >
              <Folder size={16} className={targetFolder === folder.id ? "" : "text-blue-400"} />
              <span className="font-medium">{folder.fol_name}</span>
              <span className={`text-xs ml-auto max-w-[150px] truncate ${targetFolder === folder.id ? "text-white/80" : "text-gray-500"}`}>
                {folder.fol_path}
              </span>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-2 hover:bg-gray-50">
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={!targetFolder || isMoving}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
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
      if (item.type === "folder" && typeof item.id !== "number") return Promise.resolve();

      const payload = { id: item.id, mode, until: isoUntil, note };
      if (item.type === "folder") return archiveFolder(payload).unwrap();
      return archiveDoc(payload).unwrap();
    });

    await Promise.allSettled(promises).then(results => {
      results.forEach(res => {
        if (res.status === 'rejected') errors++;
      });
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
      <DialogContent className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Archive {selectedItems.length} items
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-col gap-3 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-100">
            <label className="flex items-center gap-3 text-sm cursor-pointer p-2 rounded-lg hover:bg-white/50 transition-all">
              <input
                type="radio"
                checked={mode==="permanent"}
                onChange={() => setMode("permanent")}
                className="accent-orange-600 w-4 h-4"
              />
              <span className="font-medium">Permanent Archive</span>
            </label>

            <label className="flex items-center gap-3 text-sm cursor-pointer p-2 rounded-lg hover:bg-white/50 transition-all">
              <input
                type="radio"
                checked={mode==="until"}
                onChange={() => setMode("until")}
                className="accent-orange-600 w-4 h-4"
              />
              <span className="font-medium">Temporary (Until date)</span>
            </label>
          </div>

          {mode === "until" && (
            <Input
              type="datetime-local"
              value={until}
              onChange={(e) => setUntil(e.target.value)}
              className="border-2 border-orange-200 focus:border-orange-400 shadow-sm"
            />
          )}

          <Input
            placeholder="Archive Note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="border-2 border-gray-200 focus:border-orange-400 shadow-sm"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-2 hover:bg-gray-50">
            Cancel
          </Button>
          <Button
            onClick={handleArchive}
            disabled={isArchiving}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            {isArchiving ? "Archiving..." : "Confirm Archive"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Component ---
export default function FolderManager({ initialPath = "/", className = "" }) {
  const navigate = useNavigate();

  // ✅ 1. Get User Details
  const { user, roleName, departmentName } = useAuth();
  const isAdmin = roleName === "admin";

  const [currentPath, setCurrentPath] = useState(normalizePath(initialPath));
  const [selectedItems, setSelectedItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

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
  const [dragActive, setDragActive] = useState(false);

  // --- API Hooks ---
  const { data: documents = [], refetch: refetchDocuments } = useGetDocumentsQuery();
  const { data: foldersApiData = [], refetch: refetchFolders } = useGetFoldersQuery();
  const [createFolder] = useCreateFolderMutation();
  const [createDocument] = useCreateDocumentMutation();
  const [syncFolders, { isLoading: isSyncing }] = useSyncFoldersMutation();

  // --- Memos & Derived State ---
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

  // Get unique document types for filter
  const documentTypes = useMemo(() => {
    const types = new Set();
    documents.forEach(doc => {
      const typeName = doc.document_type_details?.name;
      if (typeName && typeName !== "-") {
        types.add(typeName);
      }
    });
    return Array.from(types).sort();
  }, [documents]);

  // --- Auto Sync Effect ---
  const hasSyncedRef = useRef(false);
  useEffect(() => {
    if (!hasSyncedRef.current) {
      syncFolders()
        .unwrap()
        .then((res) => {
          let shouldRefetchFolders = false;
          let shouldRefetchDocs = false;

          if (res.deleted_ghost_folders > 0) shouldRefetchFolders = true;
          if (res.deleted_ghost_documents > 0) shouldRefetchDocs = true;

          if (shouldRefetchFolders) refetchFolders();
          if (shouldRefetchDocs) refetchDocuments();

          if (shouldRefetchFolders || shouldRefetchDocs) {
            toast.success("Cleanup complete: Missing files removed.");
          }
        })
        .catch(err => console.error("Sync failed", err));

      hasSyncedRef.current = true;
    }
  }, [syncFolders, refetchFolders, refetchDocuments]);

  // --- Table Row Generation with Filtering & Sorting ---
  const tableRows = useMemo(() => {
    let rows = [];

documents.forEach(f => {
  // ✅ 2. Filter Logic for Non-Admins (Check Department + Site)
  if (!isAdmin) {
    // A. Filter by Department AND Site
    // The serializer uses 'doc_departement_details' which has 'dep_name'
    const docDeptName = f.doc_departement_details?.dep_name || "";
    const docSiteId = f.site_details?.id || f.site; // Get document's site ID
    const userSiteId = user?.site?.id || user?.site; // Get user's site ID

    // Skip if department is different
    if (departmentName && docDeptName.trim() !== departmentName.trim()) {
      return; // Skip this document (Different Department)
    }

    // ✅ NEW: Skip if site is different (Only check if both user and document have sites)
    if (userSiteId && docSiteId && String(userSiteId) !== String(docSiteId)) {
      return; // Skip this document (Different Site)
    }

    // B. Filter by Status/Ownership
    const status = (f.doc_status_type || "").toUpperCase();

    // Check for specific statuses allowed for everyone
    const isPublicOrOriginal = status === "PUBLIC" || status === "ORIGINAL";

    // Check if current user is the owner
    const isOwner = f.doc_owner?.username === user?.username;

    if (!isPublicOrOriginal && !isOwner) {
      return; // Skip if not public/original AND not my document
    }
  }


      let displayPath = normalizePath(f.doc_path || "");
      if (displayPath.toLowerCase().startsWith("documents/")) {
        displayPath = displayPath.substring("documents/".length);
      }

      let versionNum = f.latest_version;
      if (versionNum === undefined && Array.isArray(f.versions) && f.versions.length > 0) {
        const sorted = [...f.versions].sort((a, b) => b.version_number - a.version_number);
        versionNum = sorted[0].version_number;
      }
      if (!versionNum) versionNum = 1;

      rows.push({
        id: f.id,
        name: f.doc_title,
        path: displayPath,
        type: "file",
        index: f.doc_code || "",
        version: `v${versionNum}`,
        owner: f.doc_owner?.username || "-",
        date: f.created_at,
        status: f.doc_status_type || "ORIGINAL",
        description: f.doc_description || "",
        downloadUrl: f.download_url,
        siteName: f.site_details?.name || "-",
        docTypeName: f.document_type_details?.name || "-",
        docTypeCode: f.document_type_details?.code || "",
        documentCode: f.document_code_details?.code || "-", // ✅ ADD THIS
        documentCodeName: f.document_code_details?.name || "", // ✅ ADD THIS
        raw: f
      });
    });

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      rows = rows.filter(row =>
        row.name.toLowerCase().includes(query) ||
        row.description.toLowerCase().includes(query) ||
        row.owner.toLowerCase().includes(query) ||
        row.index.toLowerCase().includes(query) ||
        row.documentCode.toLowerCase().includes(query) // ✅ ADD THIS
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      rows = rows.filter(row => row.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Apply document type filter
    if (typeFilter !== "all") {
      rows = rows.filter(row => row.docTypeName === typeFilter);
    }

    // Apply sorting
    rows.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "date") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return rows;
  }, [documents, searchQuery, statusFilter, typeFilter, sortField, sortDirection, isAdmin, user, departmentName]);

  // --- Handlers ---
  const toggleSelectAll = () => {
    if (Object.keys(selectedItems).length === tableRows.length) {
      setSelectedItems({});
    } else {
      const newSel = {};
      tableRows.forEach(r => {
        newSel[r.id] = r;
      });
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
      setTimeout(() => {
        refetchFolders();
        refetchDocuments();
      }, 500);

      setCreateOpen(false);
      toast.success("Folder created successfully");
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
      if (currentPath) fd.append("doc_path", currentPath);

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
    toast.success(`${files.length} file(s) uploaded successfully`);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Path", "Index", "Version", "Type", "Site", "Code", "Status", "Description", "Owner", "Date"];
    const csvData = tableRows.map(row => [
      row.name,
      row.path,
      row.index,
      row.version,
      row.docTypeName,
      row.siteName,
      row.documentCode, // ✅ ADD THIS
      row.status,
      row.description,
      row.owner,
      formatDateTime(row.date)
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `documents_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Documents exported to CSV");
  };

  const handleCopyLink = (row) => {
    if (row.downloadUrl) {
      navigator.clipboard.writeText(row.downloadUrl);
      toast.success("Link copied to clipboard");
    }
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
    <div className={`flex flex-col gap-6 ${className} h-full p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {dragActive && (
        <div className="fixed inset-0 bg-blue-500/10 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl border-4 border-dashed border-blue-500 p-12 shadow-2xl transform scale-100 animate-pulse">
            <UploadCloud className="w-24 h-24 text-blue-500 mx-auto mb-4 animate-bounce" />
            <p className="text-3xl font-bold text-blue-600 text-center">Drop files here to upload</p>
          </div>
        </div>
      )}

      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="relative bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-6">
          {selectedList.length > 0 ? (
            <div className="flex items-center gap-3 w-full animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg shadow-blue-300/50 transform hover:scale-105 transition-all duration-300">
                <Sparkles size={16} className="animate-pulse" />
                <span className="font-bold">{selectedList.length} selected</span>
              </div>

              <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />

              {/* 3. Hide Bulk Actions from Non-Admins */}
              {isAdmin && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkMoveOpen(true)}
                    className="border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md hover:scale-105 transition-all duration-300"
                  >
                    <Move size={14} className="mr-2" />
                    Move To...
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkArchiveOpen(true)}
                    className="border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 hover:shadow-md hover:scale-105 transition-all duration-300"
                  >
                    <Archive size={14} className="mr-2" />
                    Archive
                  </Button>
                </>
              )}

              <div className="flex-1" />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedItems({})}
                className="hover:bg-red-50 hover:text-red-600 hover:rotate-90 transition-all duration-300"
              >
                <X size={18} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-foreground leading-tight">
                    Document Manager
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Manage and organize your documents efficiently
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isSyncing}
                  onClick={() =>
                    syncFolders()
                      .unwrap()
                      .then(res => {
                        if(res.deleted_ghost_documents > 0) refetchDocuments();
                        if(res.deleted_ghost_folders > 0) refetchFolders();
                        toast.success("Synced with S3");
                      })
                  }
                  title="Sync with S3"
                  className="ml-2 hover:bg-blue-50 hover:scale-110 transition-all duration-300 hover:shadow-md"
                >
                  <RefreshCw size={18} className={`${isSyncing ? "animate-spin text-blue-600" : "text-gray-600"}`} />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                {/* 4. Hide New Folder/Archive buttons from Non-Admins */}
                {isAdmin && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCreateOpen(true)}
                      className="border-2 border-green-200 hover:border-green-400 hover:bg-green-50 hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      <FolderPlus className="mr-2" size={14} />
                      New Folder
                    </Button>

                    <Button variant="outline" size="sm" asChild className="border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 hover:shadow-lg hover:scale-105 transition-all duration-300">
                      <Link to="/archived-documents">
                        <Archive className="mr-2" size={14} />
                        Archives
                      </Link>
                    </Button>
                  </>
                )}

                <Button
                  size="sm"
                  onClick={() => navigate("/creer-documents")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <Plus className="mr-2" size={14} />
                  Create Document
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/5 to-purple-50/5 blur-xl -z-10" />

        <div className="relative bg-white/80 backdrop-blur-xl border-2 border-white shadow-lg p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 border-2 border-gray-200 focus:border-blue-400 shadow-sm h-11"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-2 hover:bg-gray-50 h-11">
                    <Tag className="w-4 h-4 mr-2" />
                    Status
                    <span className="font-semibold ml-1">{statusFilter === "all" ? "All" : statusFilter}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/95 backdrop-blur-xl">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")} className="cursor-pointer">
                    <Circle className="w-3 h-3 mr-2 text-gray-400" />
                    All Statuses
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")} className="cursor-pointer">
                    <Clock className="w-3 h-3 mr-2 text-orange-500" />
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("approved")} className="cursor-pointer">
                    <CheckCircle2 className="w-3 h-3 mr-2 text-green-500" />
                    Approved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("draft")} className="cursor-pointer">
                    <AlertCircle className="w-3 h-3 mr-2 text-gray-500" />
                    Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("rejected")} className="cursor-pointer">
                    <XCircle className="w-3 h-3 mr-2 text-red-500" />
                    Rejected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Document Type Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-2 hover:bg-gray-50 h-11">
                    <FileType className="w-4 h-4 mr-2" />
                    Type
                    <span className="font-semibold ml-1">{typeFilter === "all" ? "All" : typeFilter}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/95 backdrop-blur-xl max-h-[80] overflow-y-auto">
                  <DropdownMenuItem onClick={() => setTypeFilter("all")} className="cursor-pointer">
                    <Circle className="w-3 h-3 mr-2 text-gray-400" />
                    All Types
                  </DropdownMenuItem>
                  {documentTypes.length > 0 && <DropdownMenuSeparator />}
                  {documentTypes.map(type => (
                    <DropdownMenuItem key={type} onClick={() => setTypeFilter(type)} className="cursor-pointer">
                      <FileType className="w-3 h-3 mr-2 text-emerald-500" />
                      {type}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-2 hover:bg-gray-50 h-11">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/95 backdrop-blur-xl">
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setSortField("name"); setSortDirection("asc"); }} className="cursor-pointer">
                    <SortAsc className="w-3 h-3 mr-2" />
                    Name (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortField("name"); setSortDirection("desc"); }} className="cursor-pointer">
                    <SortDesc className="w-3 h-3 mr-2" />
                    Name (Z-A)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortField("date"); setSortDirection("desc"); }} className="cursor-pointer">
                    <Calendar className="w-3 h-3 mr-2" />
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortField("date"); setSortDirection("asc"); }} className="cursor-pointer">
                    <Calendar className="w-3 h-3 mr-2" />
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortField("owner"); setSortDirection("asc"); }} className="cursor-pointer">
                    <User className="w-3 h-3 mr-2" />
                    Owner
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="border-2 border-green-200 hover:border-green-400 hover:bg-green-50 h-11 hover:scale-105 transition-all"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {(searchQuery || statusFilter !== "all" || typeFilter !== "all") && (
            <div className="mt-3 flex items-center gap-2 flex-wrap animate-in fade-in slide-in-from-top-1">
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                {tableRows.length} result{tableRows.length !== 1 ? "s" : ""} found
              </Badge>

              {statusFilter !== "all" && (
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-red-50" onClick={() => setStatusFilter("all")}>
                  Status: {statusFilter}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}

              {typeFilter !== "all" && (
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-red-50" onClick={() => setTypeFilter("all")}>
                  Type: {typeFilter}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="relative overflow-hidden rounded-2xl flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/5 via-purple-50/5 to-pink-50/5 blur-2xl -z-10" />

        <div className="relative bg-white/90 backdrop-blur-xl border-2 border-white shadow-2xl shadow-gray-500/20 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-50 to-gray-50 border-b-2 border-gray-200 hover:bg-gradient-to-r">
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={tableRows.length > 0 && selectedList.length === tableRows.length}
                      onCheckedChange={toggleSelectAll}
                      className="border-2 border-gray-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-purple-600"
                    />
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead className="min-w-[250px]">
                    <div className="flex items-center gap-2 font-bold text-gray-700">
                      <FileText className="w-4 h-4 text-blue-500" />
                      Document Name
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[150px]">
                    <div className="flex items-center gap-2 font-bold text-gray-700">
                      <FolderTree className="w-4 h-4 text-amber-500" />
                      Path
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[100px]">
                    <div className="flex items-center gap-2 font-bold text-gray-700">
                      <Hash className="w-4 h-4 text-indigo-500" />
                      Index
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[90px]">
                    <div className="flex items-center gap-2 font-bold text-gray-700">
                      <GitBranch className="w-4 h-4 text-purple-500" />
                      Version
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    <div className="flex items-center gap-2 font-bold text-gray-700">
                      <FileType className="w-4 h-4 text-emerald-500" />
                      Type
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    <div className="flex items-center gap-2 font-bold text-gray-700">
                      <Building2 className="w-4 h-4 text-red-500" />
                      Site
                    </div>
                  </TableHead>
                  {/* ✅ ADD: Document Code Column Header */}
                  <TableHead className="min-w-[140px]">
                    <div className="flex items-center gap-2 font-bold text-gray-700">
                      <Code2 className="w-4 h-4 text-violet-500" />
                      Document Code
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    <div className="flex items-center gap-2 font-bold text-gray-700">
                      <Tag className="w-4 h-4 text-cyan-500" />
                      Status
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[250px]">
                    <div className="flex items-center gap-2 font-bold text-gray-700">
                      <AlignLeft className="w-4 h-4 text-slate-500" />
                      Description
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[140px]">
                    <div className="flex items-center gap-2 font-bold text-gray-700">
                      <User className="w-4 h-4 text-orange-500" />
                      Owner
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[150px]">
                    <div className="flex items-center gap-2 font-bold text-gray-700">
                      <Calendar className="w-4 h-4 text-pink-500" />
                      Created
                    </div>
                  </TableHead>
                  <TableHead className="text-right w-[100px] font-bold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {tableRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="h-[80] text-center">
                      <div className="flex flex-col items-center justify-center gap-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20 animate-pulse" />
                          <FolderOpen className="relative w-24 h-24 text-gray-300" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-xl font-semibold mb-2">
                            {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                              ? "No documents match your filters"
                              : "No documents found"}
                          </p>
                          {(searchQuery || statusFilter !== "all" || typeFilter !== "all") && (
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => {
                                  setSearchQuery("");
                                  setStatusFilter("all");
                                  setTypeFilter("all");
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700 underline"
                              >
                                Clear all filters
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  tableRows.map((row, idx) => {
                    const statusInfo = getStatusInfo(row.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <TableRow
                        key={row.id}
                        className={`group transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50/50 hover:via-white hover:to-purple-50/50 hover:shadow-lg border-b border-gray-100 ${
                          selectedItems[row.id] ? "bg-gradient-to-r from-blue-100/70 to-purple-100/70 shadow-md" : ""
                        }`}
                        onClick={(e) => {
                          if (e.ctrlKey || e.metaKey) toggleSelectRow(row);
                        }}
                        style={{ animationDelay: `${idx * 20}ms` }}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={!!selectedItems[row.id]}
                            onCheckedChange={() => toggleSelectRow(row)}
                            className="border-2 border-gray-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-purple-600 transition-all duration-300"
                          />
                        </TableCell>

                        <TableCell>
                          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 shadow-sm group-hover:shadow-lg group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300 group-hover:scale-110">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                        </TableCell>

                        <TableCell className="font-semibold">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-900 group-hover:text-blue-700 transition-colors duration-300 font-medium">
                              {row.name}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FolderTree className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            <span className="text-xs text-gray-600 truncate max-w-[130px] group-hover:text-gray-800" title={row.path}>
                              {row.path}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-xs">
                          <Badge variant="outline" className="font-mono text-[10px] bg-indigo-50 border-indigo-200 text-indigo-700 group-hover:bg-indigo-100 group-hover:shadow-sm transition-all duration-300">
                            {row.index}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-xs">
                          <Badge variant="outline" className="font-mono text-[10px] bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                            {row.version}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-xs">
                          {row.docTypeName !== "-" ? (
                            <Badge variant="secondary" className="font-normal text-[10px] bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 shadow-sm group-hover:shadow-md transition-all duration-300">
                              {row.docTypeName}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>

                        <TableCell className="text-xs">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                            <span className="text-gray-600 group-hover:text-gray-800 transition-colors truncate max-w-[100px]" title={row.siteName}>
                              {row.siteName}
                            </span>
                          </div>
                        </TableCell>

                        {/* ✅ ADD: Document Code Column Cell */}
{/* ✅ Document Code Column Cell - Code Only */}
<TableCell className="text-xs">
  {row.documentCode !== "-" ? (
    <Badge 
      variant="outline" 
      className="font-mono text-[10px] bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border-violet-200 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105"
      title={row.documentCodeName} // Show name on hover
    >
      {row.documentCode}
    </Badge>
  ) : (
    <span className="text-gray-400">-</span>
  )}
</TableCell>


                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-medium ${statusInfo.bgColor} ${statusInfo.borderColor} ${statusInfo.color} shadow-sm group-hover:shadow-md transition-all duration-300 flex items-center gap-1.5 w-fit`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {row.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-xs text-gray-600 truncate max-w-[240px] group-hover:text-gray-800" title={row.description}>
                          {row.description || <span className="text-gray-400 italic">No description</span>}
                        </TableCell>

                        <TableCell className="text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-[11px] font-bold shadow-md group-hover:scale-110 transition-all duration-300 ring-2 ring-white">
                              {row.owner.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-gray-700 group-hover:text-gray-900 font-medium">{row.owner}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-xs text-gray-500 group-hover:text-gray-700">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-pink-400" />
                            {formatDateTime(row.date)}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              className="p-2 rounded-lg hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition-all duration-300 hover:scale-110 hover:shadow-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                setHistoryDocId(row.id);
                                setHistoryOpen(true);
                              }}
                              title="View History"
                            >
                              <History className="w-4 h-4" />
                            </button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-2 rounded-lg hover:bg-purple-100 text-gray-500 hover:text-purple-600 transition-all duration-300 hover:scale-110 hover:shadow-md">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl border-2 border-gray-200 shadow-2xl w-48">
                                <DropdownMenuLabel className="text-gray-700 font-bold flex items-center gap-2">
                                  <Sparkles className="w-3 h-3" />
                                  Actions
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (row.downloadUrl) window.open(row.downloadUrl, "_blank");
                                  }}
                                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5 mr-2 text-blue-600" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyLink(row);
                                  }}
                                  className="hover:bg-green-50 cursor-pointer transition-colors"
                                >
                                  <Copy className="w-3.5 h-3.5 mr-2 text-green-600" />
                                  Copy Link
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditDocId(row.id);
                                    setEditOpen(true);
                                  }}
                                  className="hover:bg-purple-50 cursor-pointer transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5 mr-2 text-purple-600" />
                                  Edit
                                </DropdownMenuItem>

                                {/* 5. Hide Archive Action for Non-Admins */}
                                {isAdmin && (
                                  <DropdownMenuItem
                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 cursor-pointer transition-colors"
                                    onClick={() => {
                                      setArchiveDocId(row.id);
                                      setArchiveDocOpen(true);
                                    }}
                                  >
                                    <Archive className="w-3.5 h-3.5 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Bulk Dialogs - Only rendered/accessible if admin, but logic handled above via button visibility too */}
      {isAdmin && (
        <>
          <BulkMoveDialog
            open={bulkMoveOpen}
            onOpenChange={setBulkMoveOpen}
            selectedItems={selectedList}
            allFolders={folderPaths}
            currentFolderId={currentFolderObj?.id}
            onMoveSuccess={() => {
              setSelectedItems({});
              refetchFolders();
              refetchDocuments();
            }}
          />

          <BulkArchiveDialog
            open={bulkArchiveOpen}
            onOpenChange={setBulkArchiveOpen}
            selectedItems={selectedList}
            onArchiveSuccess={() => {
              setSelectedItems({});
              refetchFolders();
              refetchDocuments();
            }}
          />
        </>
      )}

      {/* Standard Dialogs */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Create New Folder
            </DialogTitle>
          </DialogHeader>
          <CreateFolder
            prefix={currentPath ? currentPath : ""}
            onCreate={handleCreateFolderAction}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Upload New File
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitNewFile} className="space-y-4">
            <FieldGroup>
              <FieldLabel className="font-semibold text-gray-700">Title</FieldLabel>
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="File title"
                className="border-2 border-gray-200 focus:border-blue-400 shadow-sm"
              />

              <FieldLabel className="font-semibold text-gray-700 mt-4">File</FieldLabel>
              <input
                type="file"
                onChange={(e) => setNewFileObj(e.target.files?.[0])}
                className="text-sm border-2 border-dashed border-gray-300 rounded-lg p-3 w-full hover:border-blue-400 transition-colors"
              />
            </FieldGroup>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewDialog(false)} className="border-2 hover:bg-gray-50">
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Upload
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if(!v) setEditDocId(null); }}>
        <DialogContent className="max-w-3xl shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edit Document
            </DialogTitle>
          </DialogHeader>
          {editDocId && (
            <EditDocumentForm
              documentId={editDocId}
              onClose={() => { setEditOpen(false); setEditDocId(null); }}
              refetch={refetchDocuments}
            />
          )}
        </DialogContent>
      </Dialog>

      <DocumentHistoryDialog
        open={historyOpen}
        documentId={historyDocId}
        onOpenChange={(v) => { setHistoryOpen(v); if(!v) setHistoryDocId(null); }}
      />

      <ArchiveDocumentDialog
        open={archiveDocOpen}
        documentId={archiveDocId}
        onOpenChange={(v) => { setArchiveDocOpen(v); if(!v) setArchiveDocId(null); }}
        refetch={refetchDocuments}
      />

      <ArchiveFolderDialog
        open={archiveFolderOpen}
        folder={archiveFolderObj}
        onOpenChange={(v) => { setArchiveFolderOpen(v); if(!v) setArchiveFolderObj(null); }}
        refetch={() => { refetchFolders(); refetchDocuments(); }}
      />
    </div>
  );
}
