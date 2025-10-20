import React from "react";

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function DataGrid({ data = [], onCardClick }) {
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => (
          <article
            key={item.id}
            className="rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            role="button"
            tabIndex={0}
            onClick={() => onCardClick?.(item)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="text-sm font-semibold">
                  {item.groupname ?? `Item ${item.id}`}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {item.projectName}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(item.createdAt)}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <div>{(item.devices || []).length} appareil(s)</div>
              <div>#{item.id}</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
