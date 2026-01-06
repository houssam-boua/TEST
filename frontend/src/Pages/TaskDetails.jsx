// Pages/TaskDetails.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/slices/authSlice";
import {
  useGetTaskByIdQuery,
  useCompleteTaskMutation,
} from "@/slices/taskSlice";
import {
  useSubmitForReviewMutation,
  useValidateReviewMutation,
  useApproveSignMutation,
  usePublishWorkflowMutation,
} from "@/slices/workflowSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Send,
  ThumbsUp,
  ThumbsDown,
  Globe,
  Loader2,
  AlertCircle,
  Calendar,
  Info,
  Edit3,
  Eye,
  Download,
  History,
  Flag,
} from "lucide-react";

// ✅ NEW IMPORTS
import EditDocumentForm from "@/components/forms/edit-document";
import DocumentHistoryDialog from "@/components/DocumentHistoryDialog";

// ==================== STATUS BADGE ====================
const TaskStageBadge = ({ stage }) => {
  const stageConfig = {
    draft: {
      label: "Draft",
      className: "bg-blue-100 text-blue-800 border-blue-300",
      icon: FileText,
    },
    review: {
      label: "Review",
      className: "bg-green-100 text-green-800 border-green-300",
      icon: Eye,
    },
    approval: {
      label: "Approval",
      className: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: CheckCircle2,
    },
    publication: {
      label: "Publication",
      className: "bg-purple-100 text-purple-800 border-purple-300",
      icon: Globe,
    },
  };

  const config = stageConfig[stage] || stageConfig.draft;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1.5 px-3 py-1 ${config.className}`}>
      <Icon size={14} />
      <span className="font-medium">{config.label}</span>
    </Badge>
  );
};

// ==================== TASK PROGRESS INDICATOR ====================
const TaskProgress = ({ task, workflow }) => {
  const stages = [
    {
      key: "draft",
      label: "Draft",
      completed: !!workflow?.submitted_at,
      color: "bg-blue-500",
      icon: FileText,
    },
    {
      key: "review",
      label: "Review",
      completed: !!workflow?.reviewed_at,
      color: "bg-green-500",
      icon: ThumbsUp,
    },
    {
      key: "approval",
      label: "Approval",
      completed: !!workflow?.approved_at,
      color: "bg-yellow-500",
      icon: CheckCircle2,
    },
    {
      key: "publication",
      label: "Published",
      completed: !!workflow?.published_at,
      color: "bg-purple-500",
      icon: Globe,
    },
  ];

  const currentStageIndex = stages.findIndex((stage) => stage.key === task.task_stage);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = index === currentStageIndex;
          const isCompleted = stage.completed;
          const isMyStage = stage.key === task.task_stage;

          return (
            <div key={stage.key} className="flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`
                        relative flex items-center justify-center
                        h-10 w-10 rounded-full border-2 transition-all
                        ${
                          isCompleted
                            ? `${stage.color} border-transparent text-white`
                            : isActive || isMyStage
                            ? `border-${stage.color.replace("bg-", "")} bg-white`
                            : "border-gray-300 bg-gray-100 text-gray-400"
                        }
                        ${isMyStage ? "ring-2 ring-primary ring-offset-2" : ""}
                      `}
                    >
                      <Icon size={18} />
                      {isCompleted && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{stage.label}</p>
                    {isMyStage && <p className="text-xs font-medium">Your Current Task</p>}
                    {isCompleted && <p className="text-xs">Completed</p>}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {index < stages.length - 1 && (
                <div
                  className={`h-0.5 w-12 mx-2 ${
                    stages[index + 1].completed ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Your Task: {task.task_stage.charAt(0).toUpperCase() + task.task_stage.slice(1)} Stage
        </p>
      </div>
    </div>
  );
};

