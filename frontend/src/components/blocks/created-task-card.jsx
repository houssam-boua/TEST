import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

const formatAssignee = (taskAssignedTo) => {
  if (typeof taskAssignedTo === "object" && taskAssignedTo) {
    const fullName = `${taskAssignedTo.first_name || ""} ${
      taskAssignedTo.last_name || ""
    }`.trim();
    return fullName || taskAssignedTo.username || "Unassigned";
  }
  return taskAssignedTo || "Unassigned";
};

const CreatedTaskCard = ({ task, onEdit, onDelete }) => (
  <Card className="p-4 relative">
    <div className="absolute top-4 right-4 flex gap-2">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onEdit?.(task.id)}
        className="h-8 w-8"
        title="Edit task"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onDelete?.(task.id)}
        className="h-8 w-8 text-destructive hover:text-destructive"
        title="Delete task"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
      <div>
        <p className="text-xs text-muted-foreground mb-1">Task Name</p>
        <p className="font-medium">{task.task_name}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">Priority</p>
        <p className="font-medium capitalize">{task.task_priorite}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">Status</p>
        <p className="font-medium">{task.task_statut?.replace(/_/g, " ")}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
        <p className="font-medium">{formatAssignee(task.task_assigned_to)}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">Due Date</p>
        <p className="font-medium">{task.task_date_echeance || "N/A"}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">Task ID</p>
        <p className="font-medium">#{task.id}</p>
      </div>
    </div>
  </Card>
);

export default CreatedTaskCard;
