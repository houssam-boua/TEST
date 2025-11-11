import React from "react";
import { Badge } from "@/components/ui/badge";
import { Building, Dot } from "lucide-react";

/**
 * StatusBadge
 * Props:
 *  - color: a CSS color (hex or named). If missing, a default is used.
 *  - name: optional department name to display next to the icon.
 */
const StatusBadge = ({ color = "#2563eb", name }) => {
  const label = name || color;

  // If `color` is a Tailwind color token like 'amber-600', prefer generating
  // Tailwind classes so the badge uses themed colors and hover states.
  const tailwindTokenMatch =
    typeof color === "string" && /^([a-z]+-\d{3})$/i.test(color);

  if (tailwindTokenMatch) {
    // e.g. color = 'amber-600' -> name = 'amber', classes use amber-600 for bg and amber-500 for text
    const token = color;
    const nameToken = token.split("-")[0];
    const classes = `bg-${token}/10 dark:bg-${token}/20 hover:bg-${token}/10 text-${nameToken}-500 shadow-none rounded-full inline-flex items-center gap-2 px-2 py-1`;
    return (
      <Badge className={classes}>
        <Dot size={14} />
        <span className="text-xs font-medium">{label}</span>
      </Badge>
    );
  }

  // Fallback: accept arbitrary css color values (hex or named colors) and compute readable text color.
  const bg = color;
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
      className="shadow-none rounded-full inline-flex items-center gap-2 px-2 py-1 hover:opacity-95"
    >
      <Building size={14} />
      <span className="text-xs font-medium">{label}</span>
    </Badge>
  );
};

export default StatusBadge;
