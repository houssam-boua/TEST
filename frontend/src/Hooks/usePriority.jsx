import {
  AlertCircle,
  AlertCircleIcon,
  BanIcon,
  CheckCircleIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
const PriorityBadge = ({ priority }) => {
  switch ((priority || "").toLowerCase()) {
    case "urgent":
      return (
        <Badge className="bg-destructive/10 [a&]:hover:bg-destructive/5 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive border-none focus-visible:outline-none">
          <span
            className="bg-destructive size-1.5 rounded-full"
            aria-hidden="true"
          />
          Urgent
        </Badge>
      );
    case "high":
      return (
        <Badge className="border-none bg-amber-600/10 text-amber-600 focus-visible:ring-amber-600/20 focus-visible:outline-none dark:bg-amber-400/10 dark:text-amber-400 dark:focus-visible:ring-amber-400/40 [a&]:hover:bg-amber-600/5 dark:[a&]:hover:bg-amber-400/5">
          <span
            className="size-1.5 rounded-full bg-amber-600 dark:bg-amber-400"
            aria-hidden="true"
          />
          High
        </Badge>
      );

    case "normal":
      return (
        <Badge
          variant="outline"
          className="border-chart-4 text-chart-4 dark:border-chart-4 dark:text-chart-4 [a&]:hover:bg-chart-4/10 [a&]:hover:text-chart-4/90 dark:[a&]:hover:bg-chart-4/10 dark:[a&]:hover:text-chart-4/90"
        >
          <span
            className="bg-chart-4 size-1.5 rounded-full"
            aria-hidden="true"
          />
          Normal
        </Badge>
      );
    case "low":
      return (
        <Badge className="border-none bg-yellow-600/10 text-yellow-600 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5">
          <span
            className="size-1.5 rounded-full bg-yellow-600 dark:bg-yellow-400"
            aria-hidden="true"
          />
          Low
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

export default PriorityBadge;
