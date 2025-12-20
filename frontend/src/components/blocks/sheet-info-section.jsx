import React, { useEffect, useState } from "react";
("use client");
import { TabsContent } from "@/components/ui/tabs";
import { ArrowDownToLine, ExternalLink } from "lucide-react";
const fmtValue = (v) => {
  if (v === null || typeof v === "undefined") return "";
  if (typeof v === "object") return JSON.stringify(v);
  // normalize paths and timestamps for display
  if (typeof v === "string") {
    // convert backslashes to forward slashes for clarity
    const maybePath = v.replace(/\\\\/g, "/").replace(/\\/g, "/");
    return maybePath;
  }
  return String(v);
};

const humanFileSize = (bytes) => {
  if (bytes == null) return "";
  const b = Number(bytes);
  if (Number.isNaN(b)) return String(bytes);
  if (b < 1024) return `${b} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let u = -1;
  let value = b;
  do {
    value /= 1024;
    u++;
  } while (value >= 1024 && u < units.length - 1);
  return `${value.toFixed(1)} ${units[u]}`;
};

const formatCreated = (item) => {
  const v =
    item?.doc_creation_date ??
    item?.created_at ??
    item?.createdAt ??
    item?.doc_creation;
  if (!v) return "";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleString();
  } catch {
    return String(v);
  }
};

const SheetInfoSection = ({ infos = [] }) => {
  const [PreviewComp, setPreviewComp] = useState(null);

  useEffect(() => {
    let mounted = true;
    import("reactjs-file-preview")
      .then((mod) => {
        const C =
          mod?.default || mod?.FilePreview || mod?.ReactJsFilePreview || mod;
        if (mounted && C) setPreviewComp(() => C);
      })
      .catch(() => {});
    return () => (mounted = false);
  }, []);

  return (
    <TabsContent value="info" className=" overflow-auto pr-2">
      <div className="flex flex-col gap-3 w-full min-w-0">
        {!Array.isArray(infos) || infos.length === 0 ? (
          <span className="text-sm text-muted-foreground">
            Aucune information.
          </span>
        ) : (
          infos.map((item, idx) => {
            // unwrap common wrappers (table row wrappers)
            const doc = item?.original ?? item?.data ?? item;
            const name =
              doc?.doc_title ??
              doc?.file_name ??
              doc?.title ??
              (doc?.doc_path
                ? doc.doc_path.split("/").pop()
                : `Item ${idx + 1}`);
            const size = doc?.doc_size ?? doc?.file_size ?? doc?.size ?? null;
            const created = formatCreated(doc);
            const filePath = doc?.doc_path || null;

            const encodePath = (p) =>
              String(p || "")
                .split("/")
                .map((seg) => encodeURIComponent(seg))
                .join("/");

            const baseFromEnv = import.meta.env.VITE_MINIO_BASE_URL || "";
            const defaultBase = "https://s3.ramaqs.com/smartdocspro";

            const makeAbsolute = (p) => {
              if (!p) return null;
              if (/^https?:\/\//i.test(p)) return p;

              // preserve query string if present
              const [pathOnly, query] = String(p).split("?");

              let base =
                baseFromEnv && baseFromEnv.trim() !== ""
                  ? baseFromEnv
                  : defaultBase;
              let baseClean = base.replace(/\/$/, "");
              // ensure scheme (protocol) is present
              if (!/^https?:\/\//i.test(baseClean)) {
                baseClean = `https://${baseClean}`;
              }
              // ensure bucket segment exists for this S3 host
              if (!baseClean.includes("smartdocspro")) {
                baseClean = baseClean.replace(/\/$/, "") + "/smartdocspro";
              }

              const pathClean = pathOnly.replace(/^\/?/, "");
              const encoded =
                `${baseClean}/${encodePath(pathClean)}` +
                (query ? `?${query}` : "");
              return encoded;
            };

            const fileUrl = makeAbsolute(filePath);

            const ext = fileUrl
              ? String(fileUrl).split("?")[0].split(".").pop().toLowerCase()
              : null;
            // directory path (exclude filename)
            const dirPath = filePath
              ? String(filePath)
                  .replace(/\\/g, "/")
                  .replace(/\/[^/]+$/, "")
              : null;
            const displayPath = dirPath === "" ? "/" : dirPath;
            return (
              <div
                key={idx}
                className="rounded p-3 bg-white w-full min-w-0 shadow-sm"
              >
                {fileUrl ? (
                  ext === "png" ||
                  ext === "jpg" ||
                  ext === "jpeg" ||
                  ext === "gif" ||
                  ext === "webp" ? (
                    <div className="mb-3 flex flex-col items-center gap-3">
                      <img
                        src={fileUrl}
                        alt={name}
                        className="w-full max-h-[40vh] object-contain mb-3"
                      />

                      <div className="flex flex-row gap-4">
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex flex-row items-center gap-2 bg-primary text-white text-sm px-3 py-1 rounded"
                        >
                          <ArrowDownToLine size={15} />
                          Download
                        </a>

                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex flex-row items-center gap-2 bg-primary text-white text-sm px-3 py-1 rounded"
                        >
                          <ExternalLink size={15} />
                          Share
                        </a>
                      </div>
                    </div>
                  ) : ext === "pdf" ? (
                    <div className="mb-3 flex flex-col items-center gap-3">
                      <iframe
                        src={fileUrl}
                        title={name}
                        className="w-full max-h-[50vh] mb-3 border"
                      />
                      <div className="flex flex-row gap-4">
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex flex-row items-center gap-2 bg-primary text-white text-sm px-3 py-1 rounded"
                        >
                          <ArrowDownToLine size={15} />
                          Download
                        </a>

                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex flex-row items-center gap-2 bg-primary text-white text-sm px-3 py-1 rounded"
                        >
                          <ExternalLink size={15} />
                          Share
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3 flex flex-col items-center gap-3">
                      <div className="text-md break-words text-destructive  max-w-full">
                        Unsupported file type
                      </div>
                      <div className="flex flex-row gap-4">
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex flex-row items-center gap-2 bg-primary text-white text-sm px-3 py-1 rounded"
                        >
                          <ArrowDownToLine size={15} />
                          Download
                        </a>

                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex flex-row items-center gap-2 bg-primary text-white text-sm px-3 py-1 rounded"
                        >
                          <ExternalLink size={15} />
                          Share
                        </a>
                      </div>
                    </div>
                  )
                ) : null}

                <div className="flex flex-col mb-2">
                  <div className="text-sm text-muted-foreground/70">
                    Document title
                  </div>
                  <div className="font-medium text-sm text-muted-foreground">
                    {name}
                  </div>
                </div>

                <div className="flex gap-4 mb-2">
                  {size ? (
                    <div className="flex flex-col mb-2">
                      <div className="text-sm text-muted-foreground/70">
                        Size
                      </div>
                      <div className="font-medium text-sm text-muted-foreground">
                        {humanFileSize(size)}
                      </div>
                    </div>
                  ) : null}
                  {created ? (
                    <div className="flex flex-col mb-2">
                      <div className="text-sm text-muted-foreground/70">
                        Created
                      </div>
                      <div className="font-medium text-sm text-muted-foreground">
                        {created}
                      </div>
                    </div>
                  ) : null}

                  {filePath ? (
                    <div className="flex flex-col mb-2">
                      <div className="text-sm text-muted-foreground/70">
                        Path
                      </div>
                      <div className="font-medium text-sm text-muted-foreground break-all">
                        {displayPath}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </TabsContent>
  );
};

export default SheetInfoSection;
