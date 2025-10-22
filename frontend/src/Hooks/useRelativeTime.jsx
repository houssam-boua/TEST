import React from "react";

// Returns a human readable relative time like "6 min ago", "2 hours ago", "9 days ago"
export default function useRelativeTime(dateInput) {
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60 * 1000); // update every minute
    return () => clearInterval(id);
  }, []);

  const toRelative = React.useCallback(
    (d) => {
      if (!d) return "-";
      const time =
        typeof d === "string" || typeof d === "number"
          ? new Date(d).getTime()
          : d.getTime();
      if (Number.isNaN(time)) return "-";
      const diff = Math.floor((now - time) / 1000);
      if (diff < 60)
        return diff <= 1 ? "just now" : `${diff} sec${diff > 1 ? "s" : ""} ago`;
      const mins = Math.floor(diff / 60);
      if (mins < 60) return mins === 1 ? "1 min ago" : `${mins} min ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24)
        return hours === 1
          ? "1 hour ago"
          : `${hours} hour${hours > 1 ? "s" : ""} ago`;
      const days = Math.floor(hours / 24);
      if (days < 14) return days === 1 ? "1 day ago" : `${days} days ago`;
      const weeks = Math.floor(days / 7);
      if (weeks < 8) return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
      const months = Math.floor(days / 30);
      if (months < 12)
        return months === 1 ? "1 month ago" : `${months} months ago`;
      const years = Math.floor(days / 365);
      return years === 1 ? "1 year ago" : `${years} years ago`;
    },
    [now]
  );

  return React.useMemo(() => toRelative(dateInput), [dateInput, toRelative]);
}
