// Pages/WorkflowDetails.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetWorkflowByIdQuery,
  useSubmitForReviewMutation,
  useValidateReviewMutation,
  useApproveSignMutation,
  usePublishWorkflowMutation,
} from "@/Slices/workflowSlice";
import { useGetTasksofWorkflowQuery } from "@/Slices/taskSlice";
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
  User,
  Calendar,
  Info,
} from "lucide-react";
import { useAuth } from "@/Hooks/useAuth";

// ==================== STATUS BADGE ====================
const WorkflowStatusBadge = ({ status }) => {
  const statusConfig = {
    draft: {
      label: "Draft",
      className: "bg-gray-100 text-gray-800 border-gray-300",
      icon: FileText,
    },
    in_review: {
      label: "In Review",
      className: "bg-blue-100 text-blue-800 border-blue-300",
      icon: Clock,
    },
    pending_approval: {
      label: "Pending Approval",
      className: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: AlertCircle,
    },
    approved: {
      label: "Approved",
      className: "bg-green-100 text-green-800 border-green-300",
      icon: CheckCircle2,
    },
    published: {
      label: "Published",
      className: "bg-emerald-100 text-emerald-800 border-emerald-300",
      icon: Globe,
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-100 text-red-800 border-red-300",
      icon: XCircle,
    },
  };

  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1.5 px-3 py-1 ${config.className}`}>
      <Icon size={14} />
      <span className="font-medium">{config.label}</span>
    </Badge>
  );
};

// ==================== USER CARD WITH ROLE COLORS ====================
const UserCard = ({ user, role, date, roleColor = "gray", stepNumber }) => {
  const roleColorClasses = {
    blue: "border-blue-500 bg-blue-50",
    green: "border-green-500 bg-green-50",
    yellow: "border-yellow-500 bg-yellow-50",
    purple: "border-purple-500 bg-purple-50",
    gray: "border-gray-300 bg-gray-100",
  };

  if (!user) {
    return (
      <div className="flex items-start gap-3 opacity-50 p-3 border border-dashed rounded-lg">
        <Avatar className={`h-10 w-10 ${roleColorClasses[roleColor]}`}>
          <AvatarFallback>
            <User className="h-5 w-5 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">Not assigned</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
        {stepNumber && (
          <Badge variant="outline" className="text-xs">
            Step {stepNumber}
          </Badge>
        )}
      </div>
    );
  }

  const displayName =
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.username;
  
  const initials =
    user.first_name && user.last_name
      ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
      : user.username?.substring(0, 2).toUpperCase() || "??";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
            <Avatar className={`h-10 w-10 border-2 ${roleColorClasses[roleColor]}`}>
              <AvatarImage src={user.avatar} alt={displayName} />
              <AvatarFallback className="font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground">{role}</p>
              {date && (
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
            {stepNumber && (
              <Badge variant="outline" className="text-xs shrink-0">
                Step {stepNumber}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground">{user.email || user.username}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ==================== WORKFLOW PROGRESS INDICATOR ====================
const WorkflowProgress = ({ workflow }) => {
  const stages = [
    {
      key: "draft",
      label: "Draft",
      completed: !!workflow.submitted_at,
      color: "bg-blue-500",
      icon: FileText,
    },
    {
      key: "review",
      label: "Review",
      completed: !!workflow.reviewed_at,
      color: "bg-green-500",
      icon: ThumbsUp,
    },
    {
      key: "approval",
      label: "Approval",
      completed: !!workflow.approved_at,
      color: "bg-yellow-500",
      icon: CheckCircle2,
    },
    {
      key: "publication",
      label: "Published",
      completed: !!workflow.published_at,
      color: "bg-purple-500",
      icon: Globe,
    },
  ];

  const currentStageIndex = stages.findIndex(
    (stage) =>
      stage.key === workflow.status.split("_")[0] || stage.key === workflow.status
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = index === currentStageIndex;
          const isCompleted = stage.completed;

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
                            : isActive
                            ? `border-${stage.color.replace("bg-", "")} bg-white`
                            : "border-gray-300 bg-gray-100 text-gray-400"
                        }
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
                    {isCompleted && <p className="text-xs">Completed</p>}
                    {isActive && !isCompleted && <p className="text-xs">In Progress</p>}
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
          Stage {currentStageIndex + 1} of {stages.length}
        </p>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function WorkflowDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const { data: workflow, isLoading, isError, error, refetch } = useGetWorkflowByIdQuery(id);
  const { data: tasksData } = useGetTasksofWorkflowQuery(id);

  const [submitForReview, { isLoading: isSubmitting }] = useSubmitForReviewMutation();
  const [validateReview, { isLoading: isValidating }] = useValidateReviewMutation();
  const [approveSign, { isLoading: isApproving }] = useApproveSignMutation();
  const [publishWorkflow, { isLoading: isPublishing }] = usePublishWorkflowMutation();

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const tasks = Array.isArray(tasksData)
    ? tasksData
    : Array.isArray(tasksData?.results)
    ? tasksData.results
    : [];

  // Auto-dismiss success messages
  React.useEffect(() => {
    if (actionSuccess) {
      const timer = setTimeout(() => {
        setActionSuccess(null);
        refetch(); // Refresh data
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess, refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  if (isError || !workflow) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Error Loading Workflow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error?.data?.error || error?.message || "Workflow not found"}
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate("/consulter-workflow")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Workflows
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const canSubmit = workflow.can_submit;
  const canReview = workflow.can_review;
  const canApprove = workflow.can_approve;
  const canPublish = workflow.can_publish;

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/consulter-workflow")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{workflow.nom}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Workflow #{workflow.id} • Created by {workflow.created_by?.username || "Unknown"}
          </p>
        </div>
        <WorkflowStatusBadge status={workflow.status} />
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

      {/* Progress Indicator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Workflow Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkflowProgress workflow={workflow} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workflow Info */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Description
                </Label>
                <p className="text-sm mt-2 p-3 bg-muted/50 rounded-md">
                  {workflow.description || "No description provided"}
                </p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Document
                </Label>
                <p className="text-sm mt-2 p-3 bg-muted/50 rounded-md font-medium">
                  {workflow.document?.doc_title || "No document attached"}
                </p>
                {workflow.document?.doc_code && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Code: {workflow.document.doc_code}
                  </p>
                )}
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Created
                </Label>
                <p className="text-sm mt-2">
                  {new Date(workflow.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Available Actions</CardTitle>
              <CardDescription>
                Actions you can perform based on your role and the workflow status
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
                    The workflow is being processed by another user
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Associated Tasks ({tasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No tasks found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.task_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Stage: <Badge variant="outline" className="text-xs">{task.task_stage}</Badge> • 
                          Status: <Badge variant="outline" className="text-xs">{task.task_status}</Badge>
                        </p>
                      </div>
                      <Badge
                        variant={task.is_visible ? "default" : "secondary"}
                        className="ml-4"
                      >
                        {task.is_visible ? "Unlocked" : "Locked"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assigned Users */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assigned Users</CardTitle>
              <CardDescription className="text-xs">
                Sequential workflow stages and responsible users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <UserCard
                user={workflow.author}
                role="Author (Draft Stage)"
                date={workflow.submitted_at}
                roleColor="blue"
                stepNumber={1}
              />
              <UserCard
                user={workflow.reviewer}
                role="Reviewer (Review Stage)"
                date={workflow.reviewed_at}
                roleColor="green"
                stepNumber={2}
              />
              <UserCard
                user={workflow.approver}
                role="Approver (Approval Stage)"
                date={workflow.approved_at}
                roleColor="yellow"
                stepNumber={3}
              />
              <UserCard
                user={workflow.publisher}
                role="Publisher (Publication Stage)"
                date={workflow.published_at}
                roleColor="purple"
                stepNumber={4}
              />
            </CardContent>
          </Card>

          {/* Signatures */}
          {workflow.signatures_count > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Electronic Signatures
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Signatures</p>
                  <Badge variant="outline" className="text-sm">
                    {workflow.signatures_count}
                  </Badge>
                </div>
                {workflow.latest_signature && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Latest Signature</p>
                      <p className="text-sm font-medium">
                        {workflow.latest_signature.signed_by?.username || "Unknown"}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground mt-2 break-all bg-muted p-2 rounded">
                        {workflow.latest_signature.signature_hash?.substring(0, 32)}...
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
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
              Please provide a detailed reason for rejecting this workflow. This will be
              logged in the workflow history.
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
    </div>
  );
}
