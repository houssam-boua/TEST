// slices/workflowSlice.js
import { apiSlice } from "./apiSlice";

export const workflowSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== Basic CRUD Operations ====================
    getWorkflows: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        
        if (params) {
          if (params.project) queryParams.append('project', params.project);
          if (params.status) queryParams.append('status', params.status);
          if (params.author) queryParams.append('author', params.author);
          if (params.reviewer) queryParams.append('reviewer', params.reviewer);
          if (params.approver) queryParams.append('approver', params.approver);
          if (params.publisher) queryParams.append('publisher', params.publisher);
          if (params.document) queryParams.append('document', params.document);
          if (params.search) queryParams.append('search', params.search);
          if (params.ordering) queryParams.append('ordering', params.ordering);
        }
        
        const url = queryParams.toString()
          ? `/api/workflows/?${queryParams.toString()}`
          : "/api/workflows/";
        
        return { url, method: "GET" };
      },
      providesTags: ["Workflow"],
    }),
    
    getWorkflowById: builder.query({
      query: (id) => ({ url: `/api/workflows/${id}/`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Workflow", id }],
    }),
    
    createWorkflow: builder.mutation({
      query: (data) => {
        // Support both FormData and JSON
        const isFormData = data instanceof FormData;
        return {
          url: "/api/workflows/",
          method: "POST",
          body: data,
          // Let browser set Content-Type for FormData
          ...(isFormData ? {} : { headers: { "Content-Type": "application/json" } }),
        };
      },
      // ✅ UPDATED: Invalidates "Document" so the list refreshes to show "Pending" status immediately
      invalidatesTags: ["Workflow", "Task", "Document"],
    }),
    
    updateWorkflow: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/workflows/${id}/`,
        method: "PUT",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Workflow", id },
        "Workflow",
        "Task",
        "Document", // ✅ UPDATED
      ],
    }),
    
    patchWorkflow: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/workflows/${id}/`,
        method: "PATCH",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Workflow", id },
        "Workflow",
        "Document", // ✅ UPDATED
      ],
    }),
    
    deleteWorkflow: builder.mutation({
      query: (id) => ({ url: `/api/workflows/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Workflow", "Task", "Document"], // ✅ UPDATED
    }),

    // ==================== GED Workflow Lifecycle Actions ====================
    
    submitForReview: builder.mutation({
      query: (workflowId) => ({
        url: `/api/workflows/${workflowId}/submit-for-review/`,
        method: "POST",
      }),
      invalidatesTags: (result, error, workflowId) => [
        { type: "Workflow", id: workflowId },
        "Workflow",
        "Task",
        "Notification",
        "Document", // ✅ UPDATED
      ],
    }),
    
    validateReview: builder.mutation({
      query: ({ id, action, reason, notes }) => ({
        url: `/api/workflows/${id}/validate-review/`,
        method: "POST",
        body: { action, reason, notes },
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Workflow", id },
        "Workflow",
        "Task",
        "Notification",
        "Document", // ✅ UPDATED: Ensures document status updates to Rejected if applicable
      ],
    }),
    
    approveSign: builder.mutation({
      query: (workflowId) => ({
        url: `/api/workflows/${workflowId}/approve-sign/`,
        method: "POST",
      }),
      invalidatesTags: (result, error, workflowId) => [
        { type: "Workflow", id: workflowId },
        "Workflow",
        "Task",
        "Signature",
        "Notification",
        "Document", // ✅ UPDATED: Ensures document status updates to Approved
      ],
    }),
    
    publishWorkflow: builder.mutation({
      query: (workflowId) => ({
        url: `/api/workflows/${workflowId}/publish/`,
        method: "POST",
      }),
      invalidatesTags: (result, error, workflowId) => [
        { type: "Workflow", id: workflowId },
        "Workflow",
        "Task",
        "Notification",
        "Document", // ✅ UPDATED: Ensures document status updates to Public
      ],
    }),

    // ==================== User-Specific Workflow Queries ====================
    
    getMyWorkflows: builder.query({
      query: () => ({
        url: "/api/workflows/my-workflows/",
        method: "GET",
      }),
      providesTags: ["Workflow"],
    }),
    
    getPendingActionWorkflows: builder.query({
      query: () => ({
        url: "/api/workflows/pending-action/",
        method: "GET",
      }),
      providesTags: ["Workflow"],
    }),

    // ==================== Workflow Audit & History ====================
    
    getWorkflowHistory: builder.query({
      query: (workflowId) => ({
        url: `/api/workflows/${workflowId}/history/`,
        method: "GET",
      }),
      providesTags: (result, error, workflowId) => [
        { type: "Workflow", id: workflowId },
      ],
    }),
    
    getWorkflowSignatures: builder.query({
      query: (workflowId) => ({
        url: `/api/workflows/${workflowId}/signatures/`,
        method: "GET",
      }),
      providesTags: ["Signature"],
    }),
    
    getWorkflowNotifications: builder.query({
      query: (workflowId) => ({
        url: `/api/workflows/${workflowId}/notifications/`,
        method: "GET",
      }),
      providesTags: ["Notification"],
    }),

    // ==================== Admin Actions ====================
    
    assignWorkflowUsers: builder.mutation({
      query: ({ id, author, reviewer, approver, publisher }) => ({
        url: `/api/workflows/${id}/assign-users/`,
        method: "POST",
        body: { author, reviewer, approver, publisher },
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Workflow", id },
        "Workflow",
        "Task",
      ],
    }),

    // ==================== Workflow Stages ====================
    
    getWorkflowStages: builder.query({
      query: () => ({
        url: "/api/stages/",
        method: "GET",
      }),
      providesTags: ["WorkflowStage"],
    }),

    // ==================== Statistics & Dashboard ====================
    
    getWorkflowStatistics: builder.query({
      query: () => ({
        url: "/api/statistics/",
        method: "GET",
      }),
      providesTags: ["Statistics"],
    }),
  }),
  overrideExisting: false,
});

export const {
  // Basic CRUD
  useGetWorkflowsQuery,
  useGetWorkflowByIdQuery,
  useCreateWorkflowMutation,
  useUpdateWorkflowMutation,
  usePatchWorkflowMutation,
  useDeleteWorkflowMutation,
  
  // GED Lifecycle Actions
  useSubmitForReviewMutation,
  useValidateReviewMutation,
  useApproveSignMutation,
  usePublishWorkflowMutation,
  
  // User-Specific Queries
  useGetMyWorkflowsQuery,
  useGetPendingActionWorkflowsQuery,
  
  // Audit & History
  useGetWorkflowHistoryQuery,
  useGetWorkflowSignaturesQuery,
  useGetWorkflowNotificationsQuery,
  
  // Admin Actions
  useAssignWorkflowUsersMutation,
  
  // Stages
  useGetWorkflowStagesQuery,
  
  // Statistics
  useGetWorkflowStatisticsQuery,
} = workflowSlice;