import React, { useMemo, useState } from "react";
import { useGetDocumentByIdQuery } from "@/slices/documentSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Eye, RefreshCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

function buildFileUrl(raw) {
  if (!raw) return null;
  let s = String(raw).trim();
  
  // Remove leading slashes
  s = s.replace(/^\/+/, "");

  if (!s) return null;

  // 1. If it already has http/https, return it as is.
  if (/^https?:\/\//i.test(s)) return s;

  // 2. If it starts with your S3 domain, force HTTPS.
  if (s.startsWith("s3.ramaqs.com")) {
    return `https://${s}`;
  }

  // 3. Fallback: Treat as relative path
  const base = import.meta.env.VITE_BACKEND_URL || window.location.origin;
  const finalPath = s.startsWith("media/") ? `/${s}` : `/media/${s}`;
  
  return new URL(finalPath, base).toString();
}

function formatAnyDate(val) {
  if (!val) return "-";
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return String(val);
    return d.toLocaleString();
  } catch {
    return String(val);
  }
}

function formatChangeType(type) {
  if (!type) return "-";
  const t = type.toUpperCase();
  if (t === "AUDITABLE") return "Auditable";
  if (t === "MINOR") return "Mineur";
  if (t === "SILENT") return "Silencieux";
  return type;
}

function extractVersions(doc) {
  const candidates = [
    doc?.versions,
    doc?.document_versions,
    doc?.documentVersions,
    doc?.doc_versions,
    doc?.docVersions,
  ];
  for (const c of candidates) if (Array.isArray(c)) return c;
  return [];
}

