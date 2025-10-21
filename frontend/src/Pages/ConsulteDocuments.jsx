import React from "react";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import {
  Info,
  Lock,
  MessageCircleMore,
  History,
  Download,
  Copy,
  Share2,
  Share2Icon,
  SquareArrowOutUpRight,
  Star,
} from "lucide-react";
import { SheetDemo } from "../components/blocks/sheet";
import { useParams } from "react-router-dom";
import { useGetDocumentsQuery } from "@/Slices/documentSlice";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CreateDocumentForm } from "../components/forms/create-document-form";

const infos = [
  {
    icon: <Info className="text-primary" strokeWidth={1.5} size={16} />,
    title: "Nom du document",
    description: "Document_Exemple.pdf",
  },
  {
    icon: <Info className="text-primary" strokeWidth={1.5} size={16} />,
    title: "Type",
    description: "PDF",
  },
];

const comments = [
  {
    icon: (
      <MessageCircleMore className="text-primary" strokeWidth={1.5} size={16} />
    ),
    title: "John Doe — 2024-09-01",
    description: "Ceci est un commentaire d'exemple.",
  },
  {
    icon: (
      <MessageCircleMore className="text-primary" strokeWidth={1.5} size={16} />
    ),
    title: "Jane Smith — 2024-09-02",
    description: "Un autre commentaire pour démonstration.",
  },
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
const columns = [
  { id: "id", accessorKey: "id", header: "ID" },
  {
    id: "name",
    accessorKey: "file_name",
    header: "Nom",
    cell: ({ row }) => (
      <span className="truncate max-w-xs">
        {row.original?.file_name ||
          row.original?.doc_description ||
          row.original?._path ||
          row.original?.file}
      </span>
    ),
  },
  {
    id: "path",
    accessorKey: "doc_path",
    header: "Chemin",
    cell: ({ row }) => {
      const p =
        row.original?.doc_path || row.original?.file || row.original?.url || "";
      if (!p) return "-";
      return p.startsWith("http") ? (
        <a
          href={p}
          target="_blank"
          rel="noreferrer"
          className="underline text-primary truncate max-w-xs"
        >
          {p}
        </a>
      ) : (
        <span className="truncate max-w-xs">{p}</span>
      );
    },
  },
  { id: "size", accessorKey: "file_size", header: "Taille" },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Téléversé",
    cell: ({ row }) => {
      const dateValue =
        row?.original?.createdAt ||
        row?.original?.uploaded_at ||
        row?.original?.created_at;
      if (!dateValue) return "-";
      const date = new Date(dateValue);
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const p =
            row.original?.doc_path || row.original?.file || row.original?.url;
          if (p) window.open(p, "_blank", "noopener,noreferrer");
        }}
      >
        <Download size={16} />
      </Button>
    ),
  },
];

const combinedColumns = [
  ...defaultColumns.slice(0, 2),
  ...columns,
  defaultColumns[2],
];

const ConsulteDocuments = () => {
  // Example action handlers for row menu
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [favorites, setFavorites] = React.useState({});
  const { folderId } = useParams();
  const queryArg = React.useMemo(
    () => (folderId ? { folder: decodeURIComponent(folderId) } : undefined),
    [folderId]
  );
  const { data: documents = [] } = useGetDocumentsQuery(queryArg);
  const [groups, setGroups] = React.useState([]);
  const [createOpen, setCreateOpen] = React.useState(false);

  const handleDetails = (row) => {
    // set the selected row data and open the sheet
    setSelectedRow(row?.original ?? null);
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

  const handleFavorite = (row) => {
    const id = row?.original?.id;
    if (typeof id === "undefined") return;
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const rowActions = (row) => [
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

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <DataTable
          title={"Documents"}
          columns={combinedColumns}
          data={groups}
          onEdit={() => {}}
          onDelete={() => {}}
          onAdd={handleAdd}
          rowActions={rowActions}
          pageSize={20}
        />{" "}
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
        {/* Controlled Sheet: pass open / onOpenChange and show details from selectedRow */}
        <SheetDemo
          infos={
            selectedRow
              ? [
                  {
                    icon: <Info className="text-primary" />,
                    title: "Nom du document",
                    description: String(
                      selectedRow.groupname ?? selectedRow.id
                    ),
                  },
                ]
              : infos
          }
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
