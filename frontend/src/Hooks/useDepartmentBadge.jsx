import React from "react";
import { Badge } from "@/components/ui/badge";
import { Building } from "lucide-react";
const useDepartmentBadge = ({ departement }) => {
  switch (departement) {
    case "HR":
      return (
        <Badge className="bg-amber-600/10 dark:bg-amber-600/20 hover:bg-amber-600/10 text-amber-500 border-amber-600/60 shadow-none rounded-full">
          <Building /> HR
        </Badge>
      );
    case "IT":
      return (
        <Badge className="bg-blue-600/10 dark:bg-blue-600/20 hover:bg-blue-600/10 text-blue-500 border-blue-600/60 shadow-none rounded-full">
          <Building /> IT
        </Badge>
      );
    case "Finance":
      return (
        <Badge className="bg-green-600/10 dark:bg-green-600/20 hover:bg-green-600/10 text-green-500 border-green-600/60 shadow-none rounded-full">
          <Building /> Finance
        </Badge>
      );
    case "Marketing":
      return (
        <Badge className="bg-purple-600/10 dark:bg-purple-600/20 hover:bg-purple-600/10 text-purple-500 border-purple-600/60 shadow-none rounded-full">
          <Building /> Marketing
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-600/10 dark:bg-gray-600/20 hover:bg-gray-600/10 text-gray-500 border-gray-600/60 shadow-none rounded-full">
          <Building /> {departement}
        </Badge>
      );
  }
};
export default useDepartmentBadge;
