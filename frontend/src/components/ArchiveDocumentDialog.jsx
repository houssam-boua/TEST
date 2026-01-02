"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useArchiveDocumentMutation } from "@/slices/documentSlice";

function toIsoFromDatetimeLocal(datetimeLocalValue) {
  if (!datetimeLocalValue) return null;
  const d = new Date(datetimeLocalValue);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function ArchiveDocumentDialog({ open, onOpenChange, documentId }) {
  const [mode, setMode] = useState("permanent"); // "permanent" | "until"
  const [until, setUntil] = useState(""); // datetime-local string
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");

  const [archiveDocument, { isLoading }] = useArchiveDocumentMutation();

  // Reset form each time dialog closes
  useEffect(() => {
    if (!open) {
      setMode("permanent");
      setUntil("");
      setNote("");
      setFormError("");
    }
  }, [open]);

  const canSubmit =
    !!documentId && !isLoading && (mode === "permanent" || (mode === "until" && !!until));

  const handleArchive = async () => {
    try {
      setFormError("");

      if (!documentId) {
        setFormError("Document ID manquant.");
        return;
      }

      if (mode !== "permanent" && mode !== "until") {
        setFormError("Mode invalide.");
        return;
      }

      const isoUntil = mode === "until" ? toIsoFromDatetimeLocal(until) : null;
      if (mode === "until" && !isoUntil) {
        setFormError("Veuillez choisir une date/heure valide.");
        return;
      }

      const payload = {
        id: documentId,
        mode,
        until: isoUntil, // null for permanent
        note: note?.trim() || "",
      };

      await archiveDocument(payload).unwrap();

      onOpenChange(false);
    } catch (err) {
      // RTK Query error shape often has err.data
      const msg =
        err?.data?.detail ||
        err?.data?.message ||
        (typeof err?.data === "string" ? err.data : null) ||
        "Échec de l’archivage.";
      setFormError(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-lg">
        <DialogHeader>
          <DialogTitle>Archivage du document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Type d’archivage</div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="archive-mode"
                checked={mode === "permanent"}
                onChange={() => setMode("permanent")}
              />
              Définitif
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="archive-mode"
                checked={mode === "until"}
                onChange={() => setMode("until")}
              />
              Pendant une période (jusqu’à date/heure)
            </label>
          </div>

          {/* Until */}
          {mode === "until" && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Date et heure de restauration
              </div>
              <input
                type="datetime-local"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={until}
                onChange={(e) => setUntil(e.target.value)}
              />
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Note (optionnel)</div>
            <textarea
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Pourquoi ce document est archivé ?"
            />
          </div>

          {/* Error */}
          {formError ? (
            <div className="text-sm text-destructive">{formError}</div>
          ) : null}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>

            <Button onClick={handleArchive} disabled={!canSubmit}>
              {isLoading ? "Archivage..." : "Archiver"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
