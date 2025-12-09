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
        <Badge className="border-none bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5">
          <span
            className="size-1.5 rounded-full bg-green-600 dark:bg-green-400"
            aria-hidden="true"
          />
          Successful
        </Badge>
      );

    case "accepted":
      return (
        <Badge className="border-none bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5">
          <span
            className="size-1.5 rounded-full bg-green-600 dark:bg-green-400"
            aria-hidden="true"
          />
          Accepted
        </Badge>
      );

    case "completed":
      return (
        <Badge className="border-none bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5">
          <span
            className="size-1.5 rounded-full bg-green-600 dark:bg-green-400"
            aria-hidden="true"
          />
          Completed
        </Badge>
      );
    case "in_progress":
      return (
        <Badge className="border-none bg-amber-600/10 text-amber-600 focus-visible:ring-amber-600/20 focus-visible:outline-none dark:bg-amber-400/10 dark:text-amber-400 dark:focus-visible:ring-amber-400/40 [a&]:hover:bg-amber-600/5 dark:[a&]:hover:bg-amber-400/5">
          <span
            className="size-1.5 rounded-full bg-amber-600 dark:bg-amber-400"
            aria-hidden="true"
          />
          In Progress
        </Badge>
      );
    case "pending":
      return (
        <Badge className="border-none bg-amber-600/10 text-amber-600 focus-visible:ring-amber-600/20 focus-visible:outline-none dark:bg-amber-400/10 dark:text-amber-400 dark:focus-visible:ring-amber-400/40 [a&]:hover:bg-amber-600/5 dark:[a&]:hover:bg-amber-400/5">
          <span
            className="size-1.5 rounded-full bg-amber-600 dark:bg-amber-400"
            aria-hidden="true"
          />
          Pending
        </Badge>
      );
    case "not_started":
      return (
        <Badge className="border-none bg-amber-600/10 text-amber-600 focus-visible:ring-amber-600/20 focus-visible:outline-none dark:bg-amber-400/10 dark:text-amber-400 dark:focus-visible:ring-amber-400/40 [a&]:hover:bg-amber-600/5 dark:[a&]:hover:bg-amber-400/5">
          <span
            className="size-1.5 rounded-full bg-amber-600 dark:bg-amber-400"
            aria-hidden="true"
          />
          Not Started
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-destructive/10 [a&]:hover:bg-destructive/5 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive border-none focus-visible:outline-none">
          <span
            className="bg-destructive size-1.5 rounded-full"
            aria-hidden="true"
          />
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
