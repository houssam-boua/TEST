import { apiSlice } from "./apiSlice";

export const userSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userSlice;

export default userSlice;
