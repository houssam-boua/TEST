import React from "react";
import {
  ChevronDown,
  ListChecks,
  Check,
  ArrowUpFromLine,
  ScanSearch,
  BookOpenCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import useBadge from "../../Hooks/useBage";
const CollapsibleCard = ({
  title = "Collapsible Card",
  defaultOpen = false,
  currentStep = 1, // 1: Distributed, 2: Reviewing, 3: Validated
  stepDescriptions = "Elyass Elhajji",
  stepDate = "12/10/2023",
  children,
}) => {
  const [open, setOpen] = React.useState(defaultOpen);
  const stepLabels = ["Distributed", "Reviewing", "Validated"]; // corrected labels
  const stepIcons = [ArrowUpFromLine, ScanSearch, BookOpenCheck];

  const getStepState = (index) => {
    // index is 1-based
    if (index < currentStep) return "completed";
    if (index === currentStep) return "current";
    return "pending";
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full">
      <Card className="px-0 py-0 border border-muted/50">
        <CardHeader className="flex flex-row items-center justify-between gap-2 py-3 px-5">
          <div className="flex min-w-0 flex-row items-center justify-between gap-3">
            <CardTitle className="truncate flex flex-row items-center justify-center gap-2">
              <ListChecks
                size={16}
                strokeWidth={1.75}
                className="text-primary"
              />
              <span className="text-muted-foreground">Task 1:</span>
              <span className="font-medium text-muted-foreground">{title}</span>
            </CardTitle>
          </div>

          <div>
            <span className="text-sm text-muted-foreground">
              {stepDescriptions}
            </span>
          </div>

          <div>
            <span className="text-sm text-muted-foreground">{stepDate}</span>
          </div>
          <div className="flex items-center gap-3">
            {useBadge({ state: "pending" })}

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
          </div>
        </CardHeader>
        {/* Stepper */}

        <CollapsibleContent className="bg-muted/30">
          <div className=" ">
            {children ?? (
              <div className="px-6 py-4">
                <div className="flex items-center">
                  {stepLabels.map((label, i) => {
                    const index = i + 1;
                    const state = getStepState(index);
                    const isLast = index === stepLabels.length;
                    const Icon = stepIcons[i] ?? ArrowUpFromLine;
                    const circleBase =
                      "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-sm";
                    const circleStyles =
                      state === "completed"
                        ? "bg-primary text-primary-foreground border-primary"
                        : state === "current"
                        ? "border-primary text-primary bg-background"
                        : "border-muted-foreground/30 text-muted-foreground bg-background";
                    const barStyles =
                      state === "completed"
                        ? "bg-primary"
                        : state === "current"
                        ? "bg-primary/60"
                        : "bg-muted";

                    return (
                      <React.Fragment key={label}>
                        <div className="flex items-center min-w-0">
                          <div className={`${circleBase} ${circleStyles}`}>
                            {state === "completed" ? (
                              <Check className="h-4 w-4" strokeWidth={2.5} />
                            ) : (
                              <Icon className="h-4 w-4" strokeWidth={2.25} />
                            )}
                          </div>
                          <div className="ml-2 flex flex-col min-w-0">
                            <span
                              className={`text-xs sm:text-sm truncate ${
                                state === "pending"
                                  ? "text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {label}
                            </span>
                          </div>
                        </div>
                        {!isLast && (
                          <div
                            className={`mx-2 flex-1 h-[2px] ${barStyles}`}
                          ></div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default CollapsibleCard;
