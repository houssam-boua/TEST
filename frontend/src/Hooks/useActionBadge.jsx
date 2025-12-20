import React from "react";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Trash, User } from "lucide-react";

const useActionBadge = ({ action }) => {
  switch (action) {
    case "create":
      return (
        <Badge className="rounded-full p-1 gap-1.5 bg-secondary text-secondary-foreground/70">
          <Plus className="h-4 w-4" />
        </Badge>
      );
    case "edit":
      return (
        <Badge className="rounded-full  gap-1.5">
          <Pencil className="h-4 w-4" />
        </Badge>
      );
    case "delete":
      return (
        <Badge className="rounded-full  gap-1.5 bg-destructive text-destructive-foreground">
          <Trash className="h-4 w-4" />
          Delete
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-600/10 dark:bg-gray-600/20 hover:bg-gray-600/10 text-gray-500 shadow-none rounded-full">
          <div className="h-1.5 w-1.5 rounded-full bg-gray-500 mr-2" /> Unknown
        </Badge>
      );
  }
};

export default useActionBadge;
