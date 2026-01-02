import React, { useEffect, useMemo, useState } from "react";
import {
  useGetDocumentByIdQuery,
  useUpdateDocumentMutation,
} from "@/slices/documentSlice";
import { Button } from "@/components/ui/button";
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
import mlean from "@/lib/mlean";
import { toast } from "sonner";

export default function EditDocumentForm({ documentId, onClose }) {
  const { data: document, isLoading: loadingDoc, refetch } =
    useGetDocumentByIdQuery(documentId, {
      skip: !documentId,
      refetchOnMountOrArgChange: true,
    });

  const [updateDocument, { isLoading: isSaving }] = useUpdateDocumentMutation();

  const [step, setStep] = useState(1);
  const [description, setDescription] = useState("");

  // single source of truth
  const [updateType, setUpdateType] = useState("AUDITABLE"); // "AUDITABLE" | "MINOR"
  const isMinor = updateType === "MINOR";

  const [file, setFile] = useState(null);

  // mLean perimeters
  const [perimetersOptions, setPerimetersOptions] = useState([]);
  const [mleanPerimeterId, setMleanPerimeterId] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await mlean.fetchPerimeters();
        if (!mounted) return;
        const list = Array.isArray(p) ? p : p?.results || [];
        setPerimetersOptions(list);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!document) return;
    setDescription(document.doc_description ?? document.docdescription ?? "");
  }, [document]);

  useEffect(() => {
    if (!isMinor) {
      setFile(null);
      setStep(1);
    }
  }, [isMinor]);

  function resetAndClose() {
    setStep(1);
    setFile(null);
    onClose?.();
  }

  const perimeters = useMemo(() => {
    const n = Number(mleanPerimeterId);
    return Number.isFinite(n) && n > 0 ? [n] : [];
  }, [mleanPerimeterId]);

  async function handleSubmit(e) {
    e?.preventDefault?.();

    try {
      const standardRootId = document?.mlean_standard_id || null;

      // Not linked to mLean => local-only update is allowed
      if (!standardRootId) {
        if (isMinor) {
          if (!file) {
            toast.error("Choose a file for Minor changes.");
            return;
          }
          const fd = new FormData();
          fd.append("update_type", "MINOR");
          // FIX: Use the user's description as the version comment
          fd.append("version_comment", description || "Minor changes");
          fd.append("doc_description", description || "");
          fd.append("file", file);

          await updateDocument({ id: documentId, data: fd }).unwrap();
        } else {
          await updateDocument({
            id: documentId,
            data: {
              update_type: "AUDITABLE",
              // FIX: Use the user's description as the version comment
              version_comment: description || "Auditable update",
              doc_description: description || "",
            },
          }).unwrap();
        }

        await refetch?.();
        resetAndClose();
        return;
      }

      // Linked to mLean => perimeter required
      if (!perimeters.length) {
        toast.error(
          "mLean requires at least one perimeter. Select a perimeter then retry."
        );
        return;
      }

      // CRITICAL FIX: Identify the ID of the node we are evolving FROM (the current version)
      const previousPaperStandardId = document?.mlean_paper_standard_id;

      if (isMinor) {
        if (!file) {
          toast.error("Choose a file for Minor changes.");
          return;
        }

        // 1) mLean minor update
        const r = await mlean.minorChangesUpdateViaPaperStandards({
          standardRootId,
          previousPaperStandardId,
          name: document?.doc_title || document?.doctitle || file.name,
          file,
          description: description || "",
          perimeters,
        });

        const newRootId = r?.standardRootId ?? standardRootId;
        const newPaperId = r?.newPaperStandardId ?? document?.mlean_paper_standard_id;

        // 2) Local update WITH FILE
        const fd = new FormData();
        fd.append("update_type", "MINOR");
        // FIX: Use description for history comment
        fd.append("version_comment", description || "Minor changes");
        fd.append("doc_description", description || "");
        fd.append("file", file);

        if (r?.remoteDocId != null) fd.append("mlean_document_id", String(r.remoteDocId));
        if (newPaperId != null) fd.append("mlean_paper_standard_id", String(newPaperId));
        fd.append("mlean_standard_id", String(newRootId));

        await updateDocument({ id: documentId, data: fd }).unwrap();
      } else {
        // AUDITABLE
        const currentDocumentId = document?.mlean_document_id;
        if (!currentDocumentId) {
          toast.error(
            "Missing mLean document id on this record (mlean_document_id)."
          );
          return;
        }

        // 1) mLean auditable update
        const r = await mlean.auditableUpdateViaPaperStandards({
          standardRootId,
          currentDocumentId,
          previousPaperStandardId,
          name: document?.doc_title || document?.doctitle || "Standard",
          description: description || "",
          perimeters,
          is_minor_version: false,
        });

        const newRootId = r?.standardRootId ?? standardRootId;
        const newPaperId = r?.newPaperStandardId ?? document?.mlean_paper_standard_id;

        // 2) Local metadata-only update (no file)
        await updateDocument({
          id: documentId,
          data: {
            update_type: "AUDITABLE",
            // FIX: Use description for history comment
            version_comment: description || "Auditable update",
            doc_description: description || "",
            mlean_paper_standard_id: newPaperId,
            mlean_standard_id: newRootId,
          },
        }).unwrap();
      }

      await refetch?.();
      resetAndClose();
    } catch (err) {
      console.error("Failed to update document", err);
      toast.error(err?.data?.detail || err?.message || "Failed to update document");
    }
  }

  if (!documentId) return null;
  if (loadingDoc) return <div>Loading…</div>;

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div className="flex items-center gap-4 mb-2">
        <div
          className={`flex items-center gap-2 ${
            step === 1 ? "font-medium" : "text-muted-foreground"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              step === 1 ? "bg-primary text-white" : "bg-muted/10"
            }`}
          >
            1
          </div>
          <div>Information</div>
        </div>

        <div
          className={`flex items-center gap-2 ${
            step === 2 ? "font-medium" : "text-muted-foreground"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              step === 2 ? "bg-primary text-white" : "bg-muted/10"
            }`}
          >
            2
          </div>
          <div>File</div>
        </div>
      </div>

      {step === 1 && (
        <>
          <div>
            <label className="block text-sm mb-1">mLean perimeter (required)</label>
            <Select
              value={String(mleanPerimeterId || "")}
              onValueChange={(v) => setMleanPerimeterId(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select perimeter" />
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

          <div>
            <label className="block text-sm mb-1">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Update type</label>
            <Select value={updateType} onValueChange={(v) => setUpdateType(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select update type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Types</SelectLabel>
                  <SelectItem value="AUDITABLE">Auditable</SelectItem>
                  <SelectItem value="MINOR">Minor changes</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            {isMinor ? (
              <Button type="button" onClick={() => setStep(2)}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save"}
              </Button>
            )}
          </div>
        </>
      )}

      {step === 2 && isMinor && (
        <>
          <div>
            <label className="block text-sm mb-1">
              Replace file (mLean + Local)
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex justify-between gap-2">
            <Button variant="ghost" type="button" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit" disabled={isSaving || !file}>
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}