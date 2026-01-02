import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CostumeCardTitle from "../collection/costume-card-title";
import { 
  FileEdit, 
  FileCheck, 
  FileSignature, 
  Send,
  ChevronRight 
} from "lucide-react";
import { useGetWorkflowsByStateQuery } from "@/slices/dashboardslices";

const WORKFLOW_STATES = {
  "Élaboration": { 
    icon: FileEdit, 
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    label: "Élaboration"
  },
  "Vérification": { 
    icon: FileCheck, 
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    label: "Vérification"
  },
  "Approbation": { 
    icon: FileSignature, 
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    label: "Approbation"
  },
  "Diffusion": { 
    icon: Send, 
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    label: "Diffusion"
  },
};

function WorkflowStateSection({ state, count, workflows }) {
  const config = WORKFLOW_STATES[state] || {
    icon: FileEdit,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: state,
  };

  const Icon = config.icon;

  return (
    <div className="border-b border-border last:border-0 pb-3 last:pb-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded ${config.bgColor}`}>
            <Icon className={`h-4 w-4 ${config.color}`} />
          </div>
          <h4 className="text-sm font-medium">{config.label}</h4>
        </div>
        <Badge variant="secondary" className="text-xs">
          {count} {count === 1 ? "document" : "documents"}
        </Badge>
      </div>

      {workflows && workflows.length > 0 ? (
        <ul className="space-y-1.5 ml-9">
          {workflows.map((wf) => (
            <li
              key={wf.id}
              className="group flex items-center justify-between py-1.5 px-2 -mx-2 rounded hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-foreground truncate">
                  {wf.document?.title || "Sans titre"}
                </div>
                {wf.document?.code && (
                  <div className="text-[11px] text-muted-foreground truncate">
                    {wf.document.code}
                  </div>
                )}
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground ml-9">Aucun document</p>
      )}
    </div>
  );
}

export default function WorkflowStatusCard() {
  const { data, isLoading, isError } = useGetWorkflowsByStateQuery();

  const states = React.useMemo(() => {
    const source = Array.isArray(data) ? data : data?.data || [];
    
    // Order by workflow progression
    const order = ["Élaboration", "Vérification", "Approbation", "Diffusion"];
    return source.sort((a, b) => {
      const aIndex = order.indexOf(a.etat);
      const bIndex = order.indexOf(b.etat);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
  }, [data]);

  return (
    <Card className="col-span-12 lg:col-span-6 xl:col-span-4">
      <CardHeader className="pb-3">
        <CostumeCardTitle title="État du workflow" />
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Chargement...</div>
        ) : isError ? (
          <div className="text-sm text-destructive">
            Impossible de charger les workflows
          </div>
        ) : states.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Aucun workflow en cours
          </div>
        ) : (
          <div className="space-y-3 max-h-[320px] overflow-auto pr-1">
            {states.map((state) => (
              <WorkflowStateSection
                key={state.etat}
                state={state.etat}
                count={state.count}
                workflows={state.workflows}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
