import React, { useEffect, useState } from "react";
import {
  useGetDocumentByIdQuery,
  usePatchDocumentMutation,
} from "@/Slices/documentSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function EditDocumentForm({ documentId, onClose }) {
  const { data: document, isLoading: loadingDoc } = useGetDocumentByIdQuery(
    documentId,
    {
      skip: !documentId,
    }
  );
  const [patchDocument, { isLoading: isPatching }] = usePatchDocumentMutation();

  const [step, setStep] = useState(1);
  const [description, setDescription] = useState("");
  const [auditable, setAuditable] = useState(true);
  const [minorChanges, setMinorChanges] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (document) {
      setDescription(document.doc_description || "");
      // if you have an auditable flag on the document, initialize it here
      // setAuditable(document.doc_auditable ?? true);
    }
  }, [document]);

  function resetAndClose() {
    setStep(1);
    setFile(null);
    if (onClose) onClose();
  }

  async function handleSubmit(e) {
    e && e.preventDefault && e.preventDefault();

    try {
      let payload;
      // If a file is present, use FormData so PATCH can accept multipart
      if (file) {
        const fd = new FormData();
        fd.append("file", file, file.name);
        fd.append("doc_description", description || "");
        // add any other fields you want to patch
        payload = fd;
      } else {
        payload = { doc_description: description || "" };
      }

      await patchDocument({ id: documentId, data: payload }).unwrap();
      // success
      resetAndClose();
    } catch (err) {
      console.error("Failed to patch document", err);
      alert("Failed to update document");
    }
  }

  if (!documentId) return null;
  if (loadingDoc) return <div>Loading…</div>;

  return (
    <form onSubmit={handleSubmit} className="p-4">
      {/* Simple stepper header */}
      <div className="flex items-center gap-4 mb-4">
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

      {/* Step 1 */}
      {step === 1 && (
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
          />

          <div className="flex items-center gap-4 mt-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={auditable}
                onChange={(e) => setAuditable(Boolean(e.target.checked))}
              />
              <span>Auditable</span>
            </label>

            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={minorChanges}
                onChange={(e) => setMinorChanges(Boolean(e.target.checked))}
              />
              <span>Minor changes</span>
            </label>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div />
            <div className="flex gap-2">
              {minorChanges ? (
                <Button type="button" onClick={() => setStep(2)}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isPatching}>
                  {isPatching ? "Saving…" : "Save"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: only shown when minorChanges is checked */}
      {step === 2 && minorChanges && (
        <div>
          <label className="block text-sm font-medium mb-2">Replace file</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <div className="flex items-center justify-between mt-6">
            <div>
              <Button variant="ghost" type="button" onClick={() => setStep(1)}>
                Back
              </Button>
            </div>
            <div>
              <Button
                type="submit"
                disabled={isPatching || (!file && minorChanges)}
              >
                {isPatching ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
