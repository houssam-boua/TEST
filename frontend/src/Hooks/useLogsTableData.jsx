import { useMemo } from "react";

function safeGet(obj, path, fallback = "") {
  try {
    return (
      path
        .split(".")
        .reduce(
          (acc, p) => (acc && acc[p] !== undefined ? acc[p] : undefined),
          obj
        ) ?? fallback
    );
  } catch (e) {
    return fallback;
  }
}

export default function useLogsTableData(logs) {
  return useMemo(() => {
    const items = Array.isArray(logs) ? logs : (logs && logs.results) || [];

    const rows = items.map((l) => {
      const id = l.id;
      const userInfo = l.user_info || {};
      const username = userInfo.username || String(l.user || "");
      // Show only the display name (first + last) or username — do not include role/username in parentheses
      const displayUser =
        userInfo.first_name || userInfo.last_name
          ? `${userInfo.first_name || ""} ${userInfo.last_name || ""}`.trim()
          : username;
      const userRole = userInfo.role || "";
      const action = l.action || "";

      // target repr
      let targetRepr =
        safeGet(l, "target.repr", "") ||
        (l.target
          ? `${l.target.model || ""} (${l.target.id || l.object_id || ""})`
          : "");
      // remove any parenthesized suffix like " (6)" or " (something)"
      targetRepr = String(targetRepr).replace(/\s*\(.*\)\s*$/, "");

      // derive a short description from extra_info if present
      let description = "";
      if (l.extra_info && typeof l.extra_info === "object") {
        // try common keys first
        const keys = ["name", "task_name", "title", "label", "message"];
        for (const k of keys) {
          if (l.extra_info[k]) {
            description = String(l.extra_info[k]);
            break;
          }
        }
        if (!description) description = JSON.stringify(l.extra_info);
      }

      const timestamp = l.timestamp || l.created_at || l.date || "";

      return {
        id,
        user: displayUser,
        role: userRole,
        target: targetRepr,
        action,
        created_at: timestamp,
        _raw: l,
      };
    });

    const columns = [
      { id: "id", accessorKey: "id", header: "ID" },
      { id: "user", accessorKey: "user", header: "User" },
      { id: "role", accessorKey: "role", header: "Role" },
      { id: "action", accessorKey: "action", header: "Action" },
      { id: "target", accessorKey: "target", header: "Target" },
      { id: "date", accessorKey: "created_at", header: "Date" },
    ];

    return { rows, columns };
  }, [logs]);
}
