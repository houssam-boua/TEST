"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter, // Added DialogFooter import if missing
} from "@/components/ui/dialog";
import { useArchiveFolderMutation } from "@/slices/documentSlice";
import { Loader2 } from "lucide-react"; // Import Loader2 for spinner

function toIsoFromDatetimeLocal(datetimeLocalValue) {
  if (!datetimeLocalValue) return null;
  const d = new Date(datetimeLocalValue);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function ArchiveFolderDialog({ open, onOpenChange, folder }) {
  const [mode, setMode] = useState("permanent"); // "permanent" | "until"
  const [until, setUntil] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");

  const [archiveFolder, { isLoading }] = useArchiveFolderMutation();

  useEffect(() => {
    if (open) {
      // Reset state when opening
      setMode("permanent");
      setUntil("");
      setNote("");
      setFormError("");
    }
  }, [open]);

  const canSubmit = !!folder?.id && !isLoading && (mode === "permanent" || (mode === "until" && !!until));

  const handleArchive = async () => {
    try {
      setFormError("");
      if (!folder?.id) return;

      const isoUntil = mode === "until" ? toIsoFromDatetimeLocal(until) : null;
      
      console.log("Submitting archiveFolder:", { 
        id: folder.id, 
        mode, 
        until: isoUntil, 
        note 
      });

      await archiveFolder({
        id: folder.id,
        mode, // Ensure this is sent!
        until: isoUntil,
        note: note?.trim() || `Archived folder: ${folder.fol_name}`,
      }).unwrap();

      onOpenChange(false);
    } catch (err) {
      console.error("archiveFolder failed:", err);
      const msg = err?.data?.detail || "Échec de l’archivage du dossier.";
      setFormError(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-lg">
        <DialogHeader>
          <DialogTitle>Archiver le dossier "{folder?.fol_name}"</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
            Attention : Cette action archivera <strong>tous</strong> les sous-dossiers et documents contenus dans ce dossier.
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Type d’archivage</div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input 
                  type="radio" 
                  name="archiveMode" 
                  value="permanent"
                  checked={mode === "permanent"} 
                  onChange={() => setMode("permanent")} 
                  className="accent-primary"
                />
                Définitif (Permanent)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input 
                  type="radio" 
                  name="archiveMode" 
                  value="until"
                  checked={mode === "until"} 
                  onChange={() => setMode("until")} 
                  className="accent-primary"
                />
                Temporaire (jusqu'à une date)
              </label>
            </div>
          </div>

          {mode === "until" && (
            <div className="space-y-2 pl-6 border-l-2 border-muted ml-1">
              <div className="text-sm text-muted-foreground">Date de restauration</div>
              <input
                type="datetime-local"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={until}
                onChange={(e) => setUntil(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Note (optionnel)</div>
            <textarea
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Raison de l'archivage..."
            />
          </div>

          {formError && <div className="text-sm text-destructive font-medium">{formError}</div>}
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleArchive} disabled={!canSubmit}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Archivage..." : "Archiver tout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}