import React from "react";
import { CreateDocumentForm } from "../components/forms/create-document-form";

const CreateDocument = () => {
  return (
    <div className="flex min-h-svh w-full items-start justify-center p-6 md:p-10 bg-muted/5">
      <div className="w-full  space-y-4">
        <CreateDocumentForm />
      </div>
    </div>
  );
};

export default CreateDocument;
