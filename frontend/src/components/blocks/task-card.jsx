import React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import PriorityBadge from "../../Hooks/usePriority";
import StatusBadge from "../../Hooks/useStatusBadge";
const TaskCard = ({
  id,
  created_at,
  task_name,
  task_assigned_to,
  task_priorite,
  task_statut,
  task_date_echeance,
}) => {
  const formatDate = (d) => {
    if (!d) return "";
    const date =
      typeof d === "string" || typeof d === "number" ? new Date(d) : d;
    if (!(date instanceof Date) || Number.isNaN(date.getTime()))
      return String(d);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const createdFormatted = formatDate(created_at);
  const dueFormatted = formatDate(task_date_echeance);

  return (
    <Card className="grid grid-cols-6 grid-rows-1 gap-0 border-muted p-1 hover:ring-1  ring-primary transition-all duration-150 ease-in-out">
      <div className="relative">
        <div className="pr-4">
          <ul className="flex flex-col gap-1 p-4 items-center justify-center">
            <li className="text-muted-foreground/70 text-sm">Task</li>
            <li className="text-primary text-xl font-semibold">{id}</li>
            <li className="text-muted-foreground/80 text-sm">
              {createdFormatted}
            </li>
          </ul>
        </div>
        <Separator
          orientation="vertical"
          className="absolute right-0 top-0 bottom-0 bg-muted"
        />
      </div>

      <div className="col-span-5 flex items-center justify-center">
        <ul className="grid grid-cols-5 items-center justify-center w-full text-center gap-4">
          <li>
            <ul className="flex flex-col items-center gap-1">
              <li className="text-primary font-semibold">task name</li>
              <li className="text-muted-foreground/70">{task_name}</li>
            </ul>
          </li>
          <li>
            <ul className="flex flex-col items-center gap-1">
              <li className="text-primary font-semibold">Validator</li>
              <li className="text-muted-foreground/70">{task_assigned_to}</li>
            </ul>
          </li>
          <li>
            <ul className="flex flex-col items-center gap-1">
              <li className="text-primary font-semibold">Priority</li>
              <li className="text-muted-foreground/70 ">
                <PriorityBadge priority={task_priorite} />
              </li>
            </ul>
          </li>
          <li>
            <ul className="flex flex-col items-center gap-1">
              <li className="text-primary font-semibold">Status</li>
              <li className="text-muted-foreground/70">
                <StatusBadge status={task_statut} />
              </li>
            </ul>
          </li>
          <li>
            <ul className="flex flex-col items-center gap-1">
              <li className="text-primary font-semibold">Due Date</li>
              <li className="text-muted-foreground/70">{dueFormatted}</li>
            </ul>
          </li>
        </ul>
      </div>
    </Card>
  );
};

export default TaskCard;
