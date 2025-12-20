import React from "react";
import { Button } from "@/components/ui/button";

const DeleteTaskForm = ({ task, onDelete, onCancel, loading }) => {
  if (!task) return null;

  return (
    <div className="flex flex-col gap-4 w-full max-w-xl">
      <p className="text-sm text-muted-foreground">
        Are you sure you want to delete the task "{task.task_name}" (ID #
        {task.id})?
      </p>
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => onDelete?.(task)}
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
};

export default DeleteTaskForm;
