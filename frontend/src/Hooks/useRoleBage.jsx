import React from "react";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

const useRoleBadge = ({ role }) => {
  switch (role) {
    case "admin":
      return (
        <Badge className="rounded-full pl-1 gap-1.5">
          <User className="h-4 w-4" />
          Admin
        </Badge>
      );
    case "validator":
      return (
        <Badge  className="rounded-full pl-1 gap-1.5">
          <User className="h-4 w-4" />
          validator
        </Badge>
      );
    case "user":
      return (
        <Badge className="rounded-full pl-1 gap-1.5">
          <User className="h-4 w-4" />
          user
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

export default useRoleBadge;
