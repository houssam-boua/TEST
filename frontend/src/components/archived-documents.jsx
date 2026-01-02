"use client";

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetArchiveNavigationQuery,
  useRestoreDocumentMutation,
  useRestoreFolderMutation,
} from "@/slices/documentSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import DocumentHistoryDialog from "@/components/DocumentHistoryDialog";
import EditDocumentForm from "@/components/forms/edit-document";

import { 
  ArrowLeft, RefreshCcw, Folder, FileText, Loader2, 
  RotateCcw, ChevronRight, Home, Eye, History, Pencil, 
  StickyNote, Clock, Calendar, User
} from "lucide-react";
import { toast } from "sonner";

// --- Helpers ---

function formatDateTime(val) {
  if (!val) return "-";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric", 
    hour: "2-digit", minute: "2-digit"
  }).format(d);
}

function getRemainingTime(until) {
  if (!until) return <Badge variant="secondary" className="font-normal text-xs">Permanent</Badge>;
  const end = new Date(until);
  const now = new Date();
  
  if (end < now) return <Badge variant="destructive" className="font-normal text-xs">Expired</Badge>;
  
  const diffMs = end - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (diffDays > 0) return <span className="text-blue-600 font-medium text-xs">{diffDays}d {diffHours}h left</span>;
  return <span className="text-orange-600 font-medium text-xs">{diffHours}h left</span>;
}

