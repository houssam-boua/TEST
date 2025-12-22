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
  // Prefer displaying the department name when available.
  const label = name || color;

  // Normalize color input: accept hex, tailwind token (amber-600) or simple color names
  let normalized = color;
  if (typeof color === "string") {
    normalized = color.trim();
  }

  // If color is a simple color name like 'Gray' or 'gray', map to a sensible hex value
  const colorNameMap = {
    gray: "#6b7280",
    grey: "#6b7280",
    red: "#ef4444",
    green: "#10b981",
    blue: "#3b82f6",
    yellow: "#f59e0b",
    amber: "#f59e0b",
    purple: "#8b5cf6",
    indigo: "#6366f1",
    teal: "#14b8a6",
    orange: "#fb923c",
  };

  if (typeof normalized === "string" && !normalized.startsWith("#")) {
    const lower = normalized.toLowerCase();
    if (colorNameMap[lower]) normalized = colorNameMap[lower];
  }

  // If `color` is a Tailwind color token like 'amber-600', prefer generating
  // Tailwind classes so the badge uses themed colors and hover states.
  const tailwindTokenMatch =
    typeof normalized === "string" && /^([a-z]+-\d{3})$/i.test(normalized);

  if (tailwindTokenMatch) {
    // e.g. color = 'amber-600' -> name = 'amber', classes use amber-600 for bg and amber-500 for text
    const token = color;
    const nameToken = token.split("-")[0];
    // use higher background opacity (80%) and text opacity (~90%) per request
    const classes = `bg-${token}/80 dark:bg-${token}/90 hover:bg-${token}/80 text-${nameToken}-500/90 shadow-none rounded-full inline-flex items-center gap-2 px-2 py-1`;
    return (
      <Badge className={classes}>
        <Building size={14} />
        <span style={{ opacity: 0.9 }} className="text-xs font-medium">
          {label}
        </span>
      </Badge>
    );
  }

  // Fallback: accept arbitrary css color values (hex or named colors) and compute readable text color.
  const bg = normalized;
  let bgStyle = bg;
  let textColorStyle = "#ffffff";
  try {
    if (
      typeof normalized === "string" &&
      normalized.startsWith("#") &&
      normalized.length === 7
    ) {
      const r = parseInt(normalized.slice(1, 3), 16);
      const g = parseInt(normalized.slice(3, 5), 16);
      const b = parseInt(normalized.slice(5, 7), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      // use 80% alpha for background, choose readable text color and apply 90% alpha to text
      bgStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
      if (luminance > 0.6) {
        // light background -> dark text
        textColorStyle = `rgba(17, 24, 39, 0.9)`; // #111827 with 90% alpha
      } else {
        // dark background -> light text
        textColorStyle = `rgba(255, 255, 255, 0.9)`;
      }
    }
  } catch {
    textColorStyle = "#ffffff";
  }

  return (
    <Badge
      style={{ backgroundColor: bgStyle, color: textColorStyle }}
      className="shadow-none rounded-full inline-flex items-center gap-2 px-2 py-1"
    >
      <Building size={14} />
      <span className="text-xs font-medium">{label}</span>
    </Badge>
  );
};

export default DepartmentBadge;
