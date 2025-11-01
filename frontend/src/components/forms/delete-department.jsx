import React from "react";
import { Button } from "@/components/ui/button";

const DeleteDepartment = ({ department, onDelete, onCancel, loading }) => {
  if (!department) return null;

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        type="button"
        variant="destructive"
        onClick={() => onDelete(department)}
        disabled={loading}
      >
        {loading ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
};

export default DeleteDepartment;
