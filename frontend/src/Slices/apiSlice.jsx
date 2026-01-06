import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the base URL for your Django backend
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Create the base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState, endpoint }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("authorization", `Token ${token}`);
    }

    // Only set Content-Type for non-FormData requests. Exclude endpoints that
    // send FormData (createDocument, updateDocument, patchDocument) so the
    // browser can set the proper multipart boundary header.
    if (
      !headers.get("Content-Type") &&
      endpoint !== "createDocument" &&
      endpoint !== "updateDocument" &&
      endpoint !== "patchDocument" &&
      endpoint !== "createTask"
    ) {
      headers.set("Content-Type", "application/json");
    }

    return headers; 
  },
});

// Enhanced base query to handle token refresh and logout on 401
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Token is invalid, dispatch logout action from auth slice
    const { logout } = await import("./authSlice");
    api.dispatch(logout());
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Document", "Workflow", "Task", "User"],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: ({ username, password }) => ({
        url: "/auth/login/",
        method: "POST",
        body: { username, password },
      }),
    }),
    getMe: builder.query({
      query: () => ({ url: "/api/me/", method: "GET" }),
      providesTags: ["User"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Auth hooks
  useLoginMutation,
  useGetMeQuery,
} = apiSlice;
