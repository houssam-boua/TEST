import React from "react";
import { useParams } from "react-router-dom";
import OnlyOfficeEditor from "@/components/blocks/OnlyOfficeEditor";

export default function EditDocument() {
  const { id } = useParams();

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Edit document</h2>
      {id ? (
        <OnlyOfficeEditor docId={id} />
      ) : (
        <div>Select a document to edit.</div>
      )}
    </div>
  );
}
