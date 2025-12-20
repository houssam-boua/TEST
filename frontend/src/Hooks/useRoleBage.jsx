import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckLine, PenLine, User } from "lucide-react";

const useRoleBadge = ({ role }) => {
  switch (role) {
    case "admin":
      return (
        <span className="rounded-full pl-1 gap-1.5   flex items-center">
          <User className="h-4 w-4 stroke-accent/80 " />
          Admin
        </span>
      );
    case "validator":
      return (
        <span className="rounded-full pl-1 gap-1.5   flex items-center">
          <CheckLine className="h-4 w-4 stroke-blue-400/80" />
          validator
        </span>
      );
    case "user":
      return (
        <span className="rounded-full pl-1 gap-1.5   flex items-center">
          <PenLine className="h-4 w-4 stroke-emerald-400/80" />
          user
        </span>
      );
    default:
      return (
        <Badge className="bg-gray-600/10 dark:bg-gray-600/20 hover:bg-gray-600/10 text-gray-500 shadow-none rounded-full">
          <div className="h-1.5 w-1.5 rounded-full bg-gray-500 mr-2" /> Unknown
        </Badge>
      );
  }
};

export default useRoleBadge;
