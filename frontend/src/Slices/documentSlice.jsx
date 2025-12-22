import { apiSlice } from "./apiSlice";

export const documentSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query({
      // Accept an optional params object: { folder }
      query: (params) => {
        const folder = params?.folder;
        const url = folder
          ? `/api/documents/?folder=${encodeURIComponent(folder)}`
          : "/api/documents/";
        return { url, method: "GET" };
      },
      providesTags: ["Document"],
    }),
    getDocumentById: builder.query({
      query: (id) => ({ url: `/api/documents/${id}/`, method: "GET" }),
      providesTags: ["Document"],
    }),
    createDocument: builder.mutation({
      // expects a FormData instance when uploading files
      query: (formData) => ({
        url: "/api/documents/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Document"],
    }),
    updateDocument: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/documents/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Document"],
    }),
    deleteDocument: builder.mutation({
      query: (id) => ({ url: `/api/documents/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Document"],
    }),

    createFolder: builder.mutation({
      query: (body) => ({
        url: "/api/folders/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Document"],
    }),

    getFolderContent: builder.query({
      query: () => ({
        url: "/api/documents/folder-contents/",
        method: "GET",
      }),
      providesTags: ["Document"],
    }),

    getFolders: builder.query({
      query: () => ({
        url: "/api/folders/",
        method: "GET",
      }),
      providesTags: ["Document"],
    }),

    getFoldersTree: builder.query({
      query: () => ({
        url: "/api/folders/tree/",
        method: "GET",
      }),
      providesTags: ["Document"],
    }),
    getDocumentNature: builder.query({
      query: () => ({
        url: "/api/document-natures/",
        method: "GET",
      }),
      providesTags: ["Document"],
    }),

    getDocumentCategories: builder.query({
      query: () => ({
        url: "/api/document-categories/",
        method: "GET",
      }),
      providesTags: ["Document"],
    }),

    patchDocument: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/documents/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Document"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDocumentsQuery,

  useGetDocumentByIdQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useCreateFolderMutation,
  useGetFolderContentQuery,
  useGetFoldersQuery,
  useGetFoldersTreeQuery,
  useGetDocumentNatureQuery,
  useGetDocumentCategoriesQuery,
  usePatchDocumentMutation,
} = documentSlice;
