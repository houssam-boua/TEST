import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronRight } from "lucide-react";
import { useGetDashboardDocumentsRecentQuery } from "@/Slices/dashboardSlices";
import React from "react";

// Map API recent documents to table rows. Handles several possible response shapes.
const mapRecentToRows = (data) => {
  if (!data) return [];
  let list = [];
  if (Array.isArray(data)) list = data;
  else if (Array.isArray(data.results)) list = data.results;
  else if (Array.isArray(data.data)) list = data.data;
  else if (Array.isArray(data.docs)) list = data.docs;
  else if (data.data && Array.isArray(data.data.results))
    list = data.data.results;

  return list.map((d) => {
    const title =
      d.doc_title ||
      d.title ||
      d.name ||
      d.name_text ||
      d.filename ||
      (d.data && d.data.title) ||
      "Untitled";
    const cls = d.doc_category || d.doc_type || d.category || d.type || "-";
    const owner =
      d.doc_owner?.username ||
      (d.doc_owner &&
        `${d.doc_owner.first_name || ""} ${
          d.doc_owner.last_name || ""
        }`.trim()) ||
      d.owner ||
      d.owner_name ||
      "-";
    const date =
      d.doc_creation_date ||
      d.created_at ||
      d.createdAt ||
      d.date ||
      d.uploaded ||
      null;
    const more = (
      <ChevronRight
        strokeWidth={0.75}
        className="h-4 w-4 text-muted-foreground"
      />
    );
    return {
      name: title,
      class: cls,
      dueDate: date ? new Date(date).toLocaleDateString("fr-FR") : "-",
      owner,
      more,
    };
  });
};

const TableDemo = () => {
  const { data, isLoading, isError, error } =
    useGetDashboardDocumentsRecentQuery();
  const rows = React.useMemo(() => mapRecentToRows(data), [data]);

  return (
    <Table className=" rounded-md">
      <TableHeader>
        <TableRow className="border-b-2 border-muted">
          <TableHead className="w-[100px] text-xs">Name</TableHead>
          <TableHead className="text-muted-foreground text-xs">Class</TableHead>
          <TableHead className="text-muted-foreground text-xs">Owner</TableHead>
          <TableHead className="text-right text-muted-foreground text-xs">
            Due Date
          </TableHead>
          <TableHead className="text-right text-muted-foreground text-xs"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="">
        {isLoading && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-muted-foreground"
            >
              Loading recent documents…
            </TableCell>
          </TableRow>
        )}
        {isError && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-red-600">
              Error loading recent documents: {String(error)}
            </TableCell>
          </TableRow>
        )}
        {!isLoading && !isError && rows.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-muted-foreground"
            >
              No recent documents
            </TableCell>
          </TableRow>
        )}
        {!isLoading &&
          !isError &&
          rows.map((row) => (
            <TableRow
              key={row.name + Math.random()}
              className="border-b border-muted last:border-0 hover:border-primary/40"
            >
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {row.class}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.owner}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {row.dueDate}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {row.more}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};

export default TableDemo;
