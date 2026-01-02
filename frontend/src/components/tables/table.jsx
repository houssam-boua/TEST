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
import { useGetDashboardDocumentsRecentQuery } from "@/slices/dashboardslices";
import React from "react";
import StatusBadge from "../../Hooks/useStatusBadge";
import useTitleSplit from "../../Hooks/useTitleSplit";

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
    const title = d.title || (d.data && d.data.title) || "Untitled";
    const type = d.type || (d.data && d.data.type) || "Unknown";
    const status = d.doc_status || d.status;
    const owner = d.owner || "-";
    const date = d.created_at || null;
    const more = (
      <ChevronRight
        strokeWidth={0.75}
        className="h-4 w-4 text-muted-foreground"
      />
    );
    return {
      name: title,
      type: type,
      status: status,
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
          <TableHead className="w-[100px] text-xs">Type</TableHead>
          <TableHead className="text-muted-foreground text-xs">Owner</TableHead>

          <TableHead className="text-muted-foreground text-xs">
            Status
          </TableHead>
          <TableHead className="text-right text-muted-foreground text-xs">
            Date creation
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
              {/* Title and type split using hook */}
              <TitleCell title={row.name} />
              <TableCell className="text-muted-foreground/60">
                {row.owner}
              </TableCell>

              <TableCell className="text-muted-foreground/60">
                <StatusBadge status={row.status} />
              </TableCell>

              <TableCell className="text-right text-muted-foreground/60">
                {row.dueDate}
              </TableCell>
              <TableCell className="text-right text-muted-foreground/60">
                {row.more}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};

// Small presentational component that uses the useTitleSplit hook to split the
// document title into a name and a type and render two table cells.
function TitleCell({ title }) {
  const { name, type } = useTitleSplit(title);

  return (
    <>
      <TableCell className="font-medium ">{name}</TableCell>
      <TableCell className="font-medium text-muted-foreground/60">
        {type || ""}
      </TableCell>
    </>
  );
}

export default TableDemo;
