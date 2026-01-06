import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetTasksofWorkflowQuery,
  useUpdateTaskMutation,
} from "@/slices/taskSlice";
import {
  useGetWorkflowsQuery,
  useSubmitForReviewMutation,
  useValidateReviewMutation,
  useApproveSignMutation,
  usePublishWorkflowMutation,
} from "@/slices/workflowSlice";
import { selectHasRole, selectCurrentUser } from "@/slices/authSlice";
import { ExpandableDataTable } from "../components/tables/expandable-data-table";
import { defaultColumns } from "../components/tables/data-table";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import StepperIcons from "../components/blocks/stepper-icon";
import PriorityBadge from "../Hooks/usePriority";
import StatusBadge from "../Hooks/useStatusBadge";
import {
  ArrowDownToLine,
  Check,
  X,
  Eye,
  Lock,
  FileCheck,
  Send,
  FileSignature,
  Upload,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

// Workflow Stage Badge Component
const WorkflowStageBadge = ({ stage, status }) => {
  const stageConfig = {
    draft: { label: "Draft", variant: "secondary", icon: FileCheck },
    in_review: { label: "In Review", variant: "default", icon: Eye },
    pending_approval: {
      label: "Pending Approval",
      variant: "warning",
      icon: Clock,
    },
    approved: { label: "Approved", variant: "success", icon: CheckCircle2 },
    published: { label: "Published", variant: "success", icon: Upload },
    rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
  };

  const config = stageConfig[status] || stageConfig.draft;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon size={12} />
      {config.label}
    </Badge>
  );
};

// Task Visibility Indicator
const VisibilityBadge = ({ isVisible, isLocked }) => {
  if (isVisible) {
    return (
      <Badge variant="outline" className="gap-1 text-green-600">
        <Eye size={12} />
        Visible
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 text-gray-400">
      <Lock size={12} />
      Locked
    </Badge>
  );
};

// Stage Actions Component
const StageActions = ({
  workflow,
  task,
  currentUser,
  onSubmitForReview,
  onValidateReview,
  onApproveSign,
  onPublish,
  onReject,
}) => {
  const isAuthor = workflow?.author?.id === currentUser?.id;
  const isReviewer = workflow?.reviewer?.id === currentUser?.id;
  const isApprover = workflow?.approver?.id === currentUser?.id;
  const isPublisher = workflow?.publisher?.id === currentUser?.id;
  const isAdmin = currentUser?.is_superuser || currentUser?.is_staff;

  // Step 1: Draft → Submit for Review (Author only)
  if (
    workflow?.status === "draft" &&
    task?.task_stage === "draft" &&
    (isAuthor || isAdmin)
  ) {
    return (
      <div className="flex gap-2">
        <Button size="sm" onClick={onSubmitForReview} className="gap-1">
          <Send size={14} />
          Submit for Review
        </Button>
      </div>
    );
  }

  // Step 2: Review → Validate or Reject (Reviewer only)
  if (
    workflow?.status === "in_review" &&
    task?.task_stage === "review" &&
    (isReviewer || isAdmin)
  ) {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={() => onValidateReview("pass")}
          className="gap-1"
        >
          <Check size={14} />
          Pass Review
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onReject("review")}
          className="gap-1"
        >
          <X size={14} />
          Reject
        </Button>
      </div>
    );
  }

  // Step 3: Approval → Approve & Sign (Approver only, with segregation check)
  if (
    workflow?.status === "pending_approval" &&
    task?.task_stage === "approval" &&
    (isApprover || isAdmin)
  ) {
    // Segregation of duties check (frontend warning)
    const violatesSegregation =
      workflow?.author?.id === currentUser?.id && !isAdmin;

    return (
      <div className="flex flex-col gap-2">
        {violatesSegregation && (
          <Alert variant="destructive">
            <AlertCircle size={16} />
            <AlertDescription>
              Segregation of duties violation: Author cannot approve their own
              document.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onApproveSign}
            disabled={violatesSegregation}
            className="gap-1"
          >
            <FileSignature size={14} />
            Approve & Sign
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onReject("approval")}
            className="gap-1"
          >
            <X size={14} />
            Reject
          </Button>
        </div>
      </div>
    );
  }

  // Step 4: Publication → Publish (Publisher only)
  if (
    workflow?.status === "approved" &&
    task?.task_stage === "publication" &&
    (isPublisher || isAdmin)
  ) {
    return (
      <div className="flex gap-2">
        <Button size="sm" onClick={onPublish} className="gap-1">
          <Upload size={14} />
          Publish Document
        </Button>
      </div>
    );
  }

  // No action available
  return (
    <span className="text-sm text-muted-foreground">
      {task?.is_visible ? "Awaiting action" : "Task locked"}
    </span>
  );
};

