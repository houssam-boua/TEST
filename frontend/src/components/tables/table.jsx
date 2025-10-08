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
const names = [
  {
    name: "Construction contract",
    class: "Proposal",
    dueDate: "16.07.2023",
    owner: "Jhon Doe",
    more: (
      <ChevronRight
        strokeWidth={0.75}
         className="h-4 w-4 text-muted-foreground"
      />
    ),
  },
  {
    name: "Application for leave",
    class: "Application",
    dueDate: "16.07.2023",
    owner: "Jane Doe",
    more: (
      <ChevronRight
        strokeWidth={0.75}
        className="h-4 w-4 text-muted-foreground"
      />
    ),
  },
  {
    name: "Suggestion for leave",
    class: "Proposal",
    dueDate: "16.07.2023",
    owner: "Mike Doe",
    more: (
      <ChevronRight
        strokeWidth={0.75}
        className="h-4 w-4 text-muted-foreground"
      />
    ),
  },
  {
    name: "Offer for sale",
    class: "Proposal",
    dueDate: "16.07.2023",
    owner: "Jhon Doe",
    more: (
      <ChevronRight
        strokeWidth={0.75}
        className="h-4 w-4 text-muted-foreground"
      />
    ),
  },
  {
    name: "Application for joining",
    class: "Application",
    dueDate: "16.07.2023",
    owner: "Mike kan",
    more: (
      <ChevronRight
        strokeWidth={0.75}
        className="h-4 w-4 text-muted-foreground"
      />
    ),
  },
];

const TableDemo = () => {
  return (
    <Table className=" rounded-md">
      <TableHeader>
        <TableRow className="border-b-2 border-muted">
          <TableHead className="w-[100px] text-xs">Name</TableHead>
          <TableHead className="text-muted-foreground text-xs">Class</TableHead>
          <TableHead className="text-muted-foreground text-xs">
            Due Date
          </TableHead>
          <TableHead className="text-right text-muted-foreground text-xs">
            Owner
          </TableHead>
          <TableHead className="text-right text-muted-foreground text-xs"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="">
        {names.map((name) => (
          <TableRow
            key={name.name}
            className="border-b border-muted last:border-0 hover:border-primary/40"
          >
            <TableCell className="font-medium">{name.name}</TableCell>
            <TableCell className="text-muted-foreground">
              {name.class}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {name.owner}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {name.dueDate}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {name.more}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TableDemo;
