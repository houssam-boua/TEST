import React from "react";
import { CreateDocumentForm } from "../components/forms/create-document-form";
import { useCreateDocumentMutation } from "@/Slices/documentSlice";

const CreateDocument = () => {
  const [createDocument] = useCreateDocumentMutation();

  const handleCreateDocument = async (formData) => {
    try {
      const res = await createDocument(formData).unwrap();
      console.log("Created document:", res);
      return res;
    } catch (err) {
      console.error("CreateDocument failed:", err);
      // rethrow so the form's catch block shows the error
      throw err;
    }
  };

  return (
    <div className="flex min-h-svh w-full items-start justify-center p-6 md:p-10 bg-muted/5">
      <div className="w-full  space-y-4">
        <CreateDocumentForm onCreate={handleCreateDocument} />
      </div>
    </div>
  );
};

export default CreateDocument;
