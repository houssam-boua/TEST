import { apiSlice } from "./apiSlice";

export const departementSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDepartements: builder.query({
      query: () => ({ url: "/api/departements/", method: "GET" }),
      providesTags: ["Departement"],
    }),

    createDepartement: builder.mutation({
      query: (body) => ({ url: "/api/departements/", method: "POST", body }),
      invalidatesTags: ["Departement"],
    }),

    updateDepartement: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/api/departements/${id}/`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: ["Departement"],
    }),

    deleteDepartement: builder.mutation({
      query: (id) => ({ url: `/api/departements/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Departement"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDepartementsQuery,
  useCreateDepartementMutation,
  useUpdateDepartementMutation,
  useDeleteDepartementMutation,
} = departementSlice;