export default function DocumentHistoryDialog({ open, onOpenChange, documentId }) {
  const { data: doc, isFetching, isError, refetch } = useGetDocumentByIdQuery(documentId, {
    skip: !open || !documentId,
  });

  const [downloadingUrl, setDownloadingUrl] = useState(null);

  const versions = useMemo(() => {
    const arr = extractVersions(doc);
    return [...arr].sort((a, b) => {
      const av = Number(a?.version_number ?? a?.versionnumber ?? 0);
      const bv = Number(b?.version_number ?? b?.versionnumber ?? 0);
      return bv - av;
    });
  }, [doc]);

  const docFileUrl = buildFileUrl(doc?.download_url || doc?.doc_path || doc?.file || doc?.url);

  async function handleDownload(url, filename) {
    if (!url) return;
    setDownloadingUrl(url);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download error:", err);
      window.open(url, "_blank");
      toast?.error?.("Téléchargement automatique échoué, ouverture dans un nouvel onglet.");
    } finally {
      setDownloadingUrl(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="w-[96vw]">
        <DialogHeader className="pb-3 border-b">
          <DialogTitle>Historique du document</DialogTitle>
        </DialogHeader>

        {isFetching ? (
          <div className="pt-4 text-sm text-muted-foreground">Chargement...</div>
        ) : isError ? (
          <div className="pt-4 text-sm text-destructive">
            Erreur lors du chargement du document.
          </div>
        ) : !doc ? (
          <div className="pt-4 text-sm text-muted-foreground">Aucune donnée.</div>
        ) : (
          <div className="pt-4 space-y-4">
            {/* Header card */}
            <div className="rounded-lg border bg-background p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-base font-semibold truncate">
                    {doc?.doc_title || "Sans titre"}
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                    <div className="truncate">
                      <span className="font-medium text-foreground/80">Code:</span>{" "}
                      {doc?.doc_code || "-"}
                    </div>
                    <div className="truncate">
                      <span className="font-medium text-foreground/80">Mise à jour:</span>{" "}
                      {formatAnyDate(doc?.updated_at || doc?.updatedAt)}
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-muted-foreground break-words">
                    <span className="font-medium text-foreground/80">Description:</span>{" "}
                    {doc?.doc_description || doc?.docdescription || "-"}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    disabled={!docFileUrl || downloadingUrl === docFileUrl}
                    onClick={() => handleDownload(docFileUrl, doc?.doc_title)}
                  >
                    {downloadingUrl === docFileUrl ? (
                      <Loader2 className="mr-2 animate-spin" size={14} />
                    ) : (
                      <Download className="mr-2" size={14} />
                    )}
                    Télécharger
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!docFileUrl}
                    onClick={() =>
                      docFileUrl &&
                      window.open(docFileUrl, "_blank", "noopener,noreferrer")
                    }
                  >
                    <Eye className="mr-2" size={14} />
                    Ouvrir
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => refetch?.()}
                  >
                    <RefreshCcw className="mr-2" size={14} />
                    Rafraîchir
                  </Button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border overflow-hidden bg-background">
              <div className="max-h-[60vh] overflow-auto">
                <table className="w-full min-w-[1000px] table-fixed text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/40 backdrop-blur supports-[backdrop-filter]:bg-muted/30">
                    <tr className="border-b text-muted-foreground">
                      <th className="px-4 py-3 text-left w-[80px]">Version</th>
                      <th className="px-4 py-3 text-left w-[180px]">Date</th>
                      {/* NEW: Type column */}
                      <th className="px-4 py-3 text-left w-[120px]">Type</th>
                      <th className="px-4 py-3 text-left w-[250px]">Fichier</th>
                      {/* NEW: Description/Comment column */}
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-right w-[240px]">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {versions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-muted-foreground">
                          Aucune version trouvée.
                        </td>
                      </tr>
                    ) : (
                      versions.map((v, idx) => {
                        const versionNumber =
                          v?.version_number ?? v?.versionnumber ?? idx + 1;

                        const versionDate =
                          v?.version_date ??
                          v?.versiondate ??
                          v?.created_at ??
                          v?.createdAt ??
                          v?.updated_at ??
                          v?.updatedAt;

                        const versionPath =
                          v?.version_path ?? v?.versionpath ?? v?.file ?? v?.path;

                        const comment = v?.version_comment ?? v?.versioncomment ?? "";
                        const changeType = v?.change_type ?? v?.changetype ?? "";
                        
                        const versionUrl = buildFileUrl(v?.download_url || versionPath);
                        const isDownloading = downloadingUrl === versionUrl;

                        return (
                          <tr
                            key={v?.id ?? `${versionNumber}-${idx}`}
                            className="hover:bg-muted/10"
                          >
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 font-medium">
                                V{String(versionNumber)}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                              {formatAnyDate(versionDate)}
                            </td>

                            {/* Type */}
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                (changeType || "").toUpperCase() === "AUDITABLE" 
                                  ? "bg-blue-100 text-blue-700" 
                                  : "bg-gray-100 text-gray-700"
                              }`}>
                                {formatChangeType(changeType)}
                              </span>
                            </td>

                            {/* Fichier / Path */}
                            <td className="px-4 py-3">
                              <div
                                className="font-mono text-xs text-foreground/80 truncate"
                                title={String(versionPath || "")}
                              >
                                {String(versionPath || "-").split("/").pop()}
                              </div>
                            </td>

                            {/* Description / Comment */}
                            <td className="px-4 py-3">
                              <div className="text-foreground/90 break-words leading-relaxed">
                                {comment || (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled={!versionUrl}
                                  onClick={() =>
                                    versionUrl &&
                                    window.open(versionUrl, "_blank", "noopener,noreferrer")
                                  }
                                >
                                  <Eye className="mr-2" size={14} />
                                  Ouvrir
                                </Button>

                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="whitespace-nowrap"
                                  disabled={!versionUrl || isDownloading}
                                  onClick={() => handleDownload(versionUrl, `v${versionNumber}_${doc?.doc_title || "doc"}`)}
                                >
                                  {isDownloading ? (
                                    <Loader2 className="mr-2 animate-spin" size={14} />
                                  ) : (
                                    <Download className="mr-2" size={14} />
                                  )}
                                  Télécharger
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Astuce: sur petit écran, fais un scroll horizontal dans le tableau.
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}