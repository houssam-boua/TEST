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
  {
    id: "id",
    accessorKey: "id",
    header: "ID",
  },
  {
    id: "groupname",
    accessorKey: "groupname",
    header: "Nom du groupe",
  },
  {
    id: "project",
    header: "Projet",
    accessorKey: "projectName",
  },
  {
    id: "devicesCount",
    header: "Nombre d'appareils",
    cell: ({ row }) => row.original?.devices?.length || 0,
    enableSorting: false,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Date de début",
    cell: ({ row }) => {
      const dateValue = row?.original?.createdAt || row?.createdAt;
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
    id: "sharedWith",
    accessorKey: "sharedWith",
    header: "Accès",
    cell: () => (
      <Share2Icon
        strokeWidth={1.5}
        size={20}
        className="stroke-muted-foreground/50"
      />
    ),
  },
];

const combinedColumns = [
  ...defaultColumns.slice(0, 2),
  ...columns,
  defaultColumns[2],
];

// Mock data matching the columns used in combinedColumns
const initialGroups = [
  {
    id: 1,
    groupname: "Groupe A",
    projectName: "Projet Alpha",
    devices: [{ id: "DA-1" }, { id: "DA-2" }, { id: "DA-3" }],
    createdAt: "2025-09-15T10:00:00Z",
    projetId: 101,
  },
  {
    id: 2,
    groupname: "Groupe B",
    projectName: "Projet Beta",
    devices: [{ id: "DB-1" }],
    createdAt: "2025-08-01T08:30:00Z",
    projetId: 102,
  },
  {
    id: 3,
    groupname: "Groupe C",
    projectName: "Projet Gamma",
    devices: [],
    createdAt: "2025-07-20T14:15:00Z",
    projetId: 103,
  },
  {
    id: 4,
    groupname: "Groupe D",
    projectName: "Projet Delta",
    devices: [{ id: "DD-1" }, { id: "DD-2" }],
    createdAt: "2025-06-10T12:00:00Z",
    projetId: 104,
  },
  {
    id: 5,
    groupname: "Groupe E",
    projectName: "Projet Epsilon",
    devices: [{ id: "DE-1" }, { id: "DE-2" }, { id: "DE-3" }, { id: "DE-4" }],
    createdAt: "2025-05-05T09:45:00Z",
    projetId: 105,
  },
];

const ConsulteDocuments = () => {
  // Example action handlers for row menu
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [favorites, setFavorites] = React.useState({});
  const [groups, setGroups] = React.useState(initialGroups);
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
    try {
      const id = (groups[groups.length - 1]?.id ?? 0) + 1;
      const newItem = {
        id,
        groupname: values?.doc_path || `Document ${id}`,
        projectName: values?.doc_category || "Projet inconnu",
        devices: [],
        createdAt: new Date().toISOString(),
      };
      setGroups((prev) => [...prev, newItem]);
      setCreateOpen(false);
    } catch (err) {
      console.error("Create failed", err);
    }
  };

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
