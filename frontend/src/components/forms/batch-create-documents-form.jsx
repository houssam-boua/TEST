import React, { useState } from "react";
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

/**
 * BatchCreateDocumentsForm
 * - Allows selecting multiple files at once
 * - Renders a collapsible card for every selected file with per-file inputs
 * - Calls `onSubmit(items)` where items is an array of { file, doc_title, doc_category, doc_status, doc_departement, doc_description }
 */
export default function BatchCreateDocumentsForm({ onSubmit, disabled }) {
  const { data: departements } = useGetDepartementsQuery();
  const { data: folders } = useGetFoldersQuery();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

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
      doc_description: "",
      expanded: true,
      uploading: false,
      progress: 0,
      result: null,
    }));

    setItems((s) => [...s, ...newItems]);
  };

  const updateItem = (id, patch) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  };

  const removeItem = (id) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const handleSubmit = async (ev) => {
    ev?.preventDefault();
    setError(null);
    if (!onSubmit) return;
    if (!items.length) {
      setError("No files selected");
      return;
    }

    // Prepare payload and forward to parent
    try {
      const payload = items.map(
        ({
          file,
          doc_title,
          doc_path,
          doc_status,
          doc_departement,
          doc_description,
        }) => ({
          file,
          doc_title,
          doc_path,
          doc_status,
          doc_departement,
          doc_description,
        })
      );

      await onSubmit(payload, { setItems });
    } catch (err) {
      console.error("BatchCreateDocumentsForm submit error:", err);
      setError(err?.message || String(err));
      throw err;
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
                                {(folders?.folders || []).length === 0 ? (
                                  <SelectItem value="/">Root</SelectItem>
                                ) : (
                                  [
                                    <SelectItem key="/" value="/">
                                      Root
                                    </SelectItem>,
                                    ...(folders?.folders || []).map((f) => (
                                      <SelectItem
                                        key={String(f)}
                                        value={String(f)}
                                      >
                                        {String(f)}
                                      </SelectItem>
                                    )),
                                  ]
                                )}
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
