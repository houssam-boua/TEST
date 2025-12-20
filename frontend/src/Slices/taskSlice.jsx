import { apiSlice } from "./apiSlice";

export const taskSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query({
      query: (params) => {
        const url =
          params && params.workflow
            ? `/api/tasks/?workflow=${encodeURIComponent(params.workflow)}`
            : "/api/tasks/";
        return { url, method: "GET" };
      },
      providesTags: ["Task"],
    }),
    getTaskById: builder.query({
      query: (id) => ({ url: `/api/tasks/${id}/`, method: "GET" }),
      providesTags: ["Task"],
    }),
    createTask: builder.mutation({
      query: (formData) => ({
        url: "/api/tasks/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Task"],
    }),
    updateTask: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/tasks/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Task"],
    }),
    deleteTask: builder.mutation({
      query: (id) => ({ url: `/api/tasks/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Task"],
    }),

    getTasksofWorkflow: builder.query({
      query: (workflowId) => ({
        url: `/api/workflows/${workflowId}/tasks/`,
        method: "GET",
      }),
      providesTags: ["Task"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetTasksofWorkflowQuery,
} = taskSlice;
