import { apiSlice } from "./apiSlice";

export const workflowSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorkflows: builder.query({
      query: (params) => {
        const url =
          params && params.project
            ? `/api/workflows/?project=${encodeURIComponent(params.project)}`
            : "/api/workflows/";
        return { url, method: "GET" };
      },
      providesTags: ["Workflow"],
    }),
    getWorkflowById: builder.query({
      query: (id) => ({ url: `/api/workflows/${id}/`, method: "GET" }),
      providesTags: ["Workflow"],
    }),
    createWorkflow: builder.mutation({
      query: (formData) => ({
        url: "/api/workflows/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Workflow"],
    }),
    updateWorkflow: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/workflows/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Workflow"],
    }),
    deleteWorkflow: builder.mutation({
      query: (id) => ({ url: `/api/workflows/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Workflow"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWorkflowsQuery,
  useGetWorkflowByIdQuery,
  useCreateWorkflowMutation,
  useUpdateWorkflowMutation,
  useDeleteWorkflowMutation,
} = workflowSlice;
