"use client";

import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import nodata from "../../assets/nodata.svg";

/**
 * ExpandableDataTable Component
 * A professional expandable data table using TanStack Table
 *
 * @component
 * @example
 * const columns = [
 *   { accessorKey: "name", header: "Name" },
 *   { accessorKey: "email", header: "Email" },
 * ];
 *
 * const subComponent = ({ row }) => (
 *   <div className="p-4 bg-gray-50">
 *     <p>Details for {row.original.name}</p>
 *   </div>
 * );
 *
 * <ExpandableDataTable
 *   data={data}
 *   columns={columns}
 *   renderSubComponent={subComponent}
 * />
 */
export function ExpandableDataTable({
  data,
  columns,
  renderSubComponent,
  enableSearch = true,
  searchPlaceholder = "Search...",
  enablePagination = true,
  pageSize = 10,
}) {
  const [expanded, setExpanded] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSize,
  });

  // Expand/collapse toggle handler
  const toggleExpanded = (rowId) => {
    setExpanded((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  // Expand all rows
  const expandAll = () => {
    const allExpanded = {};
    table.getRowModel().rows.forEach((row) => {
      allExpanded[row.id] = true;
    });
    setExpanded(allExpanded);
  };

  // Collapse all rows
  const collapseAll = () => {
    setExpanded({});
  };

  // Define the expander column
  const expanderColumn = {
    id: "expander",
    enableSorting: false,
    enableHiding: false,
    size: 40,
    header: () => (
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={expandAll}
          title="Expand all"
          className="h-6 w-6 p-0"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={collapseAll}
          title="Collapse all"
          className="h-6 w-6 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleExpanded(row.id)}
        className="h-6 w-6 p-0"
        aria-label={expanded[row.id] ? "Collapse row" : "Expand row"}
      >
        {expanded[row.id] ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    ),
  };

  // Combine columns with expander
  const allColumns = [expanderColumn, ...columns];

  // Initialize table
  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    getFilteredRowModel: enableSearch ? getFilteredRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    state: {
      expanded,
      globalFilter,
      sorting,
      pagination,
    },
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    enableRowSelection: false,
  });

  const totalRows = enableSearch
    ? table.getFilteredRowModel().rows.length
    : table.getPrePaginationRowModel().rows.length;

  return (
    <div className="space-y-4">
      {enableSearch && (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
          {globalFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGlobalFilter("")}
            >
              Clear
            </Button>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-muted bg-white">
        <Table className="bg-white">
          <TableHeader className="sticky top-0 z-10 bg-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="cursor-pointer select-none text-muted-foreground border-0 border-b border-b-muted font-medium"
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() && (
                        <span>
                          {header.column.getIsSorted() === "desc" ? "↓" : "↑"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-y divide-muted text-muted-foreground/80">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    className={`${
                      expanded[row.id] ? "bg-muted/30" : "bg-white"
                    } hover:bg-muted/50 transition-colors`}
                    data-state={expanded[row.id] ? "expanded" : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                        className="align-middle"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>

                  {expanded[row.id] && renderSubComponent && (
                    <TableRow className="bg-muted/20 hover:bg-muted/30">
                      <TableCell colSpan={row.getVisibleCells().length}>
                        <div className="py-4">
                          {renderSubComponent({ row })}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow className="bg-white border-muted">
                <TableCell
                  colSpan={allColumns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <img src={nodata} alt="No results" width={64} height={64} />
                    <span>No results found.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {enablePagination && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} sur{" "}
            {table.getPageCount() || 1} • {totalRows} résultats
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>

            <Select
              value={String(table.getState().pagination.pageIndex)}
              onValueChange={(value) => table.setPageIndex(parseInt(value, 10))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: table.getPageCount() || 1 }).map(
                  (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {i + 1}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>

            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Example usage component demonstrating the ExpandableDataTable
 */
export function ExpandableDataTableDemo() {
  const mockData = [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      department: "Engineering",
      status: "Active",
      details: {
        joinDate: "2023-01-15",
        role: "Senior Developer",
        projects: ["ProjectA", "ProjectB"],
      },
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob@example.com",
      department: "Marketing",
      status: "Active",
      details: {
        joinDate: "2023-06-20",
        role: "Marketing Manager",
        projects: ["Campaign2024"],
      },
    },
    {
      id: 3,
      name: "Carol White",
      email: "carol@example.com",
      department: "Design",
      status: "Inactive",
      details: {
        joinDate: "2022-11-10",
        role: "UI/UX Designer",
        projects: ["DesignSystem"],
      },
    },
    {
      id: 4,
      name: "David Brown",
      email: "david@example.com",
      department: "Engineering",
      status: "Active",
      details: {
        joinDate: "2023-03-05",
        role: "Junior Developer",
        projects: ["ProjectC"],
      },
    },
  ];

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div className="text-sm">{row.original.email}</div>,
    },
    {
      accessorKey: "department",
      header: "Department",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.original.status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
  ];

  const renderSubComponent = ({ row }) => (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-600">Join Date</p>
          <p className="text-sm">{row.original.details.joinDate}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600">Role</p>
          <p className="text-sm">{row.original.details.role}</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-600">Projects</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {row.original.details.projects.map((project) => (
            <span
              key={project}
              className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
            >
              {project}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Team Members</h1>
        <p className="text-gray-600">
          Click the arrow to expand and see more details
        </p>
      </div>
      <ExpandableDataTable
        data={mockData}
        columns={columns}
        renderSubComponent={renderSubComponent}
        enableSearch={true}
        searchPlaceholder="Search team members..."
        enablePagination={true}
        pageSize={10}
      />
    </div>
  );
}
