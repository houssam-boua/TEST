// slices/notificationSlice.js
import { apiSlice } from "./apiSlice";

export const notificationSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        
        if (params) {
          if (params.workflow) queryParams.append('workflow', params.workflow);
          if (params.notification_type) queryParams.append('notification_type', params.notification_type);
          if (params.email_status) queryParams.append('email_status', params.email_status);
        }
        
        const url = queryParams.toString()
          ? `/api/notifications/?${queryParams.toString()}`
          : "/api/notifications/";
        
        return { url, method: "GET" };
      },
      providesTags: ["Notification"],
    }),
    
    getNotificationById: builder.query({
      query: (id) => ({ url: `/api/notifications/${id}/`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Notification", id }],
    }),
    
    getUnreadNotifications: builder.query({
      query: () => ({
        url: "/api/notifications/unread/",
        method: "GET",
      }),
      providesTags: ["Notification"],
    }),
    
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/api/notifications/${id}/mark-read/`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Notification", id },
        "Notification",
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useGetNotificationByIdQuery,
  useGetUnreadNotificationsQuery,
  useMarkNotificationReadMutation,
} = notificationSlice;
