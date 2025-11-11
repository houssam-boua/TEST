import React from "react";

// Splits a document title on the last '.' (dot) from the right.
// Returns an object: { name: string, type: string }
// Examples:
// - "recu_preinscription.pdf" -> { name: "recu_preinscription", type: "pdf" }
// - "Report v1.2.docx" -> { name: "Report v1.2", type: "docx" }
// - "Untitled" -> { name: "Untitled", type: "" }
export default function useTitleSplit(title) {
  return React.useMemo(() => {
    if (!title && title !== 0) return { name: "", type: "" };
    // If the title contains path separators, use the last segment as filename
    let str = String(title).trim();
    const lastSlash = Math.max(str.lastIndexOf("/"), str.lastIndexOf("\\"));
    if (lastSlash > -1) str = str.slice(lastSlash + 1).trim();
    const lastDot = str.lastIndexOf(".");
    if (lastDot === -1 || lastDot === 0 || lastDot === str.length - 1) {
      // No extension or dot at edges -> no type
      return { name: str, type: "" };
    }
    const name = str.slice(0, lastDot).trim();
    const type = str
      .slice(lastDot + 1)
      .trim()
      .toLowerCase();
    return { name: name || str, type };
  }, [title]);
}
