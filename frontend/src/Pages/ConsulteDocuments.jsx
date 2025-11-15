import React from "react";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import {
  Info,
  Lock,
  MessageCircleMore,
  History,
  Download,
  Copy,
  Folder,
  ChevronRight,
  Share2,
  Share2Icon,
  SquareArrowOutUpRight,
  Star,
  Link,
  FileText,
  Edit,
  Trash,
} from "lucide-react";
import { SheetDemo } from "../components/blocks/sheet";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  useGetDocumentsQuery,
  useDeleteDocumentMutation,
  useGetFolderContentQuery,
} from "@/Slices/documentSlice";
import { Button } from "@/components/ui/button";
import useRelativeTime from "../Hooks/useRelativeTime";
import SharedList from "../components/collection/shared-list.jsx";

function RelativeTime({ date }) {
  const s = useRelativeTime(date);
  return <span className="text-sm text-muted-foreground/70">{s}</span>;
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CreateDocumentForm } from "../components/forms/create-document-form";
import SharedWithDialog from "../components/blocks/shared-with-dialog.jsx";
import DeleteDocument from "../components/forms/delete-document.jsx";
import { DocumentsTable } from "../components/tables/documents-table.jsx";

const comments = [
  // {
  //   icon: (
  //     <MessageCircleMore className="text-primary" strokeWidth={1.5} size={16} />
  //   ),
  //   title: "John Doe — 2024-09-01",
  //   description: "Ceci est un commentaire d'exemple.",
  // },
  // {
  //   icon: (
  //     <MessageCircleMore className="text-primary" strokeWidth={1.5} size={16} />
  //   ),
  //   title: "Jane Smith — 2024-09-02",
  //   description: "Un autre commentaire pour démonstration.",
  // },
];

const versions = [
  {
    icon: <History className="text-primary" strokeWidth={1.5} size={16} />,
    title: "Version 1.0",
    description: "Initial version. (2024-08-01)",
  },
  {
    icon: <History className="text-primary" strokeWidth={1.5} size={16} />,
    title: "Version 1.1",
    description: "Added more details. (2024-08-15)",
  },
  {
    icon: <History className="text-primary" strokeWidth={1.5} size={16} />,
    title: "Version 2.0",
    description: "Major update. (2024-09-01)",
  },
];

const access = [
  {
    icon: <Lock className="text-primary" strokeWidth={1.5} size={16} />,
    title: "Alice",
    description: "Read",
  },
  {
    icon: <Lock className="text-primary" strokeWidth={1.5} size={16} />,
    title: "Bob",
    description: "Write",
  },
  {
    icon: <Lock className="text-primary" strokeWidth={1.5} size={16} />,
    title: "Charlie",
    description: "Admin",
  },
];

const users = [
  { username: "jdoe", fullName: "John Doe" },
  { username: "jsmith", fullName: "Jane Smith" },
  { username: "bwilliams", fullName: "Bob Williams" },
];

const columns = [
  { id: "id", accessorKey: "id", header: "ID" },
  {
    id: "name",
    accessorKey: "file_name",
    header: "Nom",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original?.isFolder ? (
          <Folder
            strokeWidth={1.5}
            size={16}
            className="fill-primary stroke-none"
          />
        ) : (
          <FileText
            strokeWidth={1.5}
            size={16}
            className="fill-primary stroke-white"
          />
        )}
        <span>{row.original?.doc_title}</span>
      </div>
    ),
  },

  { id: "size", accessorKey: "file_size", header: "Taille" },
  {
    id: "sharedWith",
    accessorKey: "sharedWith",
    header: "Shared With",
    cell: () => <SharedWithDialog users={users} />,
  },
  {
    id: "doc_modification_date",
    accessorKey: "doc_modification_date",
    header: "Modified",
    cell: ({ row }) => {
      const d =
        row.original?.doc_modification_date ||
        row.original?.updated_at ||
        row.original?.createdAt ||
        row.original?.created_at;
      return <RelativeTime date={d} />;
    },
  },
];

const combinedColumns = [
  ...defaultColumns.slice(0, 2),
  ...columns,
  defaultColumns[2],
];

