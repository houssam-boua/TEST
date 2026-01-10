import React, { useContext } from "react";
import { CreateDocumentForm } from "../components/forms/create-document-form";
import { 
  useCreateDocumentMutation, 
  useUpdateDocumentMutation 
} from "@/slices/documentSlice";
import { toast } from "sonner";
import { AuthContext } from "@/Context/AuthContextDefinition";
import mlean from "@/lib/mlean"; // ✅ Import mLean helper

const CreateDocument = () => {
  const [createDocument, { isLoading: isCreating }] = useCreateDocumentMutation();
  // ✅ Hook to update the document with mLean IDs after creation
  const [updateDocument, { isLoading: isUpdating }] = useUpdateDocumentMutation();
  
  const auth = useContext(AuthContext);
  const userId = auth?.userId ?? auth?.user?.id ?? null;

  const handleSubmit = async (values) => {
    const toastId = toast.loading("Création du document en cours...");

    // 1. Prepare FormData for Local Creation
    const formData = new FormData();
    for (const [key, value] of Object.entries(values || {})) {
      if (value === null || value === undefined) continue;
      
      // Don't send the perimeter ID to Django directly (it doesn't have this field)
      if (key === 'doc_perimeters') continue; 
      
      if (value instanceof File) {
        formData.append("file", value, value.name);
      } else {
        formData.append(key, String(value));
      }
    }

    // Ensure the current authenticated user id is set as doc_owner
    if (userId) {
      formData.set("doc_owner", String(userId));
    }

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

    try {
      // 2. Create Document Locally
      const response = await createDocument(formData).unwrap();
      const localDocId = response.id || response.document?.id;

      if (!localDocId) {
        throw new Error("Le document a été créé mais aucun ID n'a été retourné.");
      }

      toast.loading("Créé localement. Synchronisation avec mLean...", { id: toastId });

      // 3. Sync to mLean (if file and perimeter exist)
      const fileToSync = values.file;
      const perimeterId = values.doc_perimeters;

      if (fileToSync && perimeterId) {
        try {
          const mleanResp = await mlean.syncDocumentToMlean({
            name: values.doc_title || fileToSync.name,
            file: fileToSync,
            perimeters: [Number(perimeterId)], // mLean expects an array of numbers
            description: values.doc_description || "",
          });

          // 4. Update Local Document with mLean IDs
          await updateDocument({
            id: localDocId,
            data: {
              mlean_document_id: mleanResp.mlean_document_id,
              mlean_paper_standard_id: mleanResp.mlean_paper_standard_id,
              mlean_standard_id: mleanResp.mlean_standard_id,
              update_type: "SILENT", // "SILENT" prevents creating a duplicate history version
            },
          }).unwrap();

          toast.success("Document créé et synchronisé avec mLean !", { id: toastId });

        } catch (mleanErr) {
          console.error("mLean Sync Failed:", mleanErr);
          toast.warning("Document créé localement, mais échec de la synchro mLean.", { id: toastId });
        }
      } else {
        console.warn("Skipping mLean sync: Missing file or perimeter");
        toast.success("Document créé localement (Sans mLean)", { id: toastId });
      }

    } catch (err) {
      console.error("createDocument error:", err);
      const msg = parseApiError(err) || "Erreur lors de la création";
      toast.error(msg, { id: toastId });
      // We don't throw here to avoid unhandled promise rejections if not caught higher up
    }
  };

  return (
    <div className="flex min-h-svh w-full items-start justify-center p-6 md:p-10 bg-muted/5">
      <div className="w-full space-y-4">
        <CreateDocumentForm 
          onSubmit={handleSubmit} 
          loading={isCreating || isUpdating} 
        />
      </div>
    </div>
  );
};

export default CreateDocument;