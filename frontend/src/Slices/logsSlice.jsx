import { apiSlice } from "./apiSlice";

export const logsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLogs: builder.query({
      query: (params) => {
        // allow optional params object for filtering/pagination later
        const qp = params ? `?${new URLSearchParams(params).toString()}` : "";
        return { url: `/api/users/logs/${qp}`, method: "GET" };
      },
      providesTags: ["Log"],
    }),
    getLogById: builder.query({
      query: (id) => ({ url: `/api/users/logs/${id}/`, method: "GET" }),
      providesTags: ["Log"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetLogsQuery, useGetLogByIdQuery } = logsSlice;
