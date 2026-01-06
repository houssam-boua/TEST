import React, { useMemo, useState } from "react";
import { useGetDocumentByIdQuery } from "@/slices/documentSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Download, 
  Eye, 
  RefreshCcw, 
  Loader2, 
  FileText,
  Clock,
  Hash,
  MessageSquare,
  FileCode,
  Sparkles,
  History,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Info,
  TrendingUp,
  Activity,
  Layers,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

/* ========================================
   UTILITY FUNCTIONS
======================================== */

function buildFileUrl(raw) {
  if (!raw) return null;
  let s = String(raw).trim().replace(/^\/+/, "");
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("s3.ramaqs.com")) return `https://${s}`;
  
  const base = import.meta.env.VITE_BACKEND_URL || window.location.origin;
  const finalPath = s.startsWith("media/") ? `/${s}` : `/media/${s}`;
  return new URL(finalPath, base).toString();
}

function formatAnyDate(val) {
  if (!val) return "-";
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return String(val);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(d);
  } catch {
    return String(val);
  }
}

function formatChangeType(type) {
  if (!type) return "Standard";
  const t = type.toUpperCase();
  const types = {
    AUDITABLE: "Auditable",
    MINOR: "Mineur",
    SILENT: "Silencieux"
  };
  return types[t] || type;
}

function getChangeTypeStyle(type) {
  const t = (type || "").toUpperCase();
  const styles = {
    AUDITABLE: {
      icon: CheckCircle2,
      bgColor: "bg-gradient-to-r from-blue-50 to-indigo-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
      dotColor: "bg-blue-500"
    },
    MINOR: {
      icon: Info,
      bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
      textColor: "text-gray-700",
      borderColor: "border-gray-200",
      dotColor: "bg-gray-500"
    },
    SILENT: {
      icon: AlertCircle,
      bgColor: "bg-gradient-to-r from-purple-50 to-pink-50",
      textColor: "text-purple-700",
      borderColor: "border-purple-200",
      dotColor: "bg-purple-500"
    }
  };
  
  return styles[t] || {
    icon: FileText,
    bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    dotColor: "bg-green-500"
  };
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

/* ========================================
   SUB-COMPONENTS
======================================== */

// Loading State Component
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 h-full min-h-[400px]">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="relative">
          <Loader2 className="w-20 h-20 text-blue-500 animate-spin" />
          <div className="absolute inset-0 animate-ping">
            <Loader2 className="w-20 h-20 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Chargement de l'historique
        </p>
        <p className="text-sm text-muted-foreground">Veuillez patienter...</p>
      </div>
    </div>
  );
}

// Error State Component
function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 h-full min-h-[400px]">
      <div className="relative">
        <div className="absolute inset-0 bg-red-400 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="relative p-6 rounded-full bg-gradient-to-br from-red-50 to-orange-50 shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500" />
        </div>
      </div>
      <div className="text-center space-y-3">
        <p className="text-xl font-bold text-red-600">Erreur de chargement</p>
        <p className="text-sm text-muted-foreground max-w-md">
          Une erreur s'est produite lors du chargement de l'historique du document.
        </p>
        <Button 
          onClick={onRetry} 
          variant="outline" 
          className="mt-4 border-2 border-red-200 hover:border-red-400 hover:bg-red-50 hover:scale-105 transition-all"
        >
          <RefreshCcw className="mr-2" size={16} /> Réessayer
        </Button>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 h-full min-h-[400px]">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-slate-300 rounded-full blur-3xl opacity-10" />
        <div className="relative p-6 rounded-full bg-gradient-to-br from-gray-50 to-slate-50 shadow-lg">
          <FileText className="w-16 h-16 text-gray-300" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-gray-400">Aucune donnée disponible</p>
        <p className="text-sm text-muted-foreground">Le document ne contient pas d'informations.</p>
      </div>
    </div>
  );
}

