import { apiSlice } from "./apiSlice";

// Dashboard endpoints (per-widget) + invalidate cache
export const dashboardSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ ADDED: Main Dashboard Stats (Aggregated) - Fixes the SyntaxError
    getDashboardStats: builder.query({
      query: () => ({
        url: "/api/dashboard/",
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),

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
      query: () => ({ 
        url: "/api/dashboard/documents/count/", 
        method: "GET" 
      }),
      providesTags: ["Dashboard"],
    }),

    // Recent documents
    getDashboardDocumentsRecent: builder.query({
      query: (params) => ({
        url: "/api/dashboard/documents/recent/",
        method: "GET",
        params,
      }),
      providesTags: ["Dashboard"],
    }),

    // Workflows by state (Élaboration, Vérification, Approbation, Diffusion)
    getWorkflowsByState: builder.query({
      query: () => ({
        url: "/api/dashboard/workflows/by-state/",
        method: "GET",
      }),
      providesTags: ["Dashboard", "Workflows"],
    }),

    // Invalidate dashboard cache (admin action)
    invalidateDashboardCache: builder.mutation({
      query: () => ({
        url: "/api/dashboard/invalidate-cache/",
        method: "POST",
      }),
      invalidatesTags: ["Dashboard"],
    }),

    // Users count
    getDashboardUsersCount: builder.query({
      query: () => ({ 
        url: "/api/dashboard/users/count/", 
        method: "GET" 
      }),
      providesTags: ["Dashboard"],
    }),

    // Validators count
    getDashboardValidatorsCount: builder.query({
      query: () => ({ 
        url: "/api/dashboard/validators/count/", 
        method: "GET" 
      }),
      providesTags: ["Dashboard"],
    }),

    // Departements count
    getDashboardDepartementsCount: builder.query({
      query: () => ({
        url: "/api/dashboard/departements/count/",
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),

    // Workflows count
    getDashboardWorkflowsCount: builder.query({
      query: () => ({
        url: "/api/dashboard/workflows/count/",
        method: "GET",
      }),
      providesTags: ["Dashboard", "Workflows"],
    }),
  }),
  overrideExisting: false,
});

export const {
  // ✅ EXPORTED: Missing hook causing the error
  useGetDashboardStatsQuery,
  useGetDashboardDocumentsByDepartementQuery,
  useGetDashboardDocumentsByStatusQuery,
  useGetDashboardDocumentsCountQuery,
  useGetDashboardDocumentsRecentQuery,
  useGetWorkflowsByStateQuery,
  useInvalidateDashboardCacheMutation,
  useGetDashboardUsersCountQuery,
  useGetDashboardValidatorsCountQuery,
  useGetDashboardDepartementsCountQuery,
  useGetDashboardWorkflowsCountQuery,
} = dashboardSlice;