export default function ArchivedDocuments() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  // Navigation Stack for Breadcrumbs
  const [navStack, setNavStack] = useState([]); 
  const currentFolderId = navStack.length > 0 ? navStack[navStack.length - 1].id : null;

  // Data Fetching
  const { data, isLoading, isError, refetch } = useGetArchiveNavigationQuery(currentFolderId);
  const [restoreDoc, { isLoading: restoringDoc }] = useRestoreDocumentMutation();
  const [restoreFolder, { isLoading: restoringFolder }] = useRestoreFolderMutation();

  // Dialog States
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyDocId, setHistoryDocId] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editDocId, setEditDocId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToRestore, setItemToRestore] = useState(null); 

  // Filter Logic
  const filteredData = useMemo(() => {
    const rawFolders = data?.folders || [];
    const rawDocs = data?.documents || [];
    const term = q.trim().toLowerCase();

    if (!term) return { folders: rawFolders, documents: rawDocs };

    return {
      folders: rawFolders.filter(f => f.fol_name?.toLowerCase().includes(term)),
      documents: rawDocs.filter(d => 
        d.doc_title?.toLowerCase().includes(term) || 
        d.doc_code?.toLowerCase().includes(term)
      )
    };
  }, [data, q]);

  // Handlers
  const handleNavigate = (folder) => {
    setNavStack([...navStack, { id: folder.id, name: folder.fol_name }]);
    setQ("");
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) setNavStack([]);
    else setNavStack(navStack.slice(0, index + 1));
  };

  const handleRestoreClick = (type, item) => {
    setItemToRestore({ type, ...item });
    setConfirmOpen(true);
  };

  const executeRestore = async () => {
    if (!itemToRestore) return;
    try {
      if (itemToRestore.type === "folder") {
        await restoreFolder(itemToRestore.id).unwrap();
        toast.success("Folder restored successfully");
      } else {
        await restoreDoc(itemToRestore.id).unwrap();
        toast.success("Document restored successfully");
      }
      setConfirmOpen(false);
      setItemToRestore(null);
    } catch (err) {
      console.error(err);
      toast.error("Restore failed");
    }
  };

  const handlePreview = (url) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else toast.error("No preview URL available.");
  };

  const folders = filteredData.folders;
  const documents = filteredData.documents;
  const isEmpty = folders.length === 0 && documents.length === 0;

  return (
    <div className="flex flex-col gap-4 p-4 h-full bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 bg-card p-3 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold tracking-tight">Archive Management</h1>
            <span className="text-xs text-muted-foreground">Manage archived folders and documents</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            placeholder="Search in view..." 
            className="w-[250px] h-9" 
          />
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/40 p-2 rounded-md border">
        <button 
          onClick={() => handleBreadcrumbClick(-1)} 
          className={`flex items-center hover:bg-background px-2 py-1 rounded transition-colors ${navStack.length === 0 ? "font-bold text-foreground bg-background shadow-sm" : "hover:text-primary"}`}
        >
          <Home className="w-4 h-4 mr-2" /> Root
        </button>
        {navStack.map((folder, idx) => (
          <React.Fragment key={folder.id}>
            <ChevronRight className="w-4 h-4 opacity-40" />
            <button
              onClick={() => handleBreadcrumbClick(idx)}
              className={`flex items-center hover:bg-background px-2 py-1 rounded transition-colors max-w-[150px] truncate ${
                idx === navStack.length - 1 ? "font-bold text-foreground bg-background shadow-sm" : "hover:text-primary"
              }`}
            >
              <Folder className="w-3 h-3 mr-2 opacity-70" />
              {folder.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Table Content */}
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
            <p>Loading archives...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-64 gap-2 text-destructive">
            <p>Failed to load archives. Ensure you have admin permissions.</p>
            <Button variant="outline" onClick={refetch}>Retry</Button>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground/60">
            <Folder className="w-16 h-16 mb-4 opacity-10" />
            <p>No archived items in this location.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead className="min-w-[200px]">Name</TableHead>
                  <TableHead className="min-w-[150px]">Original Path</TableHead>
                  <TableHead className="min-w-[130px]">
                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Archived At</div>
                  </TableHead>
                  <TableHead className="min-w-[130px]">
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> Restore At</div>
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    <div className="flex items-center gap-1"><User className="w-3 h-3" /> Archived By</div>
                  </TableHead>
                  <TableHead className="min-w-[100px]">Remaining</TableHead>
                  <TableHead className="min-w-[180px]">
                    <div className="flex items-center gap-1"><StickyNote className="w-3 h-3" /> Note</div>
                  </TableHead>
                  <TableHead className="text-right w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Folders */}
                {folders.map((folder) => (
                  <TableRow 
                    key={`f-${folder.id}`} 
                    className="group hover:bg-muted/40 cursor-pointer transition-colors" 
                    onDoubleClick={() => handleNavigate(folder)}
                  >
                    <TableCell><Folder className="w-5 h-5 text-amber-500 fill-amber-500/20" /></TableCell>
                    <TableCell className="font-medium">
                      <button onClick={() => handleNavigate(folder)} className="hover:underline text-left text-foreground">
                        {folder.fol_name}
                      </button>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]" title={folder.fol_path}>
                      {folder.fol_path || "-"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(folder.archived_at)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {folder.archived_until ? formatDateTime(folder.archived_until) : "Permanent"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {folder.archived_by?.username || "-"}
                    </TableCell>
                    <TableCell>
                      {getRemainingTime(folder.archived_until)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="truncate max-w-[180px]" title={folder.archived_note}>
                        {folder.archived_note || <span className="opacity-30">-</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs bg-green-50/50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800" 
                        onClick={() => handleRestoreClick("folder", { id: folder.id, name: folder.fol_name })}
                        disabled={restoringFolder}
                      >
                        <RotateCcw className="w-3 h-3 mr-1.5" /> Restore Folder
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Documents */}
                {documents.map((doc) => (
                  <TableRow key={`d-${doc.id}`} className="hover:bg-muted/40 transition-colors">
                    <TableCell><FileText className="w-5 h-5 text-blue-500" /></TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">{doc.doc_title}</span>
                        {doc.doc_code && <span className="text-[10px] text-muted-foreground">{doc.doc_code}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]" title={doc.doc_path}>
                      {doc.doc_path}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(doc.archived_at)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {doc.archived_until ? formatDateTime(doc.archived_until) : "Permanent"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {doc.archived_by?.username || "-"}
                    </TableCell>
                    <TableCell>
                      {getRemainingTime(doc.archived_until)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="truncate max-w-[180px]" title={doc.archive_note}>
                        {doc.archive_note || <span className="opacity-30">-</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={() => handlePreview(doc.download_url)} 
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={() => { setHistoryDocId(doc.id); setHistoryOpen(true); }} 
                          title="History"
                        >
                          <History className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={() => { setEditDocId(doc.id); setEditOpen(true); }} 
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs ml-1 bg-green-50/50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800" 
                          onClick={() => handleRestoreClick("doc", { id: doc.id, name: doc.doc_title })}
                          disabled={restoringDoc}
                        >
                          <RotateCcw className="w-3 h-3 mr-1.5" /> Restore
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* History Modal */}
      <DocumentHistoryDialog 
        open={historyOpen} 
        documentId={historyDocId} 
        onOpenChange={(v) => { setHistoryOpen(v); if (!v) setHistoryDocId(null); }} 
      />
      
      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) setEditDocId(null); }}>
        <DialogContent className="w-[96vw] max-w-3xl">
          <DialogHeader><DialogTitle>Edit Document Metadata</DialogTitle></DialogHeader>
          {editDocId && (
            <EditDocumentForm 
              documentId={editDocId} 
              onClose={async () => { setEditOpen(false); setEditDocId(null); try { await refetch(); } catch {} }} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Restore</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Are you sure you want to restore the {itemToRestore?.type} <strong className="text-foreground">"{itemToRestore?.name}"</strong>?
            <br />
            It will be moved back to its original location in the active workspace.
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={executeRestore} disabled={restoringDoc || restoringFolder}>
              {(restoringDoc || restoringFolder) && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}