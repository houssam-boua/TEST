import React, { useCallback, useState, useContext } from "react";
import BatchCreateDocumentsForm from "@/components/forms/batch-create-documents-form";
import { useCreateDocumentMutation } from "@/slices/documentSlice";
import { toast } from "sonner";
import { AuthContext } from "@/Context/AuthContextDefinition";

export default function CreateDocumentsBatch() {
  const [createDocument] = useCreateDocumentMutation();
  const [uploading, setUploading] = useState(false);

  const auth = useContext(AuthContext);
  const userId = auth?.userId ?? auth?.user?.id ?? null;

  const parseApiError = (err) => {
    try {
      if (!err) return "Erreur inconnue";
      const data = err.data ?? err;
      if (typeof data === "string") {
        const stripped = data.replace(/<[^>]+>/g, "").trim();
        if (stripped)
          return stripped.length > 250
            ? stripped.slice(0, 250) + "..."
            : stripped;
        return `Server error (status ${
          err.status ?? err.originalStatus ?? 500
        })`;
      }
      if (typeof data === "object") {
        return data.message || data.error || JSON.stringify(data);
      }
      return String(err?.message ?? err);
    } catch {
      return "Erreur lors du traitement de la réponse du serveur";
    }
  };

  const handleBatchSubmit = useCallback(
    async (items, { setItems } = {}) => {
      setUploading(true);
      try {
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          // Build FormData as expected by createDocument mutation
          const fd = new FormData();
          fd.append("file", it.file);
          fd.append("doc_title", it.doc_title || it.file.name);
          fd.append("doc_status", it.doc_status || "draft");
          if (it.doc_departement)
            fd.append("doc_departement", it.doc_departement);
          fd.append("doc_description", it.doc_description || "");
          // include doc_path when provided (normalize slashes)
          if (it.doc_path) {
            const rawPath = String(it.doc_path || "").trim();
            const normalized = rawPath.replace(/^\/+|\/+$/g, "");
            if (normalized) fd.append("doc_path", normalized);
          }
          // Optional: custom path or category if backend supports it
          // if (it.doc_category) fd.append("doc_category", it.doc_category);
          // Ensure the current authenticated user id is set as doc_owner
          if (userId) fd.set("doc_owner", String(userId));

          // mark uploading state in UI
          if (setItems)
            setItems((prev) =>
              prev.map((p) =>
                p.file === it.file ? { ...p, uploading: true } : p
              )
            );

          try {
            // debug: log doc_path presence in FormData
            try {
              const entries = [];
              fd.forEach((v, k) => entries.push([k, v]));
              console.debug("CreateDocument FormData:", entries);
            } catch (e) {
              console.debug("Failed to serialize FormData for debug", e);
            }

            const res = await createDocument(fd).unwrap();
            if (setItems)
              setItems((prev) =>
                prev.map((p) =>
                  p.file === it.file
                    ? { ...p, uploading: false, result: res }
                    : p
                )
              );
            toast.success(`Uploaded ${it.file.name}`);
          } catch (err) {
            if (setItems)
              setItems((prev) =>
                prev.map((p) =>
                  p.file === it.file
                    ? { ...p, uploading: false, result: { error: String(err) } }
                    : p
                )
              );
            const msg = parseApiError(err) || String(err);
            toast.error(`Failed ${it.file.name}: ${msg}`);
          }
        }
        // final summary toast
        toast.success("Files upload successfully");
      } finally {
        setUploading(false);
      }
    },
    [createDocument, userId]
  );

  return (
    <div className="flex min-h-svh w-full items-start justify-center p-6 md:p-10 bg-muted/5">
      <div className="w-full  space-y-4">
        <BatchCreateDocumentsForm
          onSubmit={handleBatchSubmit}
          disabled={uploading}
        />
      </div>
    </div>
  );
}
