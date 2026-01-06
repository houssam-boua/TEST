// Pages/ConsulteWorkflow.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import {
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { SheetDemo } from "../components/blocks/sheet";
import { useGetWorkflowsQuery } from "@/Slices/workflowSlice";

// ==================== STATUS BADGE ====================
const WorkflowStatusBadge = ({ status }) => {
  const statusConfig = {
    draft: {
      label: "Draft",
      variant: "secondary",
      icon: FileText,
      className: "bg-gray-100 text-gray-800 border-gray-300",
    },
    in_review: {
      label: "In Review",
      variant: "default",
      icon: Clock,
      className: "bg-blue-100 text-blue-800 border-blue-300",
    },
    pending_approval: {
      label: "Pending Approval",
      variant: "warning",
      icon: AlertCircle,
      className: "bg-yellow-100 text-yellow-800 border-yellow-300",
    },
    approved: {
      label: "Approved",
      variant: "success",
      icon: CheckCircle2,
      className: "bg-green-100 text-green-800 border-green-300",
    },
    published: {
      label: "Published",
      variant: "success",
      icon: CheckCircle2,
      className: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    rejected: {
      label: "Rejected",
      variant: "destructive",
      icon: XCircle,
      className: "bg-red-100 text-red-800 border-red-300",
    },
  };

  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1 ${config.className}`}>
      <Icon size={12} />
      {config.label}
    </Badge>
  );
};

// ==================== USER AVATAR ====================
const UserAvatar = ({ user, showName = false }) => {
  if (!user) return <span className="text-muted-foreground text-xs">—</span>;

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
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 border">
              <AvatarImage src={user.avatar} alt={displayName} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            {showName && <span className="text-sm">{displayName}</span>}
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

// ==================== DOCUMENT CELL ====================
function DocumentCell({ row }) {
  const [open, setOpen] = useState(false);
  const doc = row?.original?.document || null;
  const infos = doc ? [doc] : [];

  if (!doc) {
    return <span className="text-muted-foreground text-xs">No document</span>;
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
            >
              <FileText className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View document details</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <SheetDemo open={open} onOpenChange={setOpen} infos={infos} />
    </>
  );
}

// ==================== WORKFLOW PROGRESS ====================
const WorkflowStageProgress = ({ workflow }) => {
  const stages = [
    { key: "draft", label: "Draft", completed: !!workflow.submitted_at },
    { key: "review", label: "Review", completed: !!workflow.reviewed_at },
    { key: "approval", label: "Approval", completed: !!workflow.approved_at },
    { key: "publication", label: "Published", completed: !!workflow.published_at },
  ];

  const currentStageIndex = stages.findIndex(
    (stage) => stage.key === workflow.status.split("_")[0] || stage.key === workflow.status
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            {stages.map((stage, index) => (
              <div key={stage.key} className="flex items-center">
                <div
                  className={`h-2 w-2 rounded-full transition-colors ${
                    stage.completed
                      ? "bg-green-500"
                      : index === currentStageIndex
                      ? "bg-blue-500 animate-pulse"
                      : "bg-gray-300"
                  }`}
                />
                {index < stages.length - 1 && (
                  <div
                    className={`h-0.5 w-3 ${
                      stages[index + 1].completed ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            {stages.map((stage, index) => (
              <div key={stage.key} className="flex items-center gap-2 text-xs">
                <div
                  className={`h-2 w-2 rounded-full ${
                    stage.completed
                      ? "bg-green-500"
                      : index === currentStageIndex
                      ? "bg-blue-500"
                      : "bg-gray-300"
                  }`}
                />
                <span className={stage.completed ? "text-green-500" : ""}>
                  {stage.label}
                  {stage.completed && " ✓"}
                  {index === currentStageIndex && !stage.completed && " (Current)"}
                </span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ==================== VIEW DETAILS BUTTON ====================
const ViewDetailsButton = ({ workflowId }) => {
  const navigate = useNavigate();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/workflows/${workflowId}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p className="font-medium">View Details</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ==================== MAIN COMPONENT ====================
const ConsulteWorkflow = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: workflowsData = [],
    isLoading,
    isError,
    error,
  } = useGetWorkflowsQuery();

  // Normalize workflows data
  const workflows = Array.isArray(workflowsData)
    ? workflowsData
    : Array.isArray(workflowsData?.results)
    ? workflowsData.results
    : [];

  // Apply filters
  const filteredWorkflows = useMemo(() => {
    let filtered = workflows;

    if (statusFilter !== "all") {
      filtered = filtered.filter((w) => w.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.nom?.toLowerCase().includes(query) ||
          w.description?.toLowerCase().includes(query) ||
          w.document?.doc_title?.toLowerCase().includes(query) ||
          w.author?.username?.toLowerCase().includes(query) ||
          w.reviewer?.username?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [workflows, statusFilter, searchQuery]);

  // Table columns - PUT VIEW BUTTON FIRST SO IT'S ALWAYS VISIBLE
  const columns = useMemo(
    () => [
      // ✅ ACTIONS COLUMN FIRST - ALWAYS VISIBLE
      {
        id: "view_details",
        header: "",
        size: 60,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => <ViewDetailsButton workflowId={row.original.id} />,
      },
      {
        id: "id",
        accessorKey: "id",
        header: "ID",
        size: 60,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            #{row.original.id}
          </span>
        ),
      },
      {
        id: "nom",
        accessorKey: "nom",
        header: "Workflow Name",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1 min-w-[200px]">
            <span className="font-medium text-sm">{row.original.nom}</span>
            {row.original.description && (
              <span className="text-xs text-muted-foreground line-clamp-1">
                {row.original.description}
              </span>
            )}
          </div>
        ),
      },
      {
        id: "document",
        accessorKey: "document",
        header: "Document",
        cell: ({ row }) => {
          const doc = row.original.document;
          if (!doc) return <span className="text-xs text-muted-foreground">—</span>;
          return (
            <div className="flex items-center gap-2">
              <DocumentCell row={row} />
              <span className="text-sm line-clamp-1">
                {doc.doc_title || doc.doc_path || "Untitled"}
              </span>
            </div>
          );
        },
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <WorkflowStatusBadge status={row.original.status} />,
      },
      {
        id: "progress",
        header: "Progress",
        cell: ({ row }) => <WorkflowStageProgress workflow={row.original} />,
      },
      {
        id: "users",
        header: "Assigned Users",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <UserAvatar user={row.original.author} />
            <span className="text-xs text-muted-foreground">→</span>
            <UserAvatar user={row.original.reviewer} />
            <span className="text-xs text-muted-foreground">→</span>
            <UserAvatar user={row.original.approver} />
            <span className="text-xs text-muted-foreground">→</span>
            <UserAvatar user={row.original.publisher} />
          </div>
        ),
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => {
          const date = row.original.created_at;
          if (!date) return "—";
          return (
            <span className="text-xs text-muted-foreground">
              {new Date(date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          );
        },
      },
    ],
    []
  );

  // ✅ COMBINE WITH DEFAULT COLUMNS - BUT PUT VIEW BUTTON FIRST
  const combinedColumns = [
    ...defaultColumns.slice(0, 2), // checkbox + expand
    columns[0], // VIEW DETAILS BUTTON - ALWAYS VISIBLE
    ...columns.slice(1), // rest of columns
  ];

  // Statistics
  const stats = useMemo(() => {
    return {
      total: workflows.length,
      draft: workflows.filter((w) => w.status === "draft").length,
      in_review: workflows.filter((w) => w.status === "in_review").length,
      pending_approval: workflows.filter((w) => w.status === "pending_approval").length,
      approved: workflows.filter((w) => w.status === "approved").length,
      published: workflows.filter((w) => w.status === "published").length,
      rejected: workflows.filter((w) => w.status === "rejected").length,
    };
  }, [workflows]);

  const redirectAdd = () => {
    navigate("/creer-workflow");
  };

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Error Loading Workflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {error?.data?.error || error?.message || "Failed to load workflows"}
            </p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-4 md:py-6 px-4">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and monitor document workflows
            </p>
          </div>
          <Button onClick={redirectAdd} size="default" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Workflow
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Draft
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.in_review}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending_approval}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Published
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {stats.published}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 w-full">
            <Input
              placeholder="Search workflows by name, description, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Draft
                </div>
              </SelectItem>
              <SelectItem value="in_review">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  In Review
                </div>
              </SelectItem>
              <SelectItem value="pending_approval">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3" />
                  Pending Approval
                </div>
              </SelectItem>
              <SelectItem value="approved">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" />
                  Approved
                </div>
              </SelectItem>
              <SelectItem value="published">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" />
                  Published
                </div>
              </SelectItem>
              <SelectItem value="rejected">
                <div className="flex items-center gap-2">
                  <XCircle className="h-3 w-3" />
                  Rejected
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Table */}
        <DataTable
          columns={combinedColumns}
          data={filteredWorkflows}
          onAdd={redirectAdd}
          title="Workflows"
          pageSize={20}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ConsulteWorkflow;
