import React from "react";
import { Badge } from "@/components/ui/badge";
import { Building } from "lucide-react";

/**
 * DepartmentBadge
 * Props:
 *  - color: a CSS color (hex or named). If missing, a default is used.
 *  - name: optional department name to display next to the icon.
 */
const DepartmentBadge = ({ color = "#2563eb", name }) => {
  const label = name || color;

  // Use inline styles so we can accept arbitrary color values (hex or css names).
  // We set a subtle translucent background and a readable text color.
  const bg = color;
  // Determine readable text color (very simple: use white for dark colors, black otherwise).
  // For simplicity, if color starts with '#', check luminance quickly.
  let textColor = "#fff";
  try {
    if (
      typeof color === "string" &&
      color.startsWith("#") &&
      color.length === 7
    ) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      textColor = luminance > 0.6 ? "#111827" : "#ffffff";
    }
  } catch {
    textColor = "#fff";
  }

  return (
    <Badge
      style={{ backgroundColor: bg, color: textColor }}
      className="shadow-none rounded-full inline-flex items-center gap-2 px-2 py-1"
    >
      <Building size={14} />
      <span className="text-xs font-medium">{label}</span>
    </Badge>
  );
};

export default DepartmentBadge;
