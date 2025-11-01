import React from "react";
import { Button } from "@/components/ui/button";
const DeleteRole = ({ role, onDelete, onCancel, loading }) => {
  if (!role) return null;

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        type="button"
        variant="destructive"
        onClick={() => onDelete(role)}
        disabled={loading}
      >
        {loading ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
};

export default DeleteRole;
