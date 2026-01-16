import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetDepartementsQuery } from "@/slices/departementSlice";
import {
  useGetFoldersQuery,
  useGetDocumentNatureQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useGetSitesQuery,
  useGetDocumentTypesQuery,
  useGetDocumentCodesQuery
} from "@/slices/documentSlice";
import { Trash2, ChevronDown, ChevronUp, FileUp, Loader2 } from "lucide-react";
import mlean from "@/lib/mlean";
import { toast } from "sonner";

export default function BatchCreateDocumentsForm({
  onSubmit,
  disabled,
  currentUser,
  currentUserId,
}) {
  const { data: departements = [] } = useGetDepartementsQuery();
  const { data: folders = [] } = useGetFoldersQuery();
  const { data: natures = [] } = useGetDocumentNatureQuery();
  const { data: sites = [] } = useGetSitesQuery();
  const { data: docTypes = [] } = useGetDocumentTypesQuery();
  const { data: docCodes = [] } = useGetDocumentCodesQuery();

  // ✅ Check if user can select department/site (Admin OR has permission)
  const canSelectDeptSite = 
    currentUser?.role?.role_name === 'admin' || 
    currentUser?.permissions?.includes('documents.can_create_cross_department');

  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [perimetersOptions, setPerimetersOptions] = useState([]);

  const [createDocument] = useCreateDocumentMutation();
  const [updateDocument] = useUpdateDocumentMutation();

  const safeFileName = (file) => file?.name || "file";

  const getFileExt = (file) => {
    if (!file) return "unknown";
    const name = file.name || "";
    const idx = name.lastIndexOf(".");
    if (idx > -1) return name.slice(idx + 1).toLowerCase();
    if (file.type) return String(file.type).split("/").pop() || "unknown";
    return "unknown";
  };

  const asPerimeters = (value) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? [n] : [];
  };

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    const newItems = files.map((f) => ({
      id: `${Date.now()}_${f.name}`,
      file: f,

      doc_title: "",
      doc_path: "/",
      parent_folder: "",
      doc_departement: "",
      doc_nature: natures?.[0]?.id ? String(natures[0].id) : "",
      site: "",
      document_type: "",
      doc_perimeters: "",
      doc_description: "",
      document_code: "",

      expanded: true,
      uploading: false,
      result: null,
    }));

    setItems((s) => [...s, ...newItems]);
  };

  // Fetch mLean Perimeters
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await mlean.fetchPerimeters();
        if (!mounted) return;
        const list = Array.isArray(p) ? p : p?.results || [];
        setPerimetersOptions(list);
      } catch (e) {
        console.error("Mlean perimeters fetch failed:", e);
        if(mounted) {
            toast.error("Failed to load mLean Perimeters. Please check your connection.");
            setPerimetersOptions([]);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const updateItem = (id, patch) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const removeItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  const extractLocalDocumentId = (resp) => Number(resp?.document?.id || resp?.id || 0) || null;

  const handleSubmit = async (ev) => {
    ev?.preventDefault?.();
    setError(null);

    if (!items.length) {
      setError("No files selected");
      return;
    }

    const uploaderId = currentUserId || currentUser?.id || undefined;
    const results = [];

    for (const it of items) {
      updateItem(it.id, { uploading: true });

      let localDocId = null;
      let mleanOk = false;

      try {
        // 1. Create Local Document
        const fd = new FormData();
        fd.append("file", it.file, safeFileName(it.file));

        if (it.doc_departement) fd.append("doc_departement", String(it.doc_departement));
        if (it.doc_nature) fd.append("doc_nature", String(it.doc_nature));
        if (uploaderId) fd.append("doc_owner", String(uploaderId));
        if (it.parent_folder) fd.append("parent_folder", String(it.parent_folder));
        if (it.doc_path) fd.append("doc_path", String(it.doc_path).replace(/^\/+|\/+$/g, ""));
        if (it.doc_title) fd.append("doc_title", String(it.doc_title));
        if (it.doc_status) fd.append("doc_status", String(it.doc_status));
        if (it.doc_description) fd.append("doc_description", String(it.doc_description));
        
        // New Fields
        if (it.site) fd.append("site", String(it.site));
        if (it.document_type) fd.append("document_type", String(it.document_type));
        if (it.document_code) fd.append("document_code", String(it.document_code)); // ✅ FIXED: Moved here

        const resp = await createDocument(fd).unwrap();
        localDocId = extractLocalDocumentId(resp);

        // 2. Sync to mLean
        try {
          const perims = asPerimeters(it.doc_perimeters);

          if (!perims.length) {
            toast.error(`Warning: No perimeter selected for ${safeFileName(it.file)}. Skipping mLean sync.`);
          } else {
            const m = await mlean.syncDocumentToMlean({
              name: it.doc_title || safeFileName(it.file),
              file: it.file,
              perimeters: perims,
              description: it.doc_description || "",
            });

            // 3. Update Local Document with mLean IDs
            if (localDocId) {
              await updateDocument({
                id: localDocId,
                data: {
                  mlean_document_id: m.mlean_document_id ?? null,
                  mlean_paper_standard_id: m.mlean_paper_standard_id ?? null,
                  mlean_standard_id: m.mlean_standard_id ?? null,
                  update_type: "SILENT",
                },
              }).unwrap();
            }
            mleanOk = true;
          }
        } catch (me) {
          console.error("mLean sync error:", me);
          toast.error(`mLean sync failed for ${safeFileName(it.file)}`);
        }

        updateItem(it.id, { uploading: false, result: { local: resp, mleanOk } });

        results.push({
          id: it.id,
          ok: true,
          resp,
          file: it.file,
          fileName: safeFileName(it.file),
          localDocId,
          mleanOk,
        });
      } catch (err) {
        console.error("upload failed for", safeFileName(it.file), err);
        updateItem(it.id, { uploading: false, result: err });
        results.push({
          id: it.id,
          ok: false,
          error: err,
          file: it.file,
          fileName: safeFileName(it.file),
          localDocId,
          mleanOk,
        });
      }
    }

    const failedIds = results.filter((r) => !r.ok).map((r) => r.id);
    setItems((prev) => prev.filter((it) => failedIds.includes(it.id)));

    if (typeof onSubmit === "function") {
      await onSubmit(results, { setItems });
    }
  };

  return (
    <div className={cn("flex flex-col gap-4")}>
      <Card className="border-4 border-border ">
        <CardHeader>
          <CardTitle>Upload multiple documents</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="batch-files"
                onDrop={(e) => {
                  e.preventDefault();
                  const list = e.dataTransfer?.files ?? null;
                  if (list && list.length) handleFiles(list);
                }}
                onDragOver={(e) => e.preventDefault()}
                className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-muted rounded-xl cursor-pointer bg-base-200/10 hover:border-primary/60 hover:bg-base-200/20 transition-colors duration-200 ease-in-out"
              >
                <div className="flex flex-col items-center justify-center p-5 text-center">
                  <FileUp className="w-10 h-10 mb-3 text-primary" strokeWidth={1.25} />
                  <p className="text-sm text-base-content/80">
                    <span className="font-medium text-primary">Click to upload </span>
                    or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground/50 mt-1">
                    PDF, DOC, XLS, or images (MAX. 10MB)
                  </p>
                </div>

                <input
                  id="batch-files"
                  type="file"
                  multiple
                  accept="*/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </label>
            </div>

            {error && <div className="text-destructive">{error}</div>}

            <div className="flex flex-col gap-3">
              {items.map((it) => (
                <BatchItem 
                  key={it.id} 
                  item={it} 
                  updateItem={updateItem} 
                  removeItem={removeItem}
                  docCodes={docCodes}
                  sites={sites}
                  docTypes={docTypes}
                  departements={departements}
                  folders={folders}
                  natures={natures}
                  perimetersOptions={perimetersOptions}
                  getFileExt={getFileExt}
                  safeFileName={safeFileName}
                  canSelectDeptSite={canSelectDeptSite}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={disabled || items.length === 0}>
                {disabled ? "Uploading..." : "Submit All"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setItems([])}>
                Clear All
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function BatchItem({ 
  item: it, 
  updateItem, 
  removeItem, 
  sites, 
  docTypes, 
  departements, 
  folders, 
  natures, 
  perimetersOptions,
  getFileExt,
  safeFileName,
  docCodes,
  canSelectDeptSite
}) {
  
  // Filter departments based on selected site
  const filteredDepartments = useMemo(() => {
    if (!it.site) return [];
    return departements.filter((d) => {
      const dSiteId = (d.site && typeof d.site === 'object') ? d.site.id : d.site;
      return String(dSiteId) === String(it.site);
    });
  }, [departements, it.site]);

  return (
    <Card className="border-[0.1px] border-muted py-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-3">
          <div className="flex gap-3 items-center">
            <div className="text-xs text-muted-foreground uppercase bg-secondary p-2 rounded-xs">
              {getFileExt(it.file)}
            </div>
            <div className="font-medium truncate max-w-[40ch]">{safeFileName(it.file)}</div>
            <div className="text-sm text-muted-foreground/60">
              {Math.round((it.file?.size || 0) / 1024)} KB
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-sm"
              onClick={() => updateItem(it.id, { expanded: !it.expanded })}
            >
              {it.expanded ? (
                <ChevronUp className="text-muted-foreground/80" strokeWidth={1.25} size={16} />
              ) : (
                <ChevronDown className="text-muted-foreground/70" strokeWidth={1.25} size={16} />
              )}
            </button>

            <button
              type="button"
              className="text-destructive"
              onClick={() => removeItem(it.id)}
            >
              <Trash2 size={16} strokeWidth={1.25} />
            </button>
          </div>
        </div>

        {it.expanded && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4 p-5 bg-muted/25">
            
            <div className="col-span-1 md:col-span-1">
              <label className="block text-sm mb-1">Title</label>
              <Input
                value={it.doc_title}
                onChange={(e) => updateItem(it.id, { doc_title: e.target.value })}
              />
            </div>

            {/* ✅ Site - Only visible for users with permission */}
            {canSelectDeptSite && (
              <div className="col-span-1 md:col-span-1">
                <label className="block text-sm mb-1">Site</label>
                <Select
                  value={String(it.site || "")}
                  onValueChange={(v) => {
                      updateItem(it.id, { 
                          site: v,
                          doc_departement: "" 
                      });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Sites</SelectLabel>
                      {sites?.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Type */}
            <div className="col-span-1 md:col-span-1">
              <label className="block text-sm mb-1">Type</label>
              <Select
                value={String(it.document_type || "")}
                onValueChange={(v) => updateItem(it.id, { document_type: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Types</SelectLabel>
                    {docTypes?.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name} ({t.code})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* ✅ Department - Only visible for users with permission (Filtered by Site) */}
            {canSelectDeptSite && (
              <div className="md:col-span-1">
                <label className="block text-sm mb-1">Departement</label>
                <Select
                  value={String(it.doc_departement || "")}
                  onValueChange={(v) => updateItem(it.id, { doc_departement: v })}
                  disabled={!it.site}
                >
                  <SelectTrigger className="w-full">
                      <SelectValue placeholder={!it.site ? "Select Site First" : "Select Dept"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Départements</SelectLabel>
                      {filteredDepartments.map((dep) => (
                        <SelectItem key={dep.id} value={String(dep.id)}>
                          {dep.dep_name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* mLean Perimeter */}
            <div className="md:col-span-1">
              <label className="block text-sm mb-1">Perimeters (required)</label>
              <Select
                value={String(it.doc_perimeters || "")}
                onValueChange={(v) => updateItem(it.id, { doc_perimeters: v })}
              >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Perimeter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Perimeters</SelectLabel>
                    {(perimetersOptions || []).map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p?.name || p?.title || p?.label || `#${p.id}`}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* ✅ Document Code Field */}
            <div className="md:col-span-1">
              <label className="block text-sm mb-1">Code de Document</label>
              <Select
                value={String(it.document_code || "")}
                onValueChange={(v) => updateItem(it.id, { document_code: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Codes</SelectLabel>
                    {docCodes?.map((dc) => (
                      <SelectItem key={dc.id} value={String(dc.id)}>
                        {dc.code} - {dc.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm mb-1">Folder</label>
              <Select
                value={String(it.parent_folder || it.doc_path || "")}
                onValueChange={(v) => {
                  const asId = String(v);
                  const found = (folders || []).find(
                    (ff) => ff && typeof ff === "object" && String(ff.id) === asId
                  );

                  if (found) {
                    updateItem(it.id, {
                      parent_folder: String(found.id),
                      doc_path: String(found.fol_path || found.folpath || ""),
                    });
                  } else if (v === "/") {
                    updateItem(it.id, { parent_folder: "", doc_path: "/" });
                  } else {
                    updateItem(it.id, { parent_folder: "", doc_path: String(v) });
                  }
                }}
              >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Folders</SelectLabel>
                    <SelectItem value="/">Root</SelectItem>
                    {(folders || []).map((f) => {
                      if (!f) return null;
                      const label = `${f.fol_index || ""} ${f.fol_name || f.fol_path || ""}`.trim();
                      return (
                        <SelectItem key={String(f.id)} value={String(f.id)}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-4">
              <label className="block text-sm mb-1">Description</label>
              <Textarea
                value={it.doc_description}
                onChange={(e) => updateItem(it.id, { doc_description: e.target.value })}
                placeholder="Description of the document"
              />
            </div>
          </div>
        )}

        {it.uploading && (
          <div className="px-3 text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
          </div>
        )}
      </div>
    </Card>
  );
}
