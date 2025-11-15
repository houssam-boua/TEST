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
        <Badge className="bg-destructive/10 [a&]:hover:bg-destructive/5 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive rounded-full border-none focus-visible:outline-none">
          <span
            className="bg-destructive size-1.5 rounded-full"
            aria-hidden="true"
          />
          Urgent
        </Badge>
      );
    case "high":
      return (
        <Badge
          variant="outline"
          className="border-chart-4 text-chart-4 dark:border-chart-4 dark:text-chart-4 [a&]:hover:bg-chart-4/10 [a&]:hover:text-chart-4/90 dark:[a&]:hover:bg-chart-4/10 dark:[a&]:hover:text-chart-4/90"
        >
          <CheckCircleIcon className="size-3" />
          Accepted
        </Badge>
      );

    case "normal":
      return (
        <Badge
          variant="outline"
          className="border-chart-4 text-chart-4 dark:border-chart-4 dark:text-chart-4 [a&]:hover:bg-chart-4/10 [a&]:hover:text-chart-4/90 dark:[a&]:hover:bg-chart-4/10 dark:[a&]:hover:text-chart-4/90"
        >
      <span className='bg-chart-4 size-1.5 rounded-full' aria-hidden='true' />
          Normal
        </Badge>
      );
    case "low":
      return (
        <Badge
          variant="outline"
          className="border-chart-5 text-chart-5 dark:border-chart-5 dark:text-chart-5 [a&]:hover:bg-chart-5/10 [a&]:hover:text-chart-5/90 dark:[a&]:hover:bg-chart-5/10 dark:[a&]:hover:text-chart-5/90"
        >
          <AlertCircleIcon className="size-3" />
          In Progress
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
