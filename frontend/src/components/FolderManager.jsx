"use client";

import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  useGetFoldersQuery,
  useGetDocumentsQuery,
  useCreateFolderMutation,
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
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
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Folder,
  FileText,
  UploadCloud,
  Plus,
  MoreVertical,
  Eye,
  Trash2,
  Pencil,
  History,
  Archive,
} from "lucide-react";

import EditDocumentForm from "@/components/forms/edit-document";
import DocumentHistoryDialog from "@/components/DocumentHistoryDialog";
import ArchiveDocumentDialog from "@/components/ArchiveDocumentDialog";
import ArchiveFolderDialog from "@/components/ArchiveFolderDialog";

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

function detectCommonPrefix(paths = []) {
  const cleaned = (paths || [])
    .map((p) => String(p || "").trim().replace(/^\/+|\/+$/g, ""))
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

// Helper: path of the latest version (display only)
function getLatestVersionPath(doc) {
  if (!doc) return "";

  const vs = doc.versions || doc.document_versions || doc.documentVersions || [];
  if (Array.isArray(vs) && vs.length > 0) {
    const sorted = [...vs].sort((a, b) => {
      const an =
        a.version_number ??
        a.versionNumber ??
        a.versionnumber ??
        a.version_number ??
        0;
      const bn =
        b.version_number ??
        b.versionNumber ??
        b.versionnumber ??
        b.version_number ??
        0;
      return (bn || 0) - (an || 0);
    });

    const latest = sorted[0];
    if (latest && (latest.version_path || latest.versionPath || latest.versionpath || latest.file)) {
      return (
        latest.version_path ||
        latest.versionPath ||
        latest.versionpath ||
        latest.file
      );
    }
  }

  return doc.doc_path || doc.docpath || doc.doc_path || doc.file || "";
}

// debug helpers
function dbg(...args) {
  const ENABLE = true;
  if (ENABLE) console.log("[FolderManager]", ...args);
}
function dbgErr(...args) {
  console.error("[FolderManager]", ...args);
}
function summarizeRtkError(err) {
  const status = err?.status;
  const data = err?.data;
  return { status, data, raw: err };
}

function inferFolderFieldStyle(folderPaths) {
  const firstObj = Array.isArray(folderPaths)
    ? folderPaths.find((x) => x && typeof x === "object")
    : null;

  if (!firstObj) return "snake";
  if ("fol_name" in firstObj || "fol_path" in firstObj || "parent_folder" in firstObj)
    return "snake";
  if ("folname" in firstObj || "folpath" in firstObj || "parentfolder" in firstObj)
    return "camel";
  return "snake";
}

function getFolderNameFromPayload(payload) {
  const raw =
    payload?.fol_name ??
    payload?.folname ??
    payload?.folName ??
    payload?.name ??
    payload?.folder_name ??
    payload?.folderName ??
    payload?.path ??
    "";

  const s = String(raw || "").trim();
  if (!s) return "";
  const normalized = normalizePath(s);
  if (normalized.includes("/")) return normalized.split("/").filter(Boolean).pop() || "";
  return normalized;
}

function getFolderPathFromPayload({ payload, currentPath, folderName }) {
  const raw =
    (payload?.fol_path && String(payload.fol_path).trim()) ||
    (payload?.folpath && String(payload.folpath).trim()) ||
    (payload?.combined_path && String(payload.combined_path).trim()) ||
    (payload?.combinedPath && String(payload.combinedPath).trim()) ||
    "";

  if (raw) return normalizePath(raw);
  return normalizePath(currentPath ? `${currentPath}/${folderName}` : folderName);
}

function normalizeFolderIndex(rawIndex) {
  let fol_index = rawIndex == null || rawIndex === "" ? null : String(rawIndex).trim();
  const key = (fol_index || "").toLowerCase();

  if (
    key === "private" ||
    key === "privet" ||
    key === "prive" ||
    key === "privée" ||
    key === "privee"
  ) {
    fol_index = "PR";
  } else if (
    key === "public" ||
    key === "general" ||
    key === "général" ||
    key === "publique"
  ) {
    fol_index = "GD";
  }

  if (fol_index && fol_index.length > 5) {
    return { value: null, error: `fol_index too long: "${fol_index}"` };
  }

  return { value: fol_index, error: null };
}

export default function FolderManager({ initialPath = "/", className = "" }) {
  const [currentPath, setCurrentPath] = useState(normalizePath(initialPath));
  const [createOpen, setCreateOpen] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editDocId, setEditDocId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [localFolders, setLocalFolders] = useState([]);

  // History dialog state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyDocId, setHistoryDocId] = useState(null);

  // Archive document dialog state
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveDocId, setArchiveDocId] = useState(null);

  // Archive folder dialog state
  const [archiveFolderOpen, setArchiveFolderOpen] = useState(false);
  const [archiveFolder, setArchiveFolder] = useState(null);

  const { data: foldersApiData = [], refetch: refetchFolders } = useGetFoldersQuery();

  // IMPORTANT: endpoint expects params object { folder }
  const { data: documents = [], refetch: refetchDocuments } = useGetDocumentsQuery(
    currentPath ? { folder: currentPath } : undefined
  );

  const [createFolder] = useCreateFolderMutation();
  const [createDocument] = useCreateDocumentMutation();
  const [deleteDocument] = useDeleteDocumentMutation();

  const folderPaths = React.useMemo(
    () =>
      Array.isArray(foldersApiData)
        ? foldersApiData
        : (foldersApiData && foldersApiData.folders) || [],
    [foldersApiData]
  );

  const folderFieldStyle = useMemo(() => inferFolderFieldStyle(folderPaths), [folderPaths]);

  const commonPrefix = useMemo(
    () =>
      detectCommonPrefix(
        folderPaths.length ? folderPaths : (documents || []).map((d) => d.doc_path || d.file || "")
      ),
    [folderPaths, documents]
  );

  // Auto-fix invalid initial path
  const _autoFixedPathRef = React.useRef(false);
  React.useEffect(() => {
    if (_autoFixedPathRef.current) return;

    const hasAnyData =
      (Array.isArray(folderPaths) && folderPaths.length > 0) ||
      (Array.isArray(documents) && documents.length > 0);

    if (!hasAnyData) return;

    const cur = normalizePath(currentPath || "");
    if (!cur) {
      _autoFixedPathRef.current = true;
      return;
    }

    let candidate = cur;

    const lower = candidate.toLowerCase();
    if (lower === "documents") candidate = "";
    else if (lower.startsWith("documents/")) candidate = candidate.slice("documents/".length);

    const allKnownPaths = [];

    for (const fp of folderPaths || []) {
      if (typeof fp === "string") allKnownPaths.push(normalizePath(fp));
      else allKnownPaths.push(normalizePath(fp?.fol_path || fp?.folpath || fp?.path || ""));
    }

    for (const d of documents || []) {
      allKnownPaths.push(normalizePath(d?.doc_path || d?.file || ""));
    }

    if (candidate) {
      const exists = allKnownPaths.some((p) => p === candidate || p.startsWith(candidate + "/"));
      if (!exists) candidate = "";
    }

    if (candidate !== cur) {
      dbg("Auto-fix currentPath", { from: cur, to: candidate });
      setCurrentPath(candidate);
    }

    _autoFixedPathRef.current = true;
  }, [folderPaths, documents, currentPath]);

  const { folders: immediateFolders, files: immediateFiles } = useMemo(() => {
    const folderSet = new Set();
    const fileList = [];
    const cur = normalizePath(currentPath || "");
    const curParts = cur ? cur.split("/").filter(Boolean) : [];
    const curDepth = curParts.length;

    const curFirst = curParts[0] || null;
    const stripPrefix = (p) => {
      if (!p) return "";
      let s = normalizePath(p);
      if (commonPrefix && commonPrefix !== curFirst && s.startsWith(commonPrefix + "/")) {
        s = s.slice(commonPrefix.length + 1);
      }
      return s;
    };

    const sourcePaths = (
      folderPaths && folderPaths.length
        ? folderPaths.map((fp) =>
            typeof fp === "string"
              ? fp
              : fp.fol_path || fp.folpath || fp.fol_path || fp.path || fp.folpath || ""
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
        if (parts.length > curDepth && parts.slice(0, curDepth).join("/") === curParts.join("/")) {
          folderSet.add(parts[curDepth]);
        }
      }
    }

    for (const d of documents || []) {
      const raw = d.doc_path || d.docpath || d.file || "";
      const p = stripPrefix(raw);
      if (!p) continue;
      const parts = p.split("/").filter(Boolean);
      if (curDepth === 0) {
        if (parts.length === 1) fileList.push(d);
      } else {
        const prefix = curParts.join("/");
        if (p === prefix || p.startsWith(prefix + "/")) {
          const rest = p.replace(prefix + "/", "");
          if (rest && !rest.includes("/")) fileList.push(d);
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

  const visibleBreadcrumbs = useMemo(() => {
    if (!Array.isArray(breadcrumbs)) return breadcrumbs;
    return breadcrumbs.filter((c) => {
      if (c && c.name === "Documents") {
        const nonRoot = breadcrumbs.filter((b) => b.name !== "/");
        if (nonRoot.length === 1 && nonRoot[0].name === "Documents") return false;
      }
      return true;
    });
  }, [breadcrumbs]);

  const tableRows = useMemo(() => {
    const rows = [];

    for (const name of immediateFolders) {
      const path = currentPath ? `${currentPath}/${name}` : name;

      let folderObj = null;
      if (Array.isArray(folderPaths) && folderPaths.length) {
        folderObj =
          folderPaths.find((fp) => {
            if (!fp) return false;
            if (typeof fp === "string") return normalizePath(fp) === normalizePath(path);
            const fpPath = normalizePath(fp.fol_path || fp.folpath || fp.path || "");
            return fpPath === normalizePath(path) || fp.fol_name === name || fp.folname === name;
          }) || null;
      }

      rows.push({
        id: folderObj?.id ?? `folder:${path}`,
        fol_name: folderObj?.fol_name ?? folderObj?.folname ?? name,
        fol_path: folderObj?.fol_path ?? folderObj?.folpath ?? path,
        fol_index: folderObj?.fol_index ?? folderObj?.folindex ?? "",
        parent_folder: folderObj?.parent_folder ?? folderObj?.parentfolder ?? null,
        isFolder: true,
        raw: folderObj,
      });
    }

    for (const f of immediateFiles) {
      rows.push({
        id: f.id ?? `file:${f.doc_path}`,
        fol_name:
          f.file_name ||
          f.doc_title ||
          f.doctitle ||
          (f.doc_path || f.docpath || "").split("/").pop(),
        fol_path: getLatestVersionPath(f),
        fol_index: f.doc_code || f.doccode || f.doc_number || f.doc_index || "",
        parent_folder: null,
        isFolder: false,
        file: f,
      });
    }

    return rows;
  }, [immediateFolders, immediateFiles, currentPath, folderPaths]);

  // create file form state
  const [newFileName, setNewFileName] = useState("");
  const [newFileObj, setNewFileObj] = useState(null);

  async function handleSubmitNewFile(e) {
    e?.preventDefault?.();
    if (!newFileObj) {
      alert("Please choose a file");
      return;
    }

    const fd = new FormData();
    fd.append("file", newFileObj, newFileObj.name);

    const docPath = normalizePath(currentPath || "");
    if (docPath) {
      // Compatibility: backend may expect docpath; old clients may send doc_path
      fd.append("docpath", docPath);
      fd.append("doc_path", docPath);
    }

    if (newFileName) {
      // Compatibility: backend may expect doctitle; old clients may send doc_title
      fd.append("doctitle", newFileName);
      fd.append("doc_title", newFileName);
    }

    dbg("CreateDocument => FormData", {
      doc_path: docPath || "(root)",
      doc_title: newFileName || "(auto)",
      file: newFileObj?.name,
      size: newFileObj?.size,
      type: newFileObj?.type,
    });

    try {
      const resp = await createDocument(fd).unwrap();
      dbg("CreateDocument <= response", resp);
      await Promise.all([refetchDocuments?.(), refetchFolders?.()]);
      setShowNewDialog(false);
      setNewFileName("");
      setNewFileObj(null);
    } catch (err) {
      const info = summarizeRtkError(err);
      dbgErr("create document failed", info);
      alert(info?.data ? JSON.stringify(info.data) : "Failed to create file");
    }
  }

  async function handleCreateFolder(payload) {
    dbg("CreateFolder onCreate payload:", payload);
    dbg("CurrentPath:", currentPath, "FieldStyle:", folderFieldStyle);

    try {
      const folderName = getFolderNameFromPayload(payload);
      if (!folderName) {
        dbgErr("CreateFolder blocked: folder name is empty", { payload });
        alert("Folder name is required");
        return;
      }

      const fol_path = getFolderPathFromPayload({ payload, currentPath, folderName });

      const normalizedCurrent = normalizePath(currentPath || "");
      let parentId = null;

      if (normalizedCurrent) {
        if (Array.isArray(folderPaths) && folderPaths.length) {
          const match = folderPaths.find((fp) => {
            if (!fp) return false;
            if (typeof fp === "string") return normalizePath(fp) === normalizedCurrent;
            const fpPath = normalizePath(fp.fol_path || fp.folpath || fp.path || "");
            return fpPath === normalizedCurrent;
          });
          if (match && typeof match !== "string") parentId = match.id ?? null;
        }
      }

      const rawIndex =
        payload?.fol_index ??
        payload?.folindex ??
        payload?.folIndex ??
        payload?.folder_type ??
        payload?.type ??
        null;

      const { value: fol_index, error: folIndexError } = normalizeFolderIndex(rawIndex);
      dbg("CreateFolder fol_index raw =>", rawIndex, "normalized =>", fol_index);

      if (folIndexError) {
        dbgErr("CreateFolder blocked:", folIndexError, { rawIndex, payload });
        alert("Folder type is invalid (must be 5 characters max).");
        return;
      }

      let body;
      if (folderFieldStyle === "camel") {
        body = {
          folname: folderName,
          folpath: fol_path,
          ...(fol_index ? { folindex: fol_index } : {}),
          parentfolder: payload?.parentfolder ?? payload?.parent_folder ?? parentId ?? null,
        };
      } else {
        body = {
          fol_name: folderName,
          fol_path: fol_path,
          ...(fol_index ? { fol_index: fol_index } : {}),
          parent_folder: payload?.parent_folder ?? payload?.parentfolder ?? parentId ?? null,
        };
      }

      dbg("CreateFolder => request body", body);

      const resp = await createFolder(body).unwrap();
      dbg("CreateFolder <= response", resp);

      const expectedKey = String(fol_path || "").trim().replace(/^\/+|\/+$/g, "");
      const expectedLeaf = expectedKey.split("/").filter(Boolean).pop();
      setLocalFolders((prev) => (prev.includes(expectedKey) ? prev : [...prev, expectedKey]));

      let found = false;
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const r1 = await refetchFolders();
          const data = (r1 && r1.data) || folderPaths || [];
          const cleaned = (Array.isArray(data) ? data : (data && data.folders) || []).map((p) => {
            if (typeof p === "string") return normalizePath(p);
            return normalizePath(p?.fol_path || p?.folpath || p?.path || "");
          });

          dbg("Refetch attempt", attempt + 1, "folders:", cleaned.length);

          if (
            cleaned.includes(expectedKey) ||
            cleaned.some((p) => p.split("/").pop() === expectedLeaf)
          ) {
            found = true;
            break;
          }
        } catch (e) {
          dbgErr("refetch attempt failed", attempt + 1, e);
        }
        await new Promise((res) => setTimeout(res, 500));
      }

      try {
        await Promise.all([refetchFolders(), refetchDocuments()]);
      } catch (e) {
        dbgErr("refetch documents failed", e);
      }

      setCreateOpen(false);

      if (found) setLocalFolders((prev) => prev.filter((p) => p !== expectedKey));
      else dbg("Created folder not found in list after retries", expectedKey);
    } catch (err) {
      const info = summarizeRtkError(err);
      dbgErr("create folder failed", info);
      if (info?.data) alert(JSON.stringify(info.data, null, 2));
      else alert("Failed to create folder");
    }
  }

  React.useEffect(() => {
    try {
      refetchFolders();
    } catch {}
    try {
      refetchDocuments();
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUploadFiles(files) {
    if (!files || !files.length) return;
    setUploading(true);

    dbg("UploadFiles =>", { count: files.length, currentPath });

    const tasks = Array.from(files).map(async (f) => {
      const fd = new FormData();
      fd.append("file", f, f.name);

      const docPath = normalizePath(currentPath || "");
      if (docPath) {
        // Compatibility: backend may expect docpath; old clients may send doc_path
        fd.append("docpath", docPath);
        fd.append("doc_path", docPath);
      }

      dbg("Uploading file", {
        name: f.name,
        size: f.size,
        type: f.type,
        doc_path: docPath || "(root)",
      });

      try {
        const resp = await createDocument(fd).unwrap();
        dbg("Upload success", { name: f.name, resp });
      } catch (err) {
        const info = summarizeRtkError(err);
        dbgErr("upload failed", { file: f.name, ...info });
      }
    });

    await Promise.allSettled(tasks);
    setUploading(false);

    try {
      await Promise.all([refetchDocuments?.(), refetchFolders?.()]);
    } catch (e) {
      dbgErr("refetch after upload failed", e);
    }
  }

  function handleRowEdit(r) {
    if (r.isFolder) {
      const newName = window.prompt("Rename folder", r.fol_name);
      if (newName && newName !== r.fol_name) {
        console.log("rename folder", r.fol_path, "->", newName);
        // TODO: call rename API
      }
    } else {
      const id = r.file?.id;
      if (id) {
        setEditDocId(id);
        setEditOpen(true);
      } else {
        console.log("edit file", r.file);
      }
    }
  }

  async function handleRowDelete(r) {
    if (r.isFolder) {
      alert("Folder delete is not implemented yet.");
      return;
    }
    if (!window.confirm(`Delete file '${r.fol_name}'?`)) return;

    const id = r.file?.id;
    if (!id) return;

    try {
      await deleteDocument(id).unwrap();
      await Promise.all([refetchDocuments?.(), refetchFolders?.()]);
    } catch (err) {
      const info = summarizeRtkError(err);
      dbgErr("delete failed", info);
      alert(info?.data ? JSON.stringify(info.data) : "Failed to delete file");
    }
  }

  function handleRowPreview(r) {
    if (r.isFolder) {
      setCurrentPath(r.fol_path);
      return;
    }

    const url =
      r.file?.download_url ||
      r.file?.downloadUrl ||
      r.file?.url ||
      r.file?.file ||
      null;

    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else console.log("no preview url", r.file);
  }

  function handleOpenHistory(r) {
    if (r.isFolder) return;
    const id = r.file?.id;
    if (!id) return;
    setHistoryDocId(id);
    setHistoryOpen(true);
  }

  function handleOpenArchiveDocument(r) {
    if (r.isFolder) return;
    const id = r.file?.id;
    if (!id) return;
    setArchiveDocId(id);
    setArchiveOpen(true);
  }

  function handleOpenArchiveFolder(r) {
    if (!r?.isFolder) return;

    const payload =
      r.raw && typeof r.raw === "object"
        ? r.raw
        : {
            id: typeof r.id === "number" ? r.id : null,
            fol_name: r.fol_name,
            fol_path: r.fol_path,
          };

    setArchiveFolder(payload);
    setArchiveFolderOpen(true);
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Top toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            {visibleBreadcrumbs.map((c, i) => (
              <span key={c.path || i} className="inline-flex items-center gap-2">
                <button
                  type="button"
                  className={`px-2 py-1 rounded text-sm hover:underline ${
                    c.path === currentPath ? "bg-muted/30 text-primary font-medium" : ""
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
          <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2" size={14} /> New Folder
          </Button>

          {/* ✅ React Router navigation (admin not prefixed) */}
          <Button variant="outline" size="sm" asChild>
            <Link to="/archived-documents">
              <Archive className="mr-2" size={14} />
              Archivage
            </Link>
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

      {/* Table */}
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
                <th className="px-4 py-3 text-right w-28">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No folders or files in this path. Use New Folder or Upload to get started.
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
                              href={r.file?.download_url || r.file?.url || r.file?.file || "#"}
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

                    <td className="px-4 py-3 text-sm">
                      {r.isFolder ? formatFolderIndexLabel(r.fol_index) : r.fol_index || ""}
                    </td>

                    <td className="px-4 py-3 text-sm">{r.parent_folder ?? "-"}</td>

                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {!r.isFolder && (
                          <button
                            type="button"
                            className="p-1 rounded hover:bg-muted/20"
                            title="Historique"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenHistory(r);
                            }}
                          >
                            <History size={16} />
                          </button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="p-1 rounded hover:bg-muted/20"
                              onClick={(e) => e.stopPropagation()}
                              title="Actions"
                            >
                              <MoreVertical size={16} />
                            </button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent>
                            <DropdownMenuLabel>{r.isFolder ? "Folder" : "File"}</DropdownMenuLabel>

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
                              <Pencil size={14} className="mr-2" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowPreview(r);
                              }}
                            >
                              <Eye size={14} className="mr-2" />
                              Preview
                            </DropdownMenuItem>

                            {/* ✅ Archive (folder + file) */}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                if (r.isFolder) handleOpenArchiveFolder(r);
                                else handleOpenArchiveDocument(r);
                              }}
                            >
                              <Archive size={14} className="mr-2" />
                              {r.isFolder ? "Archive folder" : "Archive document"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowDelete(r);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Folder */}
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

      {/* Edit Document */}
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
                } catch {}
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create New File */}
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
              <input type="file" onChange={(e) => setNewFileObj(e.target.files?.[0] || null)} />
            </FieldGroup>

            <DialogFooter>
              <div className="flex gap-2">
                <button type="button" className="btn btn-ghost" onClick={() => setShowNewDialog(false)}>
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

      {/* Historique dialog */}
      <DocumentHistoryDialog
        open={historyOpen}
        documentId={historyDocId}
        onOpenChange={(v) => {
          setHistoryOpen(v);
          if (!v) setHistoryDocId(null);
        }}
      />

      {/* Archive document dialog */}
      <ArchiveDocumentDialog
        open={archiveOpen}
        documentId={archiveDocId}
        onOpenChange={(v) => {
          setArchiveOpen(v);
          if (!v) {
            setArchiveDocId(null);
            try {
              refetchDocuments?.();
              refetchFolders?.();
            } catch {}
          }
        }}
      />

      {/* ✅ Archive folder dialog */}
      <ArchiveFolderDialog
        open={archiveFolderOpen}
        folder={archiveFolder}
        onOpenChange={(v) => {
          setArchiveFolderOpen(v);
          if (!v) {
            setArchiveFolder(null);
            try {
              refetchDocuments?.();
              refetchFolders?.();
            } catch {}
          }
        }}
        onSuccess={() => {
          try {
            refetchDocuments?.();
            refetchFolders?.();
          } catch {}
        }}
      />
    </div>
  );
}