// Document Stats Component
function DocumentStats({ doc, versionsCount }) {
  const stats = [
    {
      icon: Layers,
      label: "Versions",
      value: versionsCount,
      color: "from-blue-500 to-indigo-500",
      bgColor: "from-blue-50 to-indigo-50"
    },
    {
      icon: Activity,
      label: "Dernière MAJ",
      value: formatAnyDate(doc?.updated_at || doc?.updatedAt).split(',')[0],
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50"
    },
    {
      icon: Zap,
      label: "Statut",
      value: doc?.doc_status_type || "Actif",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <div 
          key={idx}
          className="relative overflow-hidden rounded-xl border-2 border-white shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-50 -z-10`} />
          <div className="p-4 flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} shadow-md`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{stat.label}</p>
              <p className="text-lg font-bold text-gray-900 truncate">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Document Info Card Component
function DocumentInfoCard({ doc, docFileUrl, downloadingUrl, onDownload, onRefresh }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-white shadow-xl bg-white/90 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 -z-10" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -z-10" />
      
      <div className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          {/* Left Info */}
          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl blur-md opacity-50" />
                <div className="relative p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 mb-2 break-words leading-tight">
                  {doc?.doc_title || "Sans titre"}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="font-mono text-xs bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm">
                    <Hash className="w-3 h-3 mr-1" />
                    {doc?.doc_code || "N/A"}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700 shadow-sm">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatAnyDate(doc?.updated_at || doc?.updatedAt)}
                  </Badge>
                </div>
              </div>
            </div>

            {(doc?.doc_description || doc?.docdescription) && (
              <div className="relative p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-100 shadow-sm">
                <div className="absolute top-3 right-3">
                  <MessageSquare className="w-4 h-4 text-gray-300" />
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                      <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                      Description
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {doc?.doc_description || doc?.docdescription}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Buttons */}
          <div className="flex shrink-0 gap-2 lg:flex-col lg:w-48">
            <Button
              type="button"
              size="sm"
              disabled={!docFileUrl || downloadingUrl === docFileUrl}
              onClick={() => onDownload(docFileUrl, doc?.doc_title)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] font-semibold"
            >
              {downloadingUrl === docFileUrl ? (
                <Loader2 className="mr-2 animate-spin" size={16} />
              ) : (
                <Download className="mr-2" size={16} />
              )}
              Télécharger
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!docFileUrl}
              onClick={() => docFileUrl && window.open(docFileUrl, "_blank", "noopener,noreferrer")}
              className="w-full border-2 border-green-200 hover:border-green-400 hover:bg-green-50 hover:shadow-md hover:scale-[1.02] transition-all duration-300 font-semibold"
            >
              <Eye className="mr-2" size={16} />
              Ouvrir
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onRefresh}
              className="w-full border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 hover:shadow-md hover:scale-[1.02] transition-all duration-300 font-semibold"
            >
              <RefreshCcw className="mr-2" size={16} />
              Rafraîchir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Version Row Component
function VersionRow({ version, idx, doc, downloadingUrl, onDownload }) {
  const versionNumber = version?.version_number ?? version?.versionnumber ?? idx + 1;
  const versionDate = version?.version_date ?? version?.versiondate ?? version?.created_at ?? version?.createdAt ?? version?.updated_at ?? version?.updatedAt;
  const versionPath = version?.version_path ?? version?.versionpath ?? version?.file ?? version?.path;
  const comment = version?.version_comment ?? version?.versioncomment ?? "";
  const changeType = version?.change_type ?? version?.changetype ?? "";
  const versionUrl = buildFileUrl(version?.download_url || versionPath);
  const isDownloading = downloadingUrl === versionUrl;
  const typeStyle = getChangeTypeStyle(changeType);
  const TypeIcon = typeStyle.icon;

  return (
    <tr
      className="group transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50/50 hover:via-purple-50/30 hover:to-pink-50/50 hover:shadow-md"
      style={{ animationDelay: `${idx * 30}ms` }}
    >
      {/* Version Number */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${typeStyle.dotColor} animate-pulse`} />
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
            <Hash className="w-3.5 h-3.5" />
            v{String(versionNumber)}
          </div>
        </div>
      </td>

      {/* Date */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2 text-gray-600 group-hover:text-gray-900 transition-colors">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="font-medium text-sm">{formatAnyDate(versionDate)}</span>
        </div>
      </td>

      {/* Type */}
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge 
          variant="outline" 
          className={`text-xs font-semibold ${typeStyle.bgColor} ${typeStyle.textColor} ${typeStyle.borderColor} border-2 shadow-sm group-hover:shadow-md transition-all duration-300 flex items-center gap-1.5 w-fit`}
        >
          <TypeIcon className="w-3.5 h-3.5" />
          {formatChangeType(changeType)}
        </Badge>
      </td>

      {/* File Path */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 max-w-[200px]">
          <div className="p-1.5 rounded-md bg-amber-50 group-hover:bg-amber-100 transition-colors">
            <FileText className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div
            className="font-mono text-xs text-gray-700 truncate group-hover:text-gray-900 transition-colors"
            title={String(versionPath || "")}
          >
            {String(versionPath || "-").split("/").pop()}
          </div>
        </div>
      </td>

      {/* Description */}
      <td className="px-6 py-4">
        <div className="text-sm text-gray-700 group-hover:text-gray-900 leading-relaxed transition-colors">
          {comment ? (
            <div className="flex items-start gap-2 max-w-[400px]">
              <div className="p-1 rounded-md bg-green-50 group-hover:bg-green-100 transition-colors mt-0.5">
                <MessageSquare className="w-3.5 h-3.5 text-green-500" />
              </div>
              <span className="break-words flex-1">{comment}</span>
            </div>
          ) : (
            <span className="text-gray-400 italic text-xs flex items-center gap-1">
              <Info className="w-3 h-3" />
              Aucun commentaire
            </span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!versionUrl}
            onClick={() => versionUrl && window.open(versionUrl, "_blank", "noopener,noreferrer")}
            className="border-2 border-green-200 hover:border-green-400 hover:bg-green-50 hover:shadow-md hover:scale-110 transition-all duration-300"
          >
            <Eye className="mr-1.5" size={14} />
            Voir
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!versionUrl || isDownloading}
            onClick={() => onDownload(versionUrl, `v${versionNumber}_${doc?.doc_title || "doc"}`)}
            className="border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md hover:scale-110 transition-all duration-300"
          >
            {isDownloading ? (
              <Loader2 className="mr-1.5 animate-spin" size={14} />
            ) : (
              <Download className="mr-1.5" size={14} />
            )}
            DL
          </Button>
        </div>
      </td>
    </tr>
  );
}

// Versions Table Component
function VersionsTable({ versions, doc, downloadingUrl, onDownload }) {
  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20" />
          <div className="relative p-6 rounded-full bg-gradient-to-br from-gray-50 to-slate-50 shadow-lg">
            <Layers className="w-20 h-20 text-gray-300" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-bold text-gray-400">Aucune version trouvée</p>
          <p className="text-sm text-muted-foreground">Ce document ne contient pas de versions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-white shadow-2xl bg-white/90 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 -z-10" />
      
      {/* Table Header with Stats */}
      <div className="p-4 border-b-2 border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Historique des versions</h4>
              <p className="text-xs text-muted-foreground">
                {versions.length} version{versions.length !== 1 ? 's' : ''} • Triées par ordre décroissant
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm bg-blue-100 text-blue-700 px-4 py-2 shadow-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Total: {versions.length}
          </Badge>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-slate-100 to-gray-100 border-b-2 border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-left whitespace-nowrap w-[130px]">
                <div className="flex items-center gap-2 font-bold text-gray-700 uppercase tracking-wide text-xs">
                  <Hash className="w-4 h-4 text-indigo-500" />
                  Version
                </div>
              </th>
              <th className="px-6 py-4 text-left whitespace-nowrap w-[180px]">
                <div className="flex items-center gap-2 font-bold text-gray-700 uppercase tracking-wide text-xs">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Date & Heure
                </div>
              </th>
              <th className="px-6 py-4 text-left whitespace-nowrap w-[140px]">
                <div className="flex items-center gap-2 font-bold text-gray-700 uppercase tracking-wide text-xs">
                  <FileCode className="w-4 h-4 text-purple-500" />
                  Type
                </div>
              </th>
              <th className="px-6 py-4 text-left whitespace-nowrap w-[220px]">
                <div className="flex items-center gap-2 font-bold text-gray-700 uppercase tracking-wide text-xs">
                  <FileText className="w-4 h-4 text-amber-500" />
                  Fichier
                </div>
              </th>
              <th className="px-6 py-4 text-left min-w-[350px]">
                <div className="flex items-center gap-2 font-bold text-gray-700 uppercase tracking-wide text-xs">
                  <MessageSquare className="w-4 h-4 text-green-500" />
                  Commentaire
                </div>
              </th>
              <th className="px-6 py-4 text-right whitespace-nowrap w-[160px]">
                <div className="flex items-center justify-end gap-2 font-bold text-gray-700 uppercase tracking-wide text-xs">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  Actions
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {versions.map((version, idx) => (
              <VersionRow
                key={version?.id ?? `${version?.version_number}-${idx}`}
                version={version}
                idx={idx}
                doc={doc}
                downloadingUrl={downloadingUrl}
                onDownload={onDownload}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-3 border-t-2 border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
          <Info className="w-3.5 h-3.5" />
          💡 Faites défiler horizontalement pour voir toutes les colonnes
        </p>
      </div>
    </div>
  );
}

/* ========================================
   MAIN COMPONENT
======================================== */

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
      toast.success("✅ Téléchargement réussi");
    } catch (err) {
      console.error("Download error:", err);
      window.open(url, "_blank");
      toast.error("⚠️ Téléchargement automatique échoué, ouverture dans un nouvel onglet.");
    } finally {
      setDownloadingUrl(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[90vw] !w-[90vw] !h-[85vh] flex flex-col p-0 gap-0 overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
        
        {/* Enhanced Header */}
        <DialogHeader className="relative overflow-hidden px-6 py-5 border-b-2 border-gray-100 flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 -z-10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -z-10" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl blur-md opacity-50 animate-pulse" />
                <div className="relative grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
                  <History className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Historique du document
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Consultez toutes les versions et modifications
                </p>
              </div>
            </div>

            {!isFetching && !isError && doc && (
              <Badge variant="secondary" className="text-sm bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-4 py-2 shadow-md border-2 border-blue-100">
                <Layers className="w-4 h-4 mr-2" />
                {versions.length} version{versions.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50">
          {isFetching ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState onRetry={refetch} />
          ) : !doc ? (
            <EmptyState />
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Document Stats */}
              <DocumentStats doc={doc} versionsCount={versions.length} />
              
              {/* Document Info Card */}
              <DocumentInfoCard 
                doc={doc}
                docFileUrl={docFileUrl}
                downloadingUrl={downloadingUrl}
                onDownload={handleDownload}
                onRefresh={refetch}
              />

              {/* Versions Table */}
              <VersionsTable 
                versions={versions}
                doc={doc}
                downloadingUrl={downloadingUrl}
                onDownload={handleDownload}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
