import { apiSlice } from "./apiSlice";

export const permissionSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPermissions: builder.query({
      query: () => ({
        url: "/api/permissions/list_permissions/",
        method: "GET",
      }),
      // backend returns { permissions: [...] } — return the inner array for consumers
      transformResponse: (response) => response?.permissions ?? [],
      providesTags: ["Permission"],
    }),
    getPermissionGroups: builder.query({
      query: (params) => ({
        url: "/api/permissions/groups/",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              { type: "PermissionGroup", id: "LIST" },
              ...result.map((r) => ({ type: "PermissionGroup", id: r.id })),
            ]
          : [{ type: "PermissionGroup", id: "LIST" }],
    }),

    createPermissionGroup: builder.mutation({
      query: (body) => ({
        url: "/api/permissions/groups/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "PermissionGroup", id: "LIST" }],
    }),

    getPermissionGroupById: builder.query({
      query: (id) => ({ url: `/api/permissions/groups/${id}/`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "PermissionGroup", id }],
    }),

    updatePermissionGroup: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/permissions/groups/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PermissionGroup", id },
        { type: "PermissionGroup", id: "LIST" },
      ],
    }),

    patchPermissionGroup: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/permissions/groups/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PermissionGroup", id },
        { type: "PermissionGroup", id: "LIST" },
      ],
    }),

    deletePermissionGroup: builder.mutation({
      query: (id) => ({
        url: `/api/permissions/groups/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PermissionGroup", id },
        { type: "PermissionGroup", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPermissionsQuery,
  useGetPermissionGroupsQuery,
  useCreatePermissionGroupMutation,
  useGetPermissionGroupByIdQuery,
  useUpdatePermissionGroupMutation,
  usePatchPermissionGroupMutation,
  useDeletePermissionGroupMutation,
} = permissionSlice;
