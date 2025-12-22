import React, { useState, useEffect } from "react";
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
import { useGetDepartementsQuery } from "@/Slices/departementSlice";
import { useGetFoldersQuery } from "@/Slices/documentSlice";
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  CloudUpload,
  FileUp,
} from "lucide-react";
import {
  useGetDocumentNatureQuery,
  useCreateDocumentMutation,
} from "@/Slices/documentSlice";
import mlean from "@/lib/mlean";
import { toast } from "sonner";

/**
 * BatchCreateDocumentsForm
 * - Allows selecting multiple files at once
 * - Renders a collapsible card for every selected file with per-file inputs
 * - Calls `onSubmit(items)` where items is an array of { file, doc_title, doc_category, doc_status, doc_departement, doc_description }
 */
export default function BatchCreateDocumentsForm({
  onSubmit,
  disabled,
  currentUser,
  currentUserId,
}) {
  const { data: departements } = useGetDepartementsQuery();
  const { data: folders } = useGetFoldersQuery();
  const { data: natures } = useGetDocumentNatureQuery();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [perimetersOptions, setPerimetersOptions] = useState([]);
  const [selectedPerimeters, setSelectedPerimeters] = useState([]);

  const getFileExt = (file) => {
    if (!file) return "unknown";
    const name = file.name || "";
    const idx = name.lastIndexOf(".");
    if (idx > -1) return name.slice(idx + 1).toLowerCase();
    if (file.type) {
      const mt = String(file.type).split("/").pop();
      return mt || "unknown";
    }
    return "unknown";
  };

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    const newItems = files.map((f) => ({
      id: `${Date.now()}_${f.name}`,
      file: f,
      doc_title: "",
      doc_path: "/",
      doc_status: "pending",
      doc_departement: departements?.[0]?.id ? String(departements[0].id) : "",
      doc_nature: natures?.[0]?.id ? String(natures[0].id) : "",
      doc_perimeters: "",
      doc_description: "",
      expanded: true,
      uploading: false,
      progress: 0,
      result: null,
    }));

    setItems((s) => [...s, ...newItems]);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await mlean.fetchPerimeters();
        if (!mounted) return;
        setPerimetersOptions(Array.isArray(p) ? p : p.results || []);
      } catch (e) {
        console.debug("Mlean perimeters fetch failed:", e);
      }
    })();
    return () => (mounted = false);
  }, []);

  const updateItem = (id, patch) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  };

  const removeItem = (id) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const [createDocument] = useCreateDocumentMutation();

  const handleSubmit = async (ev) => {
    ev?.preventDefault();
    setError(null);
    if (!items.length) {
      setError("No files selected");
      return;
    }

    const uploaderId =
      currentUserId || (currentUser && currentUser.id) || undefined;
    const results = [];

    // Upload sequentially to keep server load predictable and preserve order
    for (const it of items) {
      updateItem(it.id, { uploading: true, progress: 0 });
      try {
        const fd = new FormData();
        fd.append("file", it.file, it.file.name);
        if (it.doc_departement)
          fd.append("doc_departement", String(it.doc_departement));
        if (it.doc_nature) fd.append("doc_nature", String(it.doc_nature));
        if (uploaderId) fd.append("doc_owner", String(uploaderId));
        if (it.doc_path)
          fd.append("doc_path", String(it.doc_path).replace(/^\/+|\/+$/g, ""));
        if (it.doc_title) fd.append("doc_title", String(it.doc_title));
        if (it.doc_status) fd.append("doc_status", String(it.doc_status));
        if (it.doc_description)
          fd.append("doc_description", String(it.doc_description));

        const resp = await createDocument(fd).unwrap();
        updateItem(it.id, { uploading: false, result: resp });
        // After local save, attempt to sync to mlean (frontend-only)
        try {
          const perims = it.doc_perimeters
            ? [Number(it.doc_perimeters)]
            : (selectedPerimeters || []).map((x) =>
                Number(x) ? Number(x) : x
              );
          await mlean.syncDocumentToMlean({ name: it.doc_title || it.file.name, file: it.file, perimeters: perims });
        } catch (me) {
          console.error("Mlean sync error:", me);
          toast.error(`Mlean sync failed for ${it.file.name}`);
        }
        results.push({ id: it.id, ok: true, resp });
      } catch (err) {
        console.error("upload failed for", it.file?.name, err);
        updateItem(it.id, { uploading: false, result: err });
        results.push({ id: it.id, ok: false, error: err });
      }
    }

    // Remove successful items from UI
    const failedIds = results.filter((r) => !r.ok).map((r) => r.id);
    setItems((prev) => prev.filter((it) => failedIds.includes(it.id)));

    if (typeof onSubmit === "function") {
      try {
        await onSubmit(results, { setItems });
      } catch (e) {
        console.debug("onSubmit callback error", e);
      }
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
                  <FileUp
                    className="w-10 h-10 mb-3 text-primary"
                    strokeWidth={1.25}
                  />
                  <p className="text-sm text-base-content/80">
                    <span className="font-medium text-primary">
                      Click to upload{" "}
                    </span>
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
                <Card
                  key={it.id}
                  className=" border-[0.1px] border-muted  py-4"
                >
                  <div className="  flex flex-col gap-2 ">
                    <div className="flex items-center justify-between px-3">
                      <div className="flex  gap-3 items-center">
                        <div className="text-xs text-muted-foreground uppercase bg-secondary p-2 rounded-xs">
                          {getFileExt(it.file)}
                        </div>
                        <div className="font-medium truncate max-w-[40ch]">
                          {it.file.name}
                        </div>
                        <div className="text-sm text-muted-foreground/60">
                          {Math.round(it.file.size / 1024)} KB
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="text-sm"
                          onClick={() =>
                            updateItem(it.id, { expanded: !it.expanded })
                          }
                        >
                          {it.expanded ? (
                            <ChevronUp
                              className="text-muted-foreground/80"
                              strokeWidth={1.25}
                              size={16}
                            />
                          ) : (
                            <ChevronDown
                              className="text-muted-foreground/70"
                              strokeWidth={1.25}
                              size={16}
                            />
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
                            onChange={(e) =>
                              updateItem(it.id, { doc_title: e.target.value })
                            }
                          />
                        </div>
                        <div className="md:col-span-1">
                          <label className="block text-sm mb-1">
                            Departement
                          </label>
                          <Select
                            value={String(it.doc_departement || "")}
                            onValueChange={(v) =>
                              updateItem(it.id, { doc_departement: v })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Départements</SelectLabel>
                                {departements?.map((dep) => (
                                  <SelectItem
                                    key={dep.id}
                                    value={String(dep.id)}
                                  >
                                    {dep.dep_name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-1">
                          <label className="block text-sm mb-1">Périmètre (Mlean)</label>
                          <Select
                            value={String(it.doc_perimeters || "")}
                            onValueChange={(v) =>
                              updateItem(it.id, { doc_perimeters: v })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Périmètres</SelectLabel>
                                {(perimetersOptions || []).map((p) => (
                                  <SelectItem key={p.id} value={String(p.id)}>
                                    {p.name || p.title || p.label || p.perimeter || String(p.id)}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-1">
                          <label className="block text-sm mb-1">Nature</label>
                          <Select
                            value={String(it.doc_nature || "")}
                            onValueChange={(v) =>
                              updateItem(it.id, { doc_nature: v })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Natures</SelectLabel>
                                {natures?.map((n) => (
                                  <SelectItem key={n.id} value={String(n.id)}>
                                    {n.nat_name || n.name || `${n.id}`}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Folder</label>
                          <Select
                            value={it.doc_path}
                            onValueChange={(v) =>
                              updateItem(it.id, { doc_path: v })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Folders</SelectLabel>
                                <SelectItem value="/">Root</SelectItem>
                                {(folders || []).map((f) => {
                                  // folders may be strings or objects
                                  if (!f) return null;
                                  if (typeof f === "string") {
                                    return (
                                      <SelectItem key={f} value={String(f)}>
                                        {String(f)}
                                      </SelectItem>
                                    );
                                  }
                                  const label = `${f.fol_index || ""} ${
                                    f.fol_name || f.fol_path || ""
                                  }`.trim();
                                  const value = String(
                                    f.fol_path || f.path || f.fol_name || ""
                                  );
                                  return (
                                    <SelectItem
                                      key={String(f.id || value)}
                                      value={value}
                                    >
                                      {label}
                                    </SelectItem>
                                  );
                                })}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="block text-sm mb-1">Status</label>
                          <Select
                            value={it.doc_status}
                            onValueChange={(v) =>
                              updateItem(it.id, { doc_status: v })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Statuts</SelectLabel>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">
                                  Approved
                                </SelectItem>
                                <SelectItem value="rejected">
                                  Rejected
                                </SelectItem>
                                <SelectItem value="archived">
                                  Archived
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="md:col-span-4">
                          <label className="block text-sm mb-1">
                            Description
                          </label>
                          <Textarea
                            value={it.doc_description}
                            onChange={(e) =>
                              updateItem(it.id, {
                                doc_description: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={disabled}>
                {disabled ? "Uploading..." : "Submit"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setItems([])}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
