// slices/taskSlice.jsx
import { apiSlice } from "./apiSlice";

export const taskSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== Basic CRUD Operations ====================
    getTasks: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        
        if (params) {
          if (params.workflow) queryParams.append('task_workflow', params.workflow);
          if (params.assigned_to) queryParams.append('task_assigned_to', params.assigned_to);
          if (params.stage) queryParams.append('task_stage', params.stage);
          if (params.status) queryParams.append('task_status', params.status);
          if (params.priority) queryParams.append('task_priorite', params.priority);
          if (params.search) queryParams.append('search', params.search);
          if (params.ordering) queryParams.append('ordering', params.ordering);
        }
        
        const url = queryParams.toString()
          ? `/api/tasks/?${queryParams.toString()}`
          : "/api/tasks/";
        
        return { url, method: "GET" };
      },
      providesTags: ["Task"],
    }),
    
    getTasksofWorkflow: builder.query({
      query: (workflowId) => ({
        url: `/api/tasks/?task_workflow=${workflowId}`,
        method: "GET",
      }),
      providesTags: ["Task"],
    }),
    
    getTaskById: builder.query({
      query: (id) => ({ url: `/api/tasks/${id}/`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Task", id }],
    }),
    
    createTask: builder.mutation({
      query: (data) => {
        const isFormData = data instanceof FormData;
        return {
          url: "/api/tasks/",
          method: "POST",
          body: data,
          ...(isFormData ? {} : { headers: { "Content-Type": "application/json" } }),
        };
      },
      invalidatesTags: ["Task", "Workflow"],
    }),
    
    updateTask: builder.mutation({
      query: ({ id, data }) => {
        const isFormData = data instanceof FormData;
        return {
          url: `/api/tasks/${id}/`,
          method: "PUT",
          body: data,
          ...(isFormData ? {} : { headers: { "Content-Type": "application/json" } }),
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Task", id },
        "Task",
        "Workflow",
      ],
    }),
    
    patchTask: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/tasks/${id}/`,
        method: "PATCH",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Task", id },
        "Task",
      ],
    }),
    
    deleteTask: builder.mutation({
      query: (id) => ({ url: `/api/tasks/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Task", "Workflow"],
    }),

    // ==================== Task Actions ====================
    
    // ✅ NEW: Get all tasks assigned to current user across all workflows
    getMyTasks: builder.query({
      query: () => ({
        url: "/api/tasks/my-tasks/",
        method: "GET",
      }),
      providesTags: ["Task"],
    }),
    
    getMyPendingTasks: builder.query({
      query: () => ({
        url: "/api/tasks/my-pending/",
        method: "GET",
      }),
      providesTags: ["Task"],
    }),
    
    getOverdueTasks: builder.query({
      query: () => ({
        url: "/api/tasks/overdue/",
        method: "GET",
      }),
      providesTags: ["Task"],
    }),
    
    completeTask: builder.mutation({
      query: ({ id, notes }) => ({
        url: `/api/tasks/${id}/complete/`,
        method: "POST",
        body: { notes },
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Task", id },
        "Task",
        "Workflow",
      ],
    }),
    
    rejectTask: builder.mutation({
      query: ({ id, reason, notes }) => ({
        url: `/api/tasks/${id}/reject/`,
        method: "POST",
        body: { reason, notes },
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Task", id },
        "Task",
        "Workflow",
      ],
    }),
    
    bulkUpdateTasks: builder.mutation({
      query: ({ task_ids, task_status, notes }) => ({
        url: "/api/tasks/bulk-update/",
        method: "POST",
        body: { task_ids, task_status, notes },
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["Task", "Workflow"],
    }),

    // ==================== Dashboard ====================
    
    getMyTasksDashboard: builder.query({
      query: () => ({
        url: "/api/my-tasks/",
        method: "GET",
      }),
      providesTags: ["Task"],
    }),
  }),
  overrideExisting: false,
});

export const {
  // Basic CRUD
  useGetTasksQuery,
  useGetTasksofWorkflowQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  usePatchTaskMutation,
  useDeleteTaskMutation,
  
  // Task Actions
  useGetMyTasksQuery, // ✅ NEW: Export the hook for my-tasks endpoint
  useGetMyPendingTasksQuery,
  useGetOverdueTasksQuery,
  useCompleteTaskMutation,
  useRejectTaskMutation,
  useBulkUpdateTasksMutation,
  
  // Dashboard
  useGetMyTasksDashboardQuery,
} = taskSlice;

export default taskSlice;
