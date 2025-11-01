import { apiSlice } from "./apiSlice";

export const rolesSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: () => ({ url: "/api/roles/", method: "GET" }),
      providesTags: ["Role"],
    }),

    getRoleById: builder.query({
      query: (id) => ({ url: `/api/roles/${id}/`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Role", id }],
    }),

    createRole: builder.mutation({
      query: (body) => ({ url: "/api/roles/", method: "POST", body }),
      invalidatesTags: ["Role"],
    }),

    updateRole: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/api/roles/${id}/`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Role", id }],
    }),

    partialUpdateRole: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/api/roles/${id}/`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Role", id }],
    }),

    deleteRole: builder.mutation({
      query: (id) => ({ url: `/api/roles/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Role"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  usePartialUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesSlice;
