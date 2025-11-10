import React, { useState } from "react";
import CreateWorkflowForm from "../components/forms/create-workflow";
import CreateTaskForm from "../components/forms/create-task-form";
import { useCreateWorkflowMutation } from "@/Slices/workflowSlice";
import { useCreateTaskMutation } from "@/Slices/taskSlice";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
const CreateWorkflow = () => {
  const [step, setStep] = useState(1);
  const [workflowPayload, setWorkflowPayload] = useState(null);
  const [createWorkflow] = useCreateWorkflowMutation();
  const [createTask] = useCreateTaskMutation();

  // documents list removed; CreateTaskForm will receive workflowDocumentId from created workflow

  const handleCreateWorkflow = async (formData, values) => {
    console.log("[CreateWorkflowPage] handleCreateWorkflow invoked", {
      formData,
      values,
    });
    try {
      const payload = values || {};
      console.debug(
        "[CreateWorkflowPage] calling createWorkflow with payload:",
        payload
      );
      const res = await createWorkflow(payload).unwrap();
      console.info("[CreateWorkflowPage] createWorkflow response:", res);
      const workflowId = res?.id;
      const workflowDocument = res?.document ?? payload?.document ?? null;
      setWorkflowPayload({
        ...payload,
        id: workflowId,
        document: workflowDocument,
      });
      setStep(2);
    } catch (err) {
      console.error("[CreateWorkflowPage] Create workflow failed:", err);
    }
  };

  const handleCreateTask = async (formData, values) => {
    console.log("[CreateWorkflowPage] handleCreateTask invoked", {
      formData,
      values,
      workflowPayload,
    });
    try {
      const payload = values || {};
      if (workflowPayload?.id) payload.task_workflow = workflowPayload.id;
      console.debug(
        "[CreateWorkflowPage] calling createTask with payload:",
        payload
      );
      const res = await createTask(payload).unwrap();
      console.info("[CreateWorkflowPage] createTask response:", res);
    } catch (err) {
      console.error("[CreateWorkflowPage] Create task failed:", err);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-start justify-center p-6 md:p-10 ">
      <Card className="w-full p-5  space-y-4 border-border ">
        <div className="w-96 mx-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Workflow</h2>
            <span className="text-sm text-muted-foreground">
              Tasks
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={step >= 1 ? "default" : "secondary"}
              size="icon"
              className="rounded-full"
            >
              1
            </Button>
            <Separator
              className={`flex-1 ${step > 1 ? "bg-primary" : "bg-muted"}`}
            />
            <Button
              variant={step >= 2 ? "default" : "secondary"}
              size="icon"
              className="rounded-full"
            >
              2
            </Button>
          </div>
        </div>

        {step === 1 ? (
          <CreateWorkflowForm onCreate={handleCreateWorkflow} />
        ) : (
          <CreateTaskForm
            onCreate={handleCreateTask}
            onBack={() => setStep(1)}
            workflowDocumentId={workflowPayload?.document}
          />
        )}
      </Card>
    </div>
  );
};

export default CreateWorkflow;