// ==================== DOCUMENT CARD ====================
const DocumentCard = ({ document, onEdit, onViewVersions, canEdit }) => {
  if (!document) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No document attached</p>
        </CardContent>
      </Card>
    );
  }

  const buildFileUrl = (filePath) => {
    if (!filePath) return null;
    if (/^https?:\/\//i.test(filePath)) return filePath;
    
    const encodePath = (p) =>
      String(p || "")
        .split("/")
        .map((s) => encodeURIComponent(s))
        .join("/");
    
    let base = import.meta.env.VITE_MINIO_BASE_URL || "";
    if (!base) base = "https://s3.ramaqs.com/smartdocspro";
    let baseClean = base.replace(/\/$/, "");
    if (!/^https?:\/\//i.test(baseClean)) baseClean = `https://${baseClean}`;
    if (!baseClean.includes("smartdocspro"))
      baseClean = baseClean.replace(/\/$/, "") + "/smartdocspro";
    
    const pathOnly = String(filePath).split("?")[0].replace(/^\/?/, "");
    return (
      `${baseClean}/${encodePath(pathOnly)}` +
      (String(filePath).includes("?")
        ? `?${String(filePath).split("?").slice(1).join("?")}`
        : "")
    );
  };

  const fileUrl = buildFileUrl(document.doc_path || document.document_path);

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-muted/30">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {document.doc_title}
            </h3>
            {document.doc_code && (
              <p className="text-sm text-muted-foreground mt-1">
                Code: {document.doc_code}
              </p>
            )}
          </div>
          {document.doc_status && (
            <Badge variant="outline">{document.doc_status}</Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Category</p>
            <p className="font-medium mt-1">
              {document.doc_category?.cat_name || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Type</p>
            <p className="font-medium mt-1">
              {document.doc_type?.type_name || "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {fileUrl && (
          <>
            {/* ✅ VIEW BUTTON */}
            <Button
              className="w-full"
              variant="secondary"
              asChild
            >
              <a href={fileUrl} target="_blank" rel="noreferrer">
                <Eye className="mr-2 h-4 w-4" />
                View Document
              </a>
            </Button>

            {/* DOWNLOAD BUTTON */}
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <a href={fileUrl} target="_blank" rel="noreferrer" download>
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          </>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onViewVersions}
        >
          <History className="mr-2 h-4 w-4" />
          Versions
        </Button>
        
        {canEdit && (
          <Button
            className="flex-1"
            onClick={onEdit}
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function TaskDetailsPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  const { data: task, isLoading, isError, error, refetch } = useGetTaskByIdQuery(taskId);
  
  const [submitForReview, { isLoading: isSubmitting }] = useSubmitForReviewMutation();
  const [validateReview, { isLoading: isValidating }] = useValidateReviewMutation();
  const [approveSign, { isLoading: isApproving }] = useApproveSignMutation();
  const [publishWorkflow, { isLoading: isPublishing }] = usePublishWorkflowMutation();
  const [completeTask, { isLoading: isCompleting }] = useCompleteTaskMutation();

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showVersionsDialog, setShowVersionsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false); // ✅ EDIT STATE
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Auto-dismiss success messages
  React.useEffect(() => {
    if (actionSuccess) {
      const timer = setTimeout(() => {
        setActionSuccess(null);
        refetch();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess, refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading task...</p>
        </div>
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Error Loading Task
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error?.data?.error || error?.message || "Task not found"}
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate("/my-tasks")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Tasks
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const workflow = task.task_workflow;
  const document = workflow?.document;
  
  // =========================================================================
  // ✅ ROBUST PERMISSION CHECKS (Same User + Admin Bypass)
  // =========================================================================
  const taskAssigneeUsername = task.task_assigned_to?.username || 
                               (typeof task.task_assigned_to === 'string' ? task.task_assigned_to : null);
  
  const currentUsername = currentUser?.username;

  const isAssignee = taskAssigneeUsername && currentUsername && 
                     (taskAssigneeUsername === currentUsername);
  
  const isAdmin = currentUser?.is_superuser || 
                  currentUser?.is_staff || 
                  currentUser?.role?.role_name?.toLowerCase() === 'admin' ||
                  currentUser?.role === 'admin';

  const isMyTask = isAssignee || isAdmin;
  // =========================================================================

  const isTaskVisible = task.is_visible;
  const isTaskActive = task.task_statut !== "completed" && task.task_statut !== "rejected";
  const canEdit = isMyTask && isTaskVisible && isTaskActive;

  const canSubmit = canEdit && task.task_stage === "draft";
  const canReview = canEdit && task.task_stage === "review";
  const canApprove = canEdit && task.task_stage === "approval";
  const canPublish = canEdit && task.task_stage === "publication";

  const handleSubmitForReview = async () => {
    try {
      setActionError(null);
      await submitForReview(workflow.id).unwrap();
      setActionSuccess("Workflow submitted for review successfully!");
    } catch (err) {
      setActionError(err?.data?.error || err?.message || "Failed to submit");
    }
  };

  const handleApprove = async () => {
    try {
      setActionError(null);
      await validateReview({
        id: workflow.id,
        action: "pass",
        notes: "Approved by reviewer",
      }).unwrap();
      setActionSuccess("Review validated successfully!");
    } catch (err) {
      setActionError(err?.data?.error || err?.message || "Failed to validate");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setActionError("Rejection reason is required");
      return;
    }
    try {
      setActionError(null);
      await validateReview({
        id: workflow.id,
        action: "reject",
        reason: rejectReason,
        notes: rejectNotes,
      }).unwrap();
      setShowRejectDialog(false);
      setRejectReason("");
      setRejectNotes("");
      setActionSuccess("Workflow rejected successfully!");
    } catch (err) {
      setActionError(err?.data?.error || err?.message || "Failed to reject");
    }
  };

  const handleSign = async () => {
    try {
      setActionError(null);
      await approveSign(workflow.id).unwrap();
      setActionSuccess("Workflow approved and signed electronically!");
    } catch (err) {
      setActionError(err?.data?.error || err?.message || "Failed to approve");
    }
  };

  const handlePublish = async () => {
    try {
      setActionError(null);
      await publishWorkflow(workflow.id).unwrap();
      setActionSuccess("Workflow published successfully!");
    } catch (err) {
      setActionError(err?.data?.error || err?.message || "Failed to publish");
    }
  };

  // ✅ Open Edit Dialog instead of navigating
  const handleEditDocument = () => {
    setShowEditDialog(true);
  };

  const handleViewVersions = () => {
    setShowVersionsDialog(true);
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setActionSuccess("Document updated successfully!");
    refetch(); // Reload data
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/my-tasks")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{task.task_name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Task #{task.id} • Workflow: {workflow?.nom || "N/A"}
          </p>
        </div>
        <TaskStageBadge stage={task.task_stage} />
      </div>

      {/* Alerts */}
      {actionError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {actionSuccess && (
        <Alert className="mb-6 bg-green-50 text-green-900 border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{actionSuccess}</AlertDescription>
        </Alert>
      )}

      {!task.is_visible && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This task is currently locked. It will be unlocked when the previous stage is completed.
          </AlertDescription>
        </Alert>
      )}

      {!isMyTask && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            This task is assigned to another user. You can view it but cannot perform actions.
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Indicator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Task Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskProgress task={task} workflow={workflow} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Info */}
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    Priority
                  </Label>
                  <Badge className="mt-2">
                    {task.task_priorite?.toUpperCase() || "NORMAL"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Status
                  </Label>
                  <Badge variant="outline" className="mt-2">
                    {task.task_statut?.replace("_", " ").toUpperCase() || "PENDING"}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Due Date
                </Label>
                <p className="text-sm mt-2">
                  {task.task_date_echeance
                    ? new Date(task.task_date_echeance).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "No due date"}
                </p>
                {task.task_date_echeance &&
                  new Date(task.task_date_echeance) < new Date() &&
                  task.task_statut !== "completed" && (
                    <Badge variant="destructive" className="mt-2">
                      Overdue
                    </Badge>
                  )}
              </div>

              {task.notes && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                    <p className="text-sm mt-2 p-3 bg-muted/50 rounded-md">{task.notes}</p>
                  </div>
                </>
              )}

              {task.rejection_reason && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-destructive flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Rejection Reason
                    </Label>
                    <p className="text-sm mt-2 p-3 bg-destructive/10 rounded-md text-destructive">
                      {task.rejection_reason}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Document */}
          <Card>
            <CardHeader>
              <CardTitle>Document</CardTitle>
              <CardDescription>
                View, edit, or manage the document associated with this task
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentCard
                document={document}
                onEdit={handleEditDocument}
                onViewVersions={handleViewVersions}
                canEdit={canEdit}
              />
            </CardContent>
          </Card>

          {/* Available Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Available Actions</CardTitle>
              <CardDescription>
                Actions you can perform based on your role and the task status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {canSubmit && (
                <Button
                  onClick={handleSubmitForReview}
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Submit for Review
                    </>
                  )}
                </Button>
              )}

              {canReview && (
                <div className="flex gap-3">
                  <Button
                    onClick={handleApprove}
                    disabled={isValidating}
                    className="flex-1"
                    size="lg"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="mr-2 h-5 w-5" />
                        Approve Review
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowRejectDialog(true)}
                    disabled={isValidating}
                    variant="destructive"
                    className="flex-1"
                    size="lg"
                  >
                    <ThumbsDown className="mr-2 h-5 w-5" />
                    Reject
                  </Button>
                </div>
              )}

              {canApprove && (
                <Button
                  onClick={handleSign}
                  disabled={isApproving}
                  className="w-full"
                  size="lg"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Approve & Sign Electronically
                    </>
                  )}
                </Button>
              )}

              {canPublish && (
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="w-full"
                  size="lg"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Globe className="mr-2 h-5 w-5" />
                      Publish Workflow
                    </>
                  )}
                </Button>
              )}

              {!canSubmit && !canReview && !canApprove && !canPublish && (
                <div className="text-center py-8">
                  <Info className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No actions available at this time
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {!isMyTask && "This task is assigned to another user"}
                    {isMyTask && !isTaskVisible && "Task is locked - waiting for previous stage"}
                    {isMyTask && isTaskVisible && !isTaskActive && "Task is already completed"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assigned To */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assigned To</CardTitle>
            </CardHeader>
            <CardContent>
              {task.task_assigned_to ? (
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={task.task_assigned_to.avatar} />
                    <AvatarFallback>
                      {task.task_assigned_to.first_name?.[0]}
                      {task.task_assigned_to.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {task.task_assigned_to.first_name} {task.task_assigned_to.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {task.task_assigned_to.email}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unassigned</p>
              )}
            </CardContent>
          </Card>

          {/* Workflow Info */}
          {workflow && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Workflow Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">{workflow.nom}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {workflow.description || "No description"}
                  </p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Workflow Status</p>
                  <Badge variant="outline">{workflow.status?.replace("_", " ")}</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/consulter-workflow/${workflow.id}`)}
                >
                  View Full Workflow
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Created</p>
                  <p className="text-sm">
                    {new Date(task.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {task.unlocked_at && (
                  <div>
                    <p className="text-muted-foreground text-xs">Unlocked</p>
                    <p className="text-sm">
                      {new Date(task.unlocked_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}

                {task.completed_at && (
                  <div>
                    <p className="text-muted-foreground text-xs">Completed</p>
                    <p className="text-sm">
                      {new Date(task.completed_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {task.completed_by && (
                      <p className="text-xs text-muted-foreground">
                        by {task.completed_by.username}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Reject Workflow
            </DialogTitle>
            <DialogDescription>
              Please provide a detailed reason for rejecting this workflow.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason" className="text-sm font-medium">
                Rejection Reason *
              </Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Why are you rejecting this workflow?"
                rows={4}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="notes" className="text-sm font-medium">
                Additional Notes
              </Label>
              <Textarea
                id="notes"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Optional: Add any additional context..."
                rows={3}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason("");
                setRejectNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ DOCUMENT HISTORY DIALOG */}
      <DocumentHistoryDialog 
        open={showVersionsDialog} 
        onOpenChange={setShowVersionsDialog}
        documentId={document?.id}
      />

      {/* ✅ EDIT DOCUMENT DIALOG */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          {document && (
            <EditDocumentForm 
              document={document} 
              onSuccess={handleEditSuccess}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