const ConsulteTaks = () => {
  const { workflowId } = useParams();
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectHasRole("admin"));

  // API Hooks
  const { data: tasksData = {}, refetch: refetchTasks } =
    useGetTasksofWorkflowQuery(workflowId);
  const { data: workflowsData = {}, refetch: refetchWorkflows } =
    useGetWorkflowsQuery();
  const [updateTask] = useUpdateTaskMutation();
  const [submitForReview] = useSubmitForReviewMutation();
  const [validateReview] = useValidateReviewMutation();
  const [approveSign] = useApproveSignMutation();
  const [publishWorkflow] = usePublishWorkflowMutation();

  // State
  const [docOpen, setDocOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // 'submit', 'validate', 'reject', 'approve', 'publish'
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data normalization
  const tasks = Array.isArray(tasksData) ? tasksData : tasksData?.results || [];
  const workflows = Array.isArray(workflowsData)
    ? workflowsData
    : workflowsData?.results || [];

  const currentWorkflow = workflows.find(
    (w) => String(w.id || w.pk) === String(workflowId)
  );

  // Filter tasks: show only visible tasks to non-admin users
  const visibleTasks = useMemo(() => {
    if (isAdmin) return tasks; // Admin sees all
    return tasks.filter((t) => t.is_visible !== false);
  }, [tasks, isAdmin]);

  // Helper: build file URL
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

  // Workflow Actions
  const handleSubmitForReview = async () => {
    setLoading(true);
    setError(null);
    try {
      await submitForReview(workflowId).unwrap();
      await refetchWorkflows();
      await refetchTasks();
      setActionDialogOpen(false);
    } catch (err) {
      setError(err?.data?.error || err?.message || "Failed to submit for review");
    } finally {
      setLoading(false);
    }
  };

  const handleValidateReview = async (action) => {
    setLoading(true);
    setError(null);
    try {
      await validateReview({
        id: workflowId,
        action,
        reason: rejectionReason,
      }).unwrap();
      await refetchWorkflows();
      await refetchTasks();
      setActionDialogOpen(false);
      setRejectionReason("");
    } catch (err) {
      setError(err?.data?.error || err?.message || "Failed to validate review");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSign = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await approveSign(workflowId).unwrap();
      await refetchWorkflows();
      await refetchTasks();
      setActionDialogOpen(false);
      // Optionally display signature hash
      console.log("Document signed:", result?.signature);
    } catch (err) {
      setError(err?.data?.error || err?.message || "Failed to approve document");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    setError(null);
    try {
      await publishWorkflow(workflowId).unwrap();
      await refetchWorkflows();
      await refetchTasks();
      setActionDialogOpen(false);
    } catch (err) {
      setError(err?.data?.error || err?.message || "Failed to publish document");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = (stage) => {
    setActionType("reject");
    setActionDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Rejection reason is required");
      return;
    }
    await handleValidateReview("reject");
  };

  // Table columns definition
  const combinedColumns = useMemo(() => {
    const base = [
      ...defaultColumns.slice(0, 2),
      { id: "id", accessorKey: "id", header: "ID", size: 50 },
      { id: "task_name", accessorKey: "task_name", header: "Task Name" },
      {
        id: "task_stage",
        accessorKey: "task_stage",
        header: "Stage",
        cell: ({ row }) => {
          const stage = row.getValue("task_stage");
          const stageLabels = {
            draft: "Draft",
            review: "Review",
            approval: "Approval",
            publication: "Publication",
          };
          return (
            <Badge variant="outline">{stageLabels[stage] || stage}</Badge>
          );
        },
      },
      {
        id: "task_assigned_to",
        accessorKey: "task_assigned_to",
        header: "Assigned To",
        cell: ({ row }) => {
          const assignedTo = row.getValue("task_assigned_to");
          if (!assignedTo) return "Unassigned";
          const fullName = `${assignedTo.first_name || ""} ${
            assignedTo.last_name || ""
          }`.trim();
          return fullName || assignedTo.username || "Unassigned";
        },
        size: 150,
      },
      {
        id: "is_visible",
        accessorKey: "is_visible",
        header: "Visibility",
        cell: ({ row }) => {
          const visible = row.getValue("is_visible");
          return <VisibilityBadge isVisible={visible} isLocked={!visible} />;
        },
      },
      {
        id: "task_priorite",
        accessorKey: "task_priorite",
        header: "Priority",
        cell: ({ row }) => (
          <PriorityBadge priority={row.getValue("task_priorite")} />
        ),
      },
      {
        id: "task_statut",
        accessorKey: "task_statut",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.getValue("task_statut")} />,
      },
      {
        id: "task_date_echeance",
        accessorKey: "task_date_echeance",
        header: "Due Date",
        cell: ({ row }) => {
          const date = row.getValue("task_date_echeance");
          if (!date) return "N/A";
          const dateObj = new Date(date);
          return dateObj.toLocaleDateString("en-GB");
        },
      },
      {
        id: "download",
        header: "Document",
        cell: ({ row }) => {
          const doc =
            row.original?.task_workflow?.document ||
            row.original?.document ||
            currentWorkflow?.document ||
            null;
          const path = doc?.doc_path || doc?.document_path || null;
          const url = buildFileUrl(path);
          return url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              download
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <ArrowDownToLine size={14} />
              Download
            </a>
          ) : (
            <span className="text-muted-foreground text-xs">No file</span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const task = row.original;
          return (
            <StageActions
              workflow={currentWorkflow}
              task={task}
              currentUser={currentUser}
              onSubmitForReview={() => {
                setSelectedTask(task);
                setActionType("submit");
                setActionDialogOpen(true);
              }}
              onValidateReview={(action) => {
                setSelectedTask(task);
                setActionType(action === "pass" ? "validate" : "reject");
                setActionDialogOpen(true);
              }}
              onApproveSign={() => {
                setSelectedTask(task);
                setActionType("approve");
                setActionDialogOpen(true);
              }}
              onPublish={() => {
                setSelectedTask(task);
                setActionType("publish");
                setActionDialogOpen(true);
              }}
              onReject={handleReject}
            />
          );
        },
      },
    ];

    return base;
  }, [currentWorkflow, currentUser, isAdmin]);

  // Expandable row content
  const renderSubComponent = ({ row }) => (
    <div className="p-4 bg-muted/30">
      <StepperIcons task={row.original} />
      <Separator className="my-3" />
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Unlocked At:</span>{" "}
          {row.original.unlocked_at
            ? new Date(row.original.unlocked_at).toLocaleString()
            : "Not unlocked"}
        </div>
        <div>
          <span className="font-medium">Completed At:</span>{" "}
          {row.original.completed_at
            ? new Date(row.original.completed_at).toLocaleString()
            : "Not completed"}
        </div>
        {row.original.completed_by && (
          <div>
            <span className="font-medium">Completed By:</span>{" "}
            {row.original.completed_by.username}
          </div>
        )}
        {row.original.notes && (
          <div className="col-span-2">
            <span className="font-medium">Notes:</span> {row.original.notes}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-4 md:py-6 px-4">
        {/* Workflow Status Card */}
        {currentWorkflow && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{currentWorkflow.nom}</CardTitle>
                  <CardDescription>
                    {currentWorkflow.description}
                  </CardDescription>
                </div>
                <WorkflowStageBadge
                  stage={currentWorkflow.current_stage}
                  status={currentWorkflow.status}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Author:</span>{" "}
                  {currentWorkflow.author?.username || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Reviewer:</span>{" "}
                  {currentWorkflow.reviewer?.username || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Approver:</span>{" "}
                  {currentWorkflow.approver?.username || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Publisher:</span>{" "}
                  {currentWorkflow.publisher?.username || "N/A"}
                </div>
              </div>

              {/* Timeline */}
              {(currentWorkflow.submitted_at ||
                currentWorkflow.reviewed_at ||
                currentWorkflow.approved_at ||
                currentWorkflow.published_at) && (
                <>
                  <Separator className="my-4" />
                  <div className="text-sm space-y-1">
                    <div className="font-medium mb-2">Timeline:</div>
                    {currentWorkflow.submitted_at && (
                      <div className="text-muted-foreground">
                        Submitted:{" "}
                        {new Date(
                          currentWorkflow.submitted_at
                        ).toLocaleString()}
                      </div>
                    )}
                    {currentWorkflow.reviewed_at && (
                      <div className="text-muted-foreground">
                        Reviewed:{" "}
                        {new Date(currentWorkflow.reviewed_at).toLocaleString()}
                      </div>
                    )}
                    {currentWorkflow.approved_at && (
                      <div className="text-muted-foreground">
                        Approved:{" "}
                        {new Date(currentWorkflow.approved_at).toLocaleString()}
                      </div>
                    )}
                    {currentWorkflow.published_at && (
                      <div className="text-muted-foreground">
                        Published:{" "}
                        {new Date(
                          currentWorkflow.published_at
                        ).toLocaleString()}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tasks Table */}
        <ExpandableDataTable
          columns={combinedColumns}
          data={visibleTasks}
          renderSubComponent={renderSubComponent}
          pageSize={20}
        />

        {/* Action Confirmation Dialog */}
        <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === "submit" && "Submit for Review"}
                {actionType === "validate" && "Validate Review"}
                {actionType === "reject" && "Reject Document"}
                {actionType === "approve" && "Approve & Sign Document"}
                {actionType === "publish" && "Publish Document"}
              </DialogTitle>
              <DialogDescription>
                {actionType === "submit" &&
                  "This will lock the draft and notify the reviewer."}
                {actionType === "validate" &&
                  "This will pass the document to the approval stage."}
                {actionType === "reject" &&
                  "This will send the document back to the author."}
                {actionType === "approve" &&
                  "This will create an electronic signature and prepare the document for publication."}
                {actionType === "publish" &&
                  "This will make the document visible to all users and lock it as immutable."}
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle size={16} />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {actionType === "reject" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Rejection Reason *
                  </label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this document is being rejected..."
                    rows={4}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => {
                  setActionDialogOpen(false);
                  setRejectionReason("");
                  setError(null);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (actionType === "submit") handleSubmitForReview();
                  else if (actionType === "validate")
                    handleValidateReview("pass");
                  else if (actionType === "reject") confirmReject();
                  else if (actionType === "approve") handleApproveSign();
                  else if (actionType === "publish") handlePublish();
                }}
                disabled={loading}
                variant={actionType === "reject" ? "destructive" : "default"}
              >
                {loading ? "Processing..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ConsulteTaks;
