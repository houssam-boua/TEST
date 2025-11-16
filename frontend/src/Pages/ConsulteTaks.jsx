import React from "react";
import CostumeCardTitle from "../components/collection/costume-card-title";
import CostumeTableHeader from "../components/collection/costume-table-header";
import CollapsibleCard from "../components/collection/collapsible-card";
import { useGetTasksQuery } from "@/Slices/taskSlice";
import { useGetWorkflowsQuery } from "@/Slices/workflowSlice";
import { Card, CardHeader } from "../components/ui/card";
import { Separator } from "@/components/ui/separator";
import TaskCard from "../components/blocks/task-card";
const ConsulteTaks = () => {
  const { data: tasksData = {} } = useGetTasksQuery();
  const { data: workflowsData = {} } = useGetWorkflowsQuery();

  const tasks = Array.isArray(tasksData) ? tasksData : tasksData?.results || [];
  const workflows = Array.isArray(workflowsData)
    ? workflowsData
    : workflowsData?.results || [];

  const workflowsById = workflows.reduce((acc, w) => {
    acc[w.id || w.pk || w._id] = w;
    return acc;
  }, {});

  const stepMap = {
    not_started: 1,
    in_progress: 2,
    completed: 3,
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4  ">
        <CostumeCardTitle title="Tasks" />
        {/* Render one TaskCard per fetched task */}
        <Card className="p-4 border-border">
          <div className="space-y-3 w-full">
            {tasks.length === 0 ? (
              <div className="text-muted-foreground/80">No tasks found</div>
            ) : (
              tasks.map((t) => {
                const id = t.id ?? t.pk ?? t._id ?? "";
                const created_at =
                  t.created_at ?? t.createdAt ?? t.created_at ?? "";
                const task_name = t.task_name ?? t.name ?? t.title ?? "";
                const rawAssigned =
                  t.task_assigned_to ?? t.assigned_to ?? t.validator ?? "";
                let task_assigned_to = "";
                if (rawAssigned && typeof rawAssigned === "object") {
                  task_assigned_to =
                    (rawAssigned.first_name || rawAssigned.firstName
                      ? `${rawAssigned.first_name || rawAssigned.firstName} ${
                          rawAssigned.last_name || rawAssigned.lastName || ""
                        }`.trim()
                      : rawAssigned.username || rawAssigned.email || "") || "";
                } else {
                  task_assigned_to = rawAssigned;
                }
                const task_priorite = t.task_priorite ?? t.priority ?? "";
                const task_statut = t.task_statut ?? t.status ?? t.statut ?? "";
                const task_date_echeance =
                  t.task_date_echeance ?? t.due_date ?? t.dueDate ?? "";

                return (
                  <TaskCard
                    key={id || Math.random()}
                    id={id}
                    created_at={created_at}
                    task_name={task_name}
                    task_assigned_to={task_assigned_to}
                    task_priorite={task_priorite}
                    task_statut={task_statut}
                    task_date_echeance={task_date_echeance}
                  />
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ConsulteTaks;
