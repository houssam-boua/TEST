import {
  AlertCircle,
  AlertCircleIcon,
  BanIcon,
  CheckCircleIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
const StatusBadge = ({ status }) => {
  switch ((status || "").toLowerCase()) {
    case "approved":
      return (
        <span
          className="size-1.5 rounded-full font-semibold text-green-600 dark:text-green-400 "
          aria-hidden="true"
        >
          Successful
        </span>
      );

    case "accepted":
      return (
        <span
          className="size-1.5 rounded-full font-semibold text-green-600 dark:text-green-400 "
          aria-hidden="true"
        >
          Accepted
        </span>
      );

    case "completed":
      return (
        <span
          className="size-1.5 rounded-full font-semibold text-green-700 dark:text-green-600"
          aria-hidden="true"
        >
          Completed
        </span>
      );
    case "in_progress":
      return (
        <span
          className="size-1.5 rounded-full font-semibold text-amber-700 dark:text-amber-600"
          aria-hidden="true"
        >
          In Progress
        </span>
      );
    case "pending":
      return (
        <span
          className="size-1.5 rounded-full font-semibold text-amber-700 dark:text-amber-600"
          aria-hidden="true"
        >
          Pending
        </span>
      );
    case "not_started":
      return (
        <span
          className="size-1.5 rounded-full font-semibold text-amber-700 dark:text-amber-600"
          aria-hidden="true"
        >
          Not Started
        </span>
      );
    case "rejected":
      return (
        <span
          className="text-destructive size-1.5 rounded-full font-semibold "
          aria-hidden="true"
        >
          Failed
        </span>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="text-muted-foreground border-muted-foreground [a&]:hover:bg-muted-foreground/10 [a&]:hover:text-muted-foreground/90"
        >
          <AlertCircle className="size-3" />
          Unknown
        </Badge>
      );
  }
};

export default StatusBadge;
