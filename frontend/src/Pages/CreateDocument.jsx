import React, { useContext } from "react";
import { CreateDocumentForm } from "../components/forms/create-document-form";
import { useCreateDocumentMutation } from "@/Slices/documentSlice";
import { toast } from "sonner";
import { AuthContext } from "@/Context/AuthContextDefinition";

const CreateDocument = () => {
  const [createDocument, { isLoading }] = useCreateDocumentMutation();
  const auth = useContext(AuthContext);
  const userId = auth?.userId ?? auth?.user?.id ?? null;

  const handleSubmit = async (values) => {
    // values comes from react-hook-form; may contain a File under `file`
    const formData = new FormData();
    for (const [key, value] of Object.entries(values || {})) {
      if (value === null || value === undefined) continue;
      if (value instanceof File) {
        formData.append("file", value, value.name);
      } else {
        formData.append(key, String(value));
      }
    }

    // Ensure the current authenticated user id is set as doc_owner
    if (userId) {
      // override any provided doc_owner with the authenticated user's id
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
      await createDocument(formData).unwrap();
      toast.success("Document créé");
    } catch (err) {
      console.error("createDocument error:", err);
      const msg = parseApiError(err) || "Erreur lors de la création";
      toast.error(msg);
      throw err;
    }
  };

  return (
    <div className="flex min-h-svh w-full items-start justify-center p-6 md:p-10 bg-muted/5">
      <div className="w-full  space-y-4">
        <CreateDocumentForm onSubmit={handleSubmit} loading={isLoading} />
      </div>
    </div>
  );
};

export default CreateDocument;