const ConsulteDocuments = () => {
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const [selectedRow, setSelectedRow] = React.useState(null);
  const [favorites, setFavorites] = React.useState({});
  const { folderId } = useParams();
  const queryArg = React.useMemo(
    () => (folderId ? { folder: decodeURIComponent(folderId) } : undefined),
    [folderId]
  );
  const { data: documents = [] } = useGetDocumentsQuery(queryArg);
  const { data: folderData } = useGetFolderContentQuery();
  const [groups, setGroups] = React.useState([]);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [DeleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleOpenFolder = React.useCallback(
    (row) => {
      const item = row?.original ?? row?.data ?? row ?? null;
      const path = item?.doc_path || item?.path || null;
      if (!path) return;
      // navigate to a route that lists that folder; encode the folder path
      navigate(`/documents/${encodeURIComponent(path)}`);
    },
    [navigate]
  );
  const handleDetails = (row) => {
    // set the selected row data and open the sheet
    // Some table implementations pass either the table row wrapper or the raw item.
    // Normalize here so the sheet always receives the document object.
    const item = row?.original ?? row?.data ?? row ?? null;
    setSelectedRow(item);
    setSheetOpen(true);
  };

  const handleDownload = (row) => {
    console.log("Download", row.original);
    // implement download logic here
  };

  const handleDuplicate = (row) => {
    console.log("Duplicate", row.original);
    // implement duplication logic here
  };

  const handleShare = (row) => {
    console.log("Share", row.original);
    // implement share logic here
  };

  const [deleteDocument] = useDeleteDocumentMutation();

  const handleDelete = async (doc) => {
    // accept either the document object, a row wrapper, or an id
    const id = doc?.id ?? doc?.original?.id ?? doc?.data?.id ?? doc;
    if (!id) return;
    try {
      setDeleteLoading(true);
      await deleteDocument(id).unwrap();
      // optimistic UI update: remove from local groups and close sheet if open
      setGroups((prev) => prev.filter((g) => g?.id !== id));
      if (selectedRow?.id === id) {
        setSelectedRow(null);
        setSheetOpen(false);
      }
      setDeleteOpen(false);
      console.log(`Document ${id} deleted`);
    } catch (err) {
      console.error("Failed to delete document", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFavorite = (row) => {
    const id = row?.original?.id;
    if (typeof id === "undefined") return;
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const rowActions = (row) => [
    // For folder rows, show a dedicated Open action first
    ...(row?.original?.isFolder
      ? [
          {
            key: "open",
            icon: <ChevronRight className="w-4 h-4" />,
            label: "Open",
            onClick: () => handleOpenFolder(row),
          },
        ]
      : []),
    {
      key: "details",
      icon: <Info className="w-4 h-4" />,
      label: "Details",
      onClick: () => handleDetails(row),
    },
    {
      key: "favorite",
      icon: favorites[row?.original?.id] ? (
        <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
      ) : (
        <Star className="w-4 h-4" />
      ),
      label: favorites[row?.original?.id] ? "Unfavorite" : "Favorite",
      onClick: () => handleFavorite(row),
    },
    {
      key: "edit",
      icon: <Edit className="w-4 h-4" />,
      label: "Edit",
      onClick: () => console.warn("edit action not implemented", row),
    },
    {
      key: "download",
      icon: <Download className="w-4 h-4" />,
      label: "Download",
      onClick: () => handleDownload(row),
    },
    {
      key: "duplicate",
      icon: <Copy className="w-4 h-4" />,
      label: "Duplicate",
      onClick: () => handleDuplicate(row),
    },
    {
      key: "move",
      icon: <SquareArrowOutUpRight className="w-4 h-4" />,
      label: "Move",
      onClick: () => handleShare(row),
    },
    {
      key: "delete",
      icon: <Trash className="w-4 h-4" />,
      label: "Delete",
      onClick: () => {
        const item = row?.original ?? row?.data ?? row ?? null;
        setSelectedRow(item);
        setDeleteOpen(true);
      },
    },
  ];

  const handleAdd = () => setCreateOpen(true);

  const handleCreate = async (formData, values) => {
    // fallback client-side addition for UI demo; server will return new documents on refetch
    try {
      const id = (groups[groups.length - 1]?.id ?? 0) + 1;
      const newItem = {
        id,
        file_name: values?.doc_path || `Document ${id}`,
        doc_path: values?.doc_path || "",
        file_size: formData?.get("file")?.size || null,
        createdAt: new Date().toISOString(),
      };
      setGroups((prev) => [...prev, newItem]);
      setCreateOpen(false);
    } catch (err) {
      console.error("Create failed", err);
    }
  };

  React.useEffect(() => {
    // sync fetched documents into the table state, but avoid setting state
    // if the list didn't actually change to prevent render loops
    const prev = (ConsulteDocuments._prevDocsRef =
      ConsulteDocuments._prevDocsRef || { current: null });
    const prevDocs = prev.current;
    const nextDocs = documents || [];
    let changed = false;
    if (prevDocs === nextDocs) changed = false;
    else if (!prevDocs || prevDocs.length !== nextDocs.length) changed = true;
    else {
      for (let i = 0; i < nextDocs.length; i++) {
        if (nextDocs[i]?.id !== prevDocs[i]?.id) {
          changed = true;
          break;
        }
      }
    }
    if (changed) {
      setGroups(nextDocs);
      prev.current = nextDocs;
    }
  }, [documents]);

  // Build folder rows from folder-contents API for display in the table
  const folderRows = React.useMemo(() => {
    const fs = folderData?.folders || [];
    return fs.map((f) => ({
      id: `folder-${f.path}`,
      doc_title: f.name,
      doc_path: f.path,
      file_size: f.size,
      isFolder: true,
      folder_count: f.count,
    }));
  }, [folderData]);

  // Combine folders first, then document rows
  const tableRows = React.useMemo(() => {
    return [...folderRows, ...(groups || [])];
  }, [folderRows, groups]);

  // Add an inline 'Open' column for folder rows (not part of the three-dots actions)
  const tableColumns = React.useMemo(() => {
    const openCol = {
      id: "open",
      header: "",
      cell: ({ row }) => {
        if (!row?.original?.isFolder) return null;
        const idOrPath = row.original?.doc_path || row.original?.id;
        return (
          <RouterLink
            to={`/a/consulter/${encodeURIComponent(idOrPath)}/`}
            className="text-primary-"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" className="w-6 h-6">
              <ChevronRight
                strokeWidth={1.5}
                size={20}
                className="stroke-muted-foreground/50"
              />
            </Button>
          </RouterLink>
        );
      },
    };

    // Insert the open column after the first two default columns
    return [
      ...combinedColumns.slice(0, 2),
      openCol,
      ...combinedColumns.slice(2),
    ];
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <DocumentsTable
          title={"Documents"}
          columns={tableColumns}
          data={tableRows}
          onEdit={() => {}}
          onDelete={() => {}}
          onAdd={handleAdd}
          rowActions={rowActions}
          pageSize={20}
        />
        {/* Shared Users Dialog */}
        <Dialog>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Shared Users</DialogTitle>
              <DialogDescription>
                Liste des utilisateurs ayant accès à ce document.
              </DialogDescription>
            </DialogHeader>
            <SharedList users={users} />
          </DialogContent>
        </Dialog>
        {/* Create Document Dialog (controlled) */}
        <Dialog open={createOpen} onOpenChange={(v) => setCreateOpen(v)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un document</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour ajouter un nouveau document.
              </DialogDescription>
            </DialogHeader>
            <CreateDocumentForm onCreate={handleCreate} />
          </DialogContent>
        </Dialog>

        <Dialog open={DeleteOpen} onOpenChange={(v) => setDeleteOpen(v)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer un document</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer ce document ?
              </DialogDescription>
            </DialogHeader>
            <DeleteDocument
              document={selectedRow}
              onDelete={handleDelete}
              onCancel={() => setDeleteOpen(false)}
              loading={deleteLoading}
            />
          </DialogContent>
        </Dialog>
        {/* Controlled Sheet: pass open / onOpenChange and show details from selectedRow */}
        <SheetDemo
          infos={selectedRow ? [selectedRow] : []}
          comments={comments}
          versions={versions}
          access={access}
          open={sheetOpen}
          onOpenChange={(v) => setSheetOpen(v)}
        />
      </div>
    </div>
  );
};

export default ConsulteDocuments;
