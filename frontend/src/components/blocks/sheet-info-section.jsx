import React from "react";
("use client");
import { TabsContent } from "@/components/ui/tabs";
import FilePreview from "reactjs-file-preview";
import nodata from "../../assets/nodata.svg";
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
  return (
    <TabsContent value="info">
      <div className="flex flex-col gap-3">
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
            return (
              <div
                key={idx}
                className="border rounded p-3 bg-white/60 dark:bg-slate-800/60"
              >
                <FilePreview preview={doc?.doc_path} />
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{name}</div>
                  <div className="text-sm text-muted-foreground">
                    ID: {doc?.id ?? "-"}
                  </div>
                </div>
                <div className="flex gap-4 mb-2">
                  {size ? (
                    <div className="text-sm text-muted-foreground">
                      Taille: {humanFileSize(size)}
                    </div>
                  ) : null}
                  {created ? (
                    <div className="text-sm text-muted-foreground">
                      Créé: {created}
                    </div>
                  ) : null}
                </div>
                <div
                  className="grid gap-1"
                  style={{ gridTemplateColumns: "minmax(140px, 1fr) 2fr" }}
                >
                  {Object.keys(doc || {}).map((k) => (
                    <React.Fragment key={k}>
                      <div className="text-xs text-muted-foreground font-medium">
                        {k}
                      </div>
                      <div className="text-sm break-words">
                        {fmtValue(doc[k])}
                      </div>
                    </React.Fragment>
                  ))}
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
