import React, { useMemo, useState } from "react";
import CreateWorkflowForm from "../components/forms/create-workflow";
import CreateTaskForm from "../components/forms/create-task-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const CreateWorkflow = () => {
  const [step, setStep] = useState(1);
  const [workflowPayload, setWorkflowPayload] = useState(null);

  const documents = useMemo(
    () => [
      { value: "101", label: "Document 101 - Cahier de charges" },
      { value: "102", label: "Document 102 - Spécifications" },
      { value: "103", label: "Document 103 - PV Réunion" },
    ],
    []
  );

  const handleCreateWorkflow = async (formData, values) => {
    // TODO: POST workflow to backend and get workflow id
    console.log("Creating workflow with data:", values);
    setWorkflowPayload(values);
    setStep(2);
  };

  const handleCreateTask = async (formData, values) => {
    // TODO: POST task to backend, potentially with workflowPayload information
    console.log(
      "Creating task with data:",
      values,
      "for workflow:",
      workflowPayload
    );
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-muted/5">
      <div className="w-full max-w-3xl space-y-4">
        <div className="w-96 items-center ">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Créer un workflow</h2>
            <span className="text-sm text-muted-foreground">
              Étape {step} sur 2
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
            documents={documents}
          />
        )}
      </div>
    </div>
  );
};

export default CreateWorkflow;
