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
        <Badge
          variant="outline"
          className="border-green-600 text-green-600 dark:border-green-400 dark:text-green-400 [a&]:hover:bg-green-600/10 [a&]:hover:text-green-600/90 dark:[a&]:hover:bg-green-400/10 dark:[a&]:hover:text-green-400/90"
        >
          <CheckCircleIcon className="size-3" />
          Successful
        </Badge>
      );

    case "accepted":
      return (
        <Badge
          variant="outline"
          className="border-green-600 text-green-600 dark:border-green-400 dark:text-green-400 [a&]:hover:bg-green-600/10 [a&]:hover:text-green-600/90 dark:[a&]:hover:bg-green-400/10 dark:[a&]:hover:text-green-400/90"
        >
          <CheckCircleIcon className="size-3" />
          Accepted
        </Badge>
      );

    case "completed":
      return (
        <Badge
          variant="outline"
          className="border-green-600 text-green-600 dark:border-green-400 dark:text-green-400 [a&]:hover:bg-green-600/10 [a&]:hover:text-green-600/90 dark:[a&]:hover:bg-green-400/10 dark:[a&]:hover:text-green-400/90"
        >
          <CheckCircleIcon className="size-3" />
          Completed
        </Badge>
      );
    case "in_progress":
      return (
        <Badge
          variant="outline"
          className="border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400 [a&]:hover:bg-amber-600/10 [a&]:hover:text-amber-600/90 dark:[a&]:hover:bg-amber-400/10 dark:[a&]:hover:text-amber-400/90"
        >
          <AlertCircleIcon className="size-3" />
          In Progress
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="outline"
          className="border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400 [a&]:hover:bg-amber-600/10 [a&]:hover:text-amber-600/90 dark:[a&]:hover:bg-amber-400/10 dark:[a&]:hover:text-amber-400/90"
        >
          <AlertCircleIcon className="size-3" />
          Pending
        </Badge>
      );
    case "not_started":
      return (
        <Badge
          variant="outline"
          className="border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400 [a&]:hover:bg-amber-600/10 [a&]:hover:text-amber-600/90 dark:[a&]:hover:bg-amber-400/10 dark:[a&]:hover:text-amber-400/90"
        >
          <AlertCircleIcon className="size-3" />
          Not Started
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="outline"
          className="text-destructive [a&]:hover:bg-destructive/10 [a&]:hover:text-destructive/90 border-destructive"
        >
          <BanIcon className="size-3" />
          Failed
        </Badge>
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
