import { apiSlice } from "./apiSlice";

export const documentSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // -------------------- Documents --------------------
    getDocuments: builder.query({
      query: (params) => {
        const folder = params?.folder;
        const url = folder
          ? `/api/documents/by-folder/?folder=${encodeURIComponent(folder)}`
          : "/api/documents/";
        return { url, method: "GET" };
      },
      transformResponse: (resp) => {
        if (resp && typeof resp === "object" && Array.isArray(resp.documents)) {
          return resp.documents;
        }
        return resp;
      },
      providesTags: (result) =>
        result
          ? [
              { type: "Document", id: "LIST" },
              ...(Array.isArray(result)
                ? result.map((d) => ({ type: "Document", id: d.id }))
                : []),
            ]
          : [{ type: "Document", id: "LIST" }],
    }),

    getDocumentById: builder.query({
      query: (id) => ({ url: `/api/documents/${id}/`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Document", id }],
    }),

    createDocument: builder.mutation({
      query: (formData) => ({
        url: "/api/documents/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Document", id: "LIST" }],
    }),

    updateDocument: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/documents/${id}/`,
        method: "PATCH", 
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Document", id: arg.id },
        { type: "Document", id: "LIST" },
        { type: "ArchivedDocument", id: "LIST" },
        "ArchiveNav",
      ],
    }),

    deleteDocument: builder.mutation({
      query: (id) => ({ url: `/api/documents/${id}/`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "Document", id },
        { type: "Document", id: "LIST" },
        { type: "ArchivedDocument", id: "LIST" },
        "ArchiveNav",
      ],
    }),

    // -------------------- ARCHIVE (Admin only) --------------------
    getArchiveNavigation: builder.query({
      query: (folderId) => {
        const qs = folderId ? `?folder_id=${folderId}` : "";
        return { url: `/api/archives/navigation/${qs}`, method: "GET" };
      },
      providesTags: ["ArchiveNav", { type: "ArchivedDocument", id: "LIST" }],
    }),

    getArchivedDocuments: builder.query({
      query: () => ({ url: "/api/documents/archived/", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              { type: "ArchivedDocument", id: "LIST" },
              ...(Array.isArray(result)
                ? result.map((r) => ({ type: "ArchivedDocument", id: r.id }))
                : []),
            ]
          : [{ type: "ArchivedDocument", id: "LIST" }],
    }),

    archiveDocument: builder.mutation({
      query: ({ id, mode, until, note }) => ({
        url: `/api/documents/${id}/archive/`,
        method: "POST",
        body: { mode, until, note },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Document", id: arg.id },
        { type: "Document", id: "LIST" },
        { type: "ArchivedDocument", id: "LIST" },
        "ArchiveNav",
      ],
    }),

    restoreDocument: builder.mutation({
      query: (id) => ({
        url: `/api/documents/${id}/restore/`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Document", id },
        { type: "Document", id: "LIST" },
        { type: "ArchivedDocument", id: "LIST" },
        "ArchiveNav",
      ],
    }),

    archiveFolder: builder.mutation({
      query: ({ id, mode, until, note }) => ({
        url: `/api/folders/${id}/archive/`,
        method: "POST",
        body: { mode, until, note },
      }),
      invalidatesTags: [
        { type: "Folder", id: "LIST" },
        { type: "Folder", id: "TREE" },
        { type: "Document", id: "LIST" },
        { type: "ArchivedDocument", id: "LIST" },
        "ArchiveNav",
      ],
    }),

    restoreFolder: builder.mutation({
      query: (id) => ({
        url: `/api/folders/${id}/restore/`,
        method: "POST",
      }),
      invalidatesTags: [
        { type: "Folder", id: "LIST" },
        { type: "Folder", id: "TREE" },
        { type: "Document", id: "LIST" },
        { type: "ArchivedDocument", id: "LIST" },
        "ArchiveNav",
      ],
    }),

    // -------------------- Folders --------------------
    createFolder: builder.mutation({
      query: (body) => ({
        url: "/api/folders/",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Folder", id: "LIST" },
        { type: "Folder", id: "TREE" },
        "ArchiveNav",
      ],
    }),

    updateFolder: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/folders/${id}/`,
        method: "PATCH", 
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Folder", id: arg.id },
        { type: "Folder", id: "LIST" },
        { type: "Folder", id: "TREE" },
        "ArchiveNav",
      ],
    }),

    deleteFolder: builder.mutation({
      query: (id) => ({
        url: `/api/folders/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Folder", id },
        { type: "Folder", id: "LIST" },
        { type: "Folder", id: "TREE" },
        "ArchiveNav",
      ],
    }),

    syncFolders: builder.mutation({
      query: () => ({
        url: "/api/folders/sync/",
        method: "POST",
      }),
      invalidatesTags: [
        { type: "Folder", id: "LIST" },
        { type: "Folder", id: "TREE" },
      ],
    }),

    getFolderContent: builder.query({
      query: () => ({
        url: "/api/documents/folder-contents/",
        method: "GET",
      }),
      providesTags: [{ type: "Folder", id: "CONTENTS" }],
    }),

    getFolders: builder.query({
      query: () => ({
        url: "/api/folders/",
        method: "GET",
      }),
      providesTags: [{ type: "Folder", id: "LIST" }],
    }),

    getFoldersTree: builder.query({
      query: () => ({
        url: "/api/folders/tree/",
        method: "GET",
      }),
      providesTags: [{ type: "Folder", id: "TREE" }],
    }),

    // -------------------- Dictionaries --------------------
    
    // Legacy Dictionaries
    getDocumentNature: builder.query({
      query: () => ({
        url: "/api/document-natures/",
        method: "GET",
      }),
      providesTags: [{ type: "DocumentNature", id: "LIST" }],
    }),

    getDocumentCategories: builder.query({
      query: () => ({
        url: "/api/document-categories/",
        method: "GET",
      }),
      providesTags: [{ type: "DocumentCategory", id: "LIST" }],
    }),

    // ✅ SITES (CRUD)
    getSites: builder.query({
      query: () => ({ url: "/api/sites/", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              { type: "Site", id: "LIST" },
              ...(Array.isArray(result) ? result.map(({ id }) => ({ type: "Site", id })) : []),
            ]
          : [{ type: "Site", id: "LIST" }],
    }),

    createSite: builder.mutation({
      query: (body) => ({ url: "/api/sites/", method: "POST", body }),
      invalidatesTags: [{ type: "Site", id: "LIST" }],
    }),

    updateSite: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/api/sites/${id}/`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Site", id },
        { type: "Site", id: "LIST" },
      ],
    }),

    deleteSite: builder.mutation({
      query: (id) => ({ url: `/api/sites/${id}/`, method: "DELETE" }),
      invalidatesTags: [{ type: "Site", id: "LIST" }],
    }),

    // ✅ DOCUMENT CODES (CRUD)
    getDocumentCodes: builder.query({
      query: () => ({ url: "/api/document-codes/", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              { type: "DocumentCode", id: "LIST" },
              ...(Array.isArray(result) ? result.map(({ id }) => ({ type: "DocumentCode", id })) : []),
            ]
          : [{ type: "DocumentCode", id: "LIST" }],
    }),

    createDocumentCode: builder.mutation({
      query: (body) => ({ url: "/api/document-codes/", method: "POST", body }),
      invalidatesTags: [{ type: "DocumentCode", id: "LIST" }],
    }),

    updateDocumentCode: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/api/document-codes/${id}/`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "DocumentCode", id },
        { type: "DocumentCode", id: "LIST" },
      ],
    }),

    deleteDocumentCode: builder.mutation({
      query: (id) => ({ url: `/api/document-codes/${id}/`, method: "DELETE" }),
      invalidatesTags: [{ type: "DocumentCode", id: "LIST" }],
    }),

    // ✅ DOCUMENT TYPES (CRUD)
    getDocumentTypes: builder.query({
      query: () => ({ url: "/api/document-types/", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              { type: "DocumentType", id: "LIST" },
              ...(Array.isArray(result) ? result.map(({ id }) => ({ type: "DocumentType", id })) : []),
            ]
          : [{ type: "DocumentType", id: "LIST" }],
    }),

    createDocumentType: builder.mutation({
      query: (body) => ({ url: "/api/document-types/", method: "POST", body }),
      invalidatesTags: [{ type: "DocumentType", id: "LIST" }],
    }),

    updateDocumentType: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/api/document-types/${id}/`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "DocumentType", id },
        { type: "DocumentType", id: "LIST" },
      ],
    }),

    deleteDocumentType: builder.mutation({
      query: (id) => ({ url: `/api/document-types/${id}/`, method: "DELETE" }),
      invalidatesTags: [{ type: "DocumentType", id: "LIST" }],
    }),
  }),

  overrideExisting: false,
});

export const {
  // Documents
  useGetDocumentsQuery,
  useGetDocumentByIdQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,

  // Archives
  useGetArchivedDocumentsQuery,
  useGetArchiveNavigationQuery,
  useArchiveDocumentMutation,
  useRestoreDocumentMutation,
  useArchiveFolderMutation,
  useRestoreFolderMutation,

  // Folders
  useCreateFolderMutation,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
  useSyncFoldersMutation,
  useGetFolderContentQuery,
  useGetFoldersQuery,
  useGetFoldersTreeQuery,

  // Old Dictionaries
  useGetDocumentNatureQuery,
  useGetDocumentCategoriesQuery,

  // Sites
  useGetSitesQuery,
  useCreateSiteMutation,
  useUpdateSiteMutation,
  useDeleteSiteMutation,

  // ✅ Document Codes (Complete CRUD)
  useGetDocumentCodesQuery,
  useCreateDocumentCodeMutation,
  useUpdateDocumentCodeMutation,
  useDeleteDocumentCodeMutation,
  
  // Document Types
  useGetDocumentTypesQuery,
  useCreateDocumentTypeMutation,
  useUpdateDocumentTypeMutation,
  useDeleteDocumentTypeMutation,
} = documentSlice;
