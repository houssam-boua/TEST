import React from "react";
import CostumeCardTitle from "../components/collection/costume-card-title";
import CostumeTableHeader from "../components/collection/costume-table-header";
import CollapsibleCard from "../components/collection/collapsible-card";
import { useGetTasksQuery } from "@/Slices/taskSlice";
import { useGetWorkflowsQuery } from "@/Slices/workflowSlice";

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
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4  space-y-4">
        <CostumeCardTitle title="Tâches en cours" />
        <CostumeTableHeader />

        {/* Render a CollapsibleCard per task */}
        {tasks.map((task) => {
          const workflowId =
            task.task_workflow &&
            (typeof task.task_workflow === "object"
              ? task.task_workflow.id || task.task_workflow.pk
              : task.task_workflow);
          const workflow =
            workflowsById[workflowId] ||
            (typeof task.task_workflow === "object"
              ? task.task_workflow
              : null);
          const assigned =
            task.task_assigned_to &&
            (typeof task.task_assigned_to === "object"
              ? `${task.task_assigned_to.first_name || ""} ${
                  task.task_assigned_to.last_name || ""
                }`.trim()
              : String(task.task_assigned_to));
          const step = stepMap[task.task_statut] || 1;
          const date = task.task_date_echeance
            ? new Date(task.task_date_echeance).toLocaleString()
            : "";

          return (
            <CollapsibleCard
              key={task.id || task.pk || `${task.task_name}-${workflowId}`}
              title={task.task_name}
              defaultOpen={false}
              currentStep={step}
              stepDescriptions={workflow?.nom || assigned || ""}
              stepDate={date}
              className="border-b-2 border-muted"
            >
              <div className="px-4 py-2 text-sm text-muted-foreground">
                <div>Priority: {task.task_priorite}</div>
                <div>Workflow: {workflow?.nom || workflowId}</div>
                <div>Assigned to: {assigned || "-"}</div>
              </div>
            </CollapsibleCard>
          );
        })}
      </div>
    </div>
  );
};

export default ConsulteTaks;
