// Pages/MyTasks.jsx - CLEAN VERSION
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetMyTasksQuery } from "@/slices/taskSlice";
import { DataTable } from "../components/tables/data-table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import PriorityBadge from "../Hooks/usePriority";
import StatusBadge from "../Hooks/useStatusBadge";
import { Loader2, AlertCircle, Check, Eye, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";

const MyTasks = () => {
  const navigate = useNavigate();
  
  const { data: tasksData = [], isLoading, error } = useGetMyTasksQuery();

  // Extract tasks array
  const myTasks = useMemo(() => {
    const tasks = Array.isArray(tasksData) ? tasksData : tasksData.results || [];
    
    return tasks.map(task => ({
      ...task,
      workflow_name: task.task_workflow?.nom || "N/A",
      workflow_id: task.task_workflow?.id,
      workflow_status: task.task_workflow?.status || "unknown",
    }));
  }, [tasksData]);

  // Separate active, completed, and failed tasks
  const activeTasks = useMemo(() => {
    return myTasks.filter(t => t.task_statut !== "completed" && t.task_statut !== "rejected");
  }, [myTasks]);

  const completedTasks = useMemo(() => {
    return myTasks.filter(t => t.task_statut === "completed");
  }, [myTasks]);

  const failedTasks = useMemo(() => {
    return myTasks.filter(t => t.task_statut === "rejected");
  }, [myTasks]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: myTasks.length,
      active: activeTasks.length,
      pending: myTasks.filter((t) => t.task_statut === "pending").length,
      inProgress: myTasks.filter((t) => t.task_statut === "in_progress").length,
      completed: completedTasks.length,
      failed: failedTasks.length,
    };
  }, [myTasks, activeTasks, completedTasks, failedTasks]);

  // Define columns from scratch
  const columns = useMemo(() => [
    {
      id: "id", 
      accessorKey: "id", 
      header: "ID",
      cell: ({ row }) => <div className="w-[60px]">{row.getValue("id")}</div>,
    },
    { 
      id: "task_name", 
      accessorKey: "task_name", 
      header: "Task Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("task_name")}</div>,
    },
    {
      id: "workflow",
      header: "Workflow",
      accessorKey: "workflow_name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.workflow_name}</span>
          <Badge variant="outline" className="w-fit text-xs mt-1">
            {row.original.workflow_status}
          </Badge>
        </div>
      ),
    },
    {
      id: "task_stage",
      accessorKey: "task_stage",
      header: "Stage",
      cell: ({ row }) => {
        const stageLabels = {
          draft: "Draft",
          review: "Review",
          approval: "Approval",
          publication: "Publication",
        };
        return <Badge variant="outline">{stageLabels[row.getValue("task_stage")] || row.getValue("task_stage")}</Badge>;
      },
    },
    {
      id: "task_priorite",
      accessorKey: "task_priorite",
      header: "Priority",
      cell: ({ row }) => <PriorityBadge priority={row.getValue("task_priorite")} />,
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
        if (!date) return <span className="text-muted-foreground">N/A</span>;
        const dateObj = new Date(date);
        const isOverdue = dateObj < new Date() && row.original.task_statut !== "completed" && row.original.task_statut !== "rejected";
        return (
          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
            {dateObj.toLocaleDateString("en-GB")}
          </span>
        );
      },
    },
    {
      id: "view_action",
      header: "Actions",
      cell: ({ row }) => {
        const taskId = row.original.id;
        
        return (
          <div className="flex items-center">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/tasks/${taskId}`);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </div>
        );
      },
    },
  ], [navigate]);

  // Debug: Log when component renders
  console.log("MyTasks rendered with data:", {
    total: myTasks.length,
    active: activeTasks.length,
    completed: completedTasks.length,
    failed: failedTasks.length,
    columns: columns.length
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load tasks: {error?.data?.error || error?.message || "Unknown error"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-4 md:py-6 px-4">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>
              Tasks assigned to you across all workflows
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">Active Tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <p className="text-xs text-muted-foreground">Failed/Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Tables with Tabs */}
        {myTasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-muted-foreground">
                  No tasks assigned to you
                </p>
                <p className="text-sm text-muted-foreground">
                  Tasks will appear here when they are assigned to you in workflows
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="active">
                Active ({stats.active})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({stats.completed})
              </TabsTrigger>
              <TabsTrigger value="failed">
                Failed ({stats.failed})
              </TabsTrigger>
            </TabsList>
            
            {/* Active Tasks Tab */}
            <TabsContent value="active" className="mt-4">
              {activeTasks.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="text-center space-y-2">
                      <Check className="h-12 w-12 text-green-500 mx-auto" />
                      <p className="text-lg font-medium text-muted-foreground">
                        All active tasks completed!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Great job! You have no pending tasks.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="border rounded-lg">
                  <DataTable 
                    columns={columns} 
                    data={activeTasks} 
                    pageSize={20} 
                  />
                </div>
              )}
            </TabsContent>
            
            {/* Completed Tasks Tab */}
            <TabsContent value="completed" className="mt-4">
              {completedTasks.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="text-center space-y-2">
                      <p className="text-lg font-medium text-muted-foreground">
                        No completed tasks yet
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Completed tasks will appear here
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="border rounded-lg">
                  <DataTable 
                    columns={columns} 
                    data={completedTasks} 
                    pageSize={20} 
                  />
                </div>
              )}
            </TabsContent>

            {/* Failed Tasks Tab */}
            <TabsContent value="failed" className="mt-4">
              {failedTasks.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="text-center space-y-2">
                      <Check className="h-12 w-12 text-green-500 mx-auto" />
                      <p className="text-lg font-medium text-muted-foreground">
                        No failed or rejected tasks
                      </p>
                      <p className="text-sm text-muted-foreground">
                        All your tasks are in good standing!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="border rounded-lg">
                  <DataTable 
                    columns={columns} 
                    data={failedTasks} 
                    pageSize={20} 
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default MyTasks;
