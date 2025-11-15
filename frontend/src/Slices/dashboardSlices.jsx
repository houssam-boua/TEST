import { apiSlice } from "./apiSlice";

// Dashboard endpoints (per-widget) + invalidate cache
export const dashboardSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Documents by departement
    getDashboardDocumentsByDepartement: builder.query({
      query: () => ({
        url: "/api/dashboard/documents/by-departement/",
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),

    // Documents by status
    getDashboardDocumentsByStatus: builder.query({
      query: () => ({
        url: "/api/dashboard/documents/by-status/",
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),

    // Documents total count
    getDashboardDocumentsCount: builder.query({
      query: () => ({ url: "/api/dashboard/documents/count/", method: "GET" }),
      providesTags: ["Dashboard"],
    }),

    // Recent documents
    getDashboardDocumentsRecent: builder.query({
      // optional params may be supported by backend in the future
      query: (params) => ({
        url: "/api/dashboard/documents/recent/",
        method: "GET",
        params,
      }),
      providesTags: ["Dashboard"],
    }),

    // Invalidate dashboard cache (admin action)
    invalidateDashboardCache: builder.mutation({
      query: () => ({
        url: "/api/dashboard/invalidate-cache/",
        method: "POST",
      }),
      // invalidate cached dashboard queries so UI refetches
      invalidatesTags: ["Dashboard"],
    }),

    // Users count
    getDashboardUsersCount: builder.query({
      query: () => ({ url: "/api/dashboard/users/count/", method: "GET" }),
      providesTags: ["Dashboard"],
    }),

    // Validators count
    getDashboardValidatorsCount: builder.query({
      query: () => ({ url: "/api/dashboard/validators/count/", method: "GET" }),
      providesTags: ["Dashboard"],
    }),

    getDashboardDepartementsCount: builder.query({
      query: () => ({
        url: "/api/dashboard/departements/count/",
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),

    getDashboardWorkflowsCount: builder.query({
      query: () => ({
        url: "/api/dashboard/workflows/count/",
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardDocumentsByDepartementQuery,
  useGetDashboardDocumentsByStatusQuery,
  useGetDashboardDocumentsCountQuery,
  useGetDashboardDocumentsRecentQuery,
  useInvalidateDashboardCacheMutation,
  useGetDashboardUsersCountQuery,
  useGetDashboardValidatorsCountQuery,
  useGetDashboardDepartementsCountQuery,
  useGetDashboardWorkflowsCountQuery,
} = dashboardSlice;
