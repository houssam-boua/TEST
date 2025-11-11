import React from "react";

// hook to produce a human-readable sentence from a user action log entry
export default function useActionDescription(log) {
  // memoize for performance when used in lists
  return React.useMemo(() => {
    if (!log || typeof log !== "object") return "";

    const actor = log.user_info?.first_name
      ? `${log.user_info.first_name} ${log.user_info.last_name || ""}`.trim()
      : log.user_info?.username || `User ${log.user || "?"}`;

    const action = (log.action || "").toLowerCase();

    // prefer target descriptive fields
    const model = log.target?.model || null;
    // candidate title/label fields
    const titleCandidates = [
      log.target?.doc_title,
      log.extra_info?.doc_title,
      log.extra_info?.dep_name,
      log.target?.repr,
      log.extra_info?.username,
      log.extra_info?.name,
    ];
    const title = titleCandidates.find((v) => !!v) || null;

    // verb mapping
    const verbMap = {
      create: "created",
      update: "updated",
      delete: "deleted",
      upload: "uploaded",
      download: "downloaded",
    };

    const verb = verbMap[action] || action || "performed an action on";

    // friendly model mapping
    const friendlyModel =
      {
        document: "document",
        departement: "department",
        role: "role",
        workflow: "workflow",
        user: "user",
      }[model] ||
      model ||
      "item";

    if (title) {
      return `${actor} ${verb} ${friendlyModel} "${title}"`;
    }

    if (model) {
      return `${actor} ${verb} ${friendlyModel}`;
    }

    // fallback to generic message
    return `${actor} ${verb}`;
  }, [log]);
}
