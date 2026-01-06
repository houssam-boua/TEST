// slices/userSlice.js
import { apiSlice } from "./apiSlice";

export const userSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== Basic CRUD Operations ====================
    getUsers: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return { url: `/api/users/${qs ? `?${qs}` : ""}`, method: "GET" };
      },
      providesTags: ["User"],
    }),

    getUserById: builder.query({
      query: (id) => ({ url: `/api/users/${id}/`, method: "GET" }),
      providesTags: ["User"],
    }),

    createUser: builder.mutation({
      query: (data) => ({ url: "/api/users/", method: "POST", body: data }),
      invalidatesTags: ["User"],
    }),

    updateUser: builder.mutation({
      // Use PATCH to allow partial updates (frontend won't be forced to resend unchanged fields such as password)
      query: ({ id, data }) => ({
        url: `/api/users/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({ url: `/api/users/${id}/`, method: "DELETE" }),
      invalidatesTags: ["User"],
    }),

    // ==================== Workflow Helper Queries ====================
    
    // ✅ NEW: Fetch users filtered by Department AND Role (Always includes Admins)
    getUsersByRoleAndDept: builder.query({
      query: ({ departmentId, role }) => ({
        url: `/api/users/by-role-department/`,
        method: "GET",
        params: { department_id: departmentId, role: role },
      }),
      providesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUsersByRoleAndDeptQuery, // ✅ Export new hook
} = userSlice;

export default userSlice;