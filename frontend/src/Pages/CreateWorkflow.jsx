import React, { useState } from "react";
import CreateWorkflowForm from "../components/forms/create-workflow";
import CreateTaskForm from "../components/forms/create-task-form";
import { useCreateWorkflowMutation } from "@/Slices/workflowSlice";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from "@/Slices/taskSlice";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CreatedTaskCard from "../components/blocks/created-task-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import EditTaskForm from "../components/forms/edit-task-form";
import DeleteTaskForm from "../components/forms/delete-task-form";
const CreateWorkflow = () => {
  const [step, setStep] = useState(1);
  const [workflowPayload, setWorkflowPayload] = useState(null);
  const [createdTasks, setCreatedTasks] = useState([]);
  const [createWorkflow] = useCreateWorkflowMutation();
  const [createTask] = useCreateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleOpenEditTask = (taskId) => {
    const task = createdTasks.find((t) => t.id === taskId);
    if (!task) return;
    setEditingTask(task);
    setEditDialogOpen(true);
    console.log("[CreateWorkflowPage] Edit task:", taskId);
  };

  const handleSubmitEditTask = async (payload) => {
    setEditLoading(true);
    try {
      const { id, ...rest } = payload || {};
      const res = await updateTask({ id, data: rest }).unwrap();
      setCreatedTasks((prev) => prev.map((t) => (t.id === res.id ? res : t)));
      setEditDialogOpen(false);
      setEditingTask(null);
      console.info("[CreateWorkflowPage] Task updated:", res?.id);
    } catch (err) {
      console.error("[CreateWorkflowPage] Update task failed:", err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenDeleteTask = (taskId) => {
    const task = createdTasks.find((t) => t.id === taskId);
    if (!task) return;
    setDeletingTask(task);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteTask = async (task) => {
    if (!task?.id) return;
    setDeleteLoading(true);
    try {
      await deleteTask(task.id).unwrap();
      setCreatedTasks((prev) => prev.filter((t) => t.id !== task.id));
      setDeleteDialogOpen(false);
      setDeletingTask(null);
      console.info("[CreateWorkflowPage] Task deleted:", task.id);
    } catch (err) {
      console.error("[CreateWorkflowPage] Delete task failed:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

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
      const fd = formData instanceof FormData ? formData : new FormData();
      if (!(formData instanceof FormData) && values) {
        fd.set("task_name", values.task_name || "");
        fd.set("task_date_echeance", values.task_date_echeance || "");
        fd.set("task_priorite", values.task_priorite || "normal");
        fd.set("task_statut", values.task_statut || "not_started");
        if (values.task_assigned_to)
          fd.set("task_assigned_to", String(values.task_assigned_to));
      }
      if (workflowPayload?.id) {
        fd.set("task_workflow", String(workflowPayload.id));
      }
      console.debug("[CreateWorkflowPage] calling createTask with FormData");
      const res = await createTask(fd).unwrap();
      console.info("[CreateWorkflowPage] createTask response:", res);
      setCreatedTasks((prev) => [...prev, res]);
    } catch (err) {
      console.error("[CreateWorkflowPage] Create task failed:", err);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-start justify-center p-6 md:p-10">
      <div className="w-full p-5 space-y-4 border-none">
        <div className="w-96 mx-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Workflow</h2>
            <span className="text-sm text-muted-foreground">Tasks</span>
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

        <div className={step === 1 ? "block" : "hidden"}>
          <CreateWorkflowForm onCreate={handleCreateWorkflow} />
        </div>
        <div className={step === 2 ? "block" : "hidden"}>
          <CreateTaskForm
            onCreate={handleCreateTask}
            onBack={() => setStep(1)}
            workflowDocumentId={workflowPayload?.document}
          />
        </div>

        {createdTasks.length > 0 && (
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold">
              Created Tasks ({createdTasks.length})
            </h3>
            <div className="space-y-3">
              {createdTasks.map((task, index) => (
                <CreatedTaskCard
                  key={task.id || index}
                  task={task}
                  onEdit={handleOpenEditTask}
                  onDelete={handleOpenDeleteTask}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the selected task details.
            </DialogDescription>
          </DialogHeader>
          <EditTaskForm
            task={editingTask}
            loading={editLoading}
            onSubmit={handleSubmitEditTask}
            onCancel={() => {
              setEditDialogOpen(false);
              setEditingTask(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DeleteTaskForm
            task={deletingTask}
            loading={deleteLoading}
            onDelete={handleConfirmDeleteTask}
            onCancel={() => {
              setDeleteDialogOpen(false);
              setDeletingTask(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateWorkflow;
