// slices/signatureSlice.js
import { apiSlice } from "./apiSlice";

export const signatureSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSignatures: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        
        if (params) {
          if (params.workflow) queryParams.append('workflow', params.workflow);
          if (params.signed_by) queryParams.append('signed_by', params.signed_by);
          if (params.stage) queryParams.append('stage', params.stage);
        }
        
        const url = queryParams.toString()
          ? `/api/signatures/?${queryParams.toString()}`
          : "/api/signatures/";
        
        return { url, method: "GET" };
      },
      providesTags: ["Signature"],
    }),
    
    getSignatureById: builder.query({
      query: (id) => ({ url: `/api/signatures/${id}/`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Signature", id }],
    }),
    
    verifySignature: builder.mutation({
      query: (id) => ({
        url: `/api/signatures/${id}/verify/`,
        method: "POST",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSignaturesQuery,
  useGetSignatureByIdQuery,
  useVerifySignatureMutation,
} = signatureSlice;
