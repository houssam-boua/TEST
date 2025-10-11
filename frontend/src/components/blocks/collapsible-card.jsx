import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const CollapsibleCard = ({
  title = "Collapsible Card",
  description = "Click to expand or collapse",
  defaultOpen = false,
  children,
}) => {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div className="flex min-w-0 flex-col">
            <CardTitle className="truncate">{title}</CardTitle>
            <CardDescription className="truncate">
              {description}
            </CardDescription>
          </div>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={open ? "Collapse" : "Expand"}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <div className="px-6 pb-6">
            {children ?? (
              <p className="text-sm text-muted-foreground">
                Content goes here…
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default CollapsibleCard;
