import React from "react";
import { TableHeader, TableHead, TableRow } from "@/components/ui/table";
const CostumeTableHeader = () => {
  return (
    <TableHeader className="border-b-2 border-muted w-full items-center justify-center ">
      <TableRow className="border-b-2 border-muted flex items-center justify-between w-full py-0">
        <TableHead className="text-xs">Name</TableHead>
        <TableHead className="text-muted-foreground text-xs">
          Validator
        </TableHead>
        <TableHead className="text-muted-foreground text-xs">
          Due Date
        </TableHead>
        <TableHead className="text-muted-foreground text-xs">Status</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default CostumeTableHeader;
