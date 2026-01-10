import React, { useState } from "react";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, MapPin } from "lucide-react";

// Components
import CreateDepartementForm from "../components/forms/create-departement";
import DeleteDepartment from "../components/forms/delete-department";
import EditDepartement from "../components/forms/edit-departement";
import DepartmentBadge from "@/Hooks/useDepartmentBadge";

// Slices
import {
  useGetDepartementsQuery,
  useDeleteDepartementMutation,
  useUpdateDepartementMutation,
  useCreateDepartementMutation,
  useGetSitesQuery, // ✅ Added Sites Query
} from "@/Slices/departementSlice"; // Ensure this slice exports useGetSitesQuery

// --- Columns for Departments ---
const deptColumns = [
  { id: "id", accessorKey: "id", header: "ID" },
  { id: "dep_name", accessorKey: "dep_name", header: "Name" },
  {
    id: "site",
    accessorKey: "site_name", // Assumes serializer sends 'site_name' or nested object
    header: "Site",
    cell: ({ row }) => {
      // Handle both flat 'site_name' or nested 'site_details.name' depending on serializer
      const siteName = row.original.site_name || row.original.site_details?.name || "No Site";
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {siteName}
        </Badge>
      );
    },
  },
  {
    id: "dep_color",
    accessorKey: "dep_color",
    header: "Color",
    cell: ({ row }) => {
      const color = row?.original?.dep_color;
      const name = row?.original?.dep_name;
      return <DepartmentBadge color={color} name={name} />;
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const d = row?.original?.created_at || row?.original?.createdAt;
      if (!d) return "-";
      return new Date(d).toLocaleDateString("fr-FR");
    },
  },
];

// --- Columns for Sites ---
const siteColumns = [
  { id: "id", accessorKey: "id", header: "ID" },
  { id: "name", accessorKey: "name", header: "Site Name" },
  { id: "location", accessorKey: "location", header: "Location" },
];

const AdminDepartements = () => {
  // Queries
  const { data: deps, refetch: refetchDeps } = useGetDepartementsQuery();
  const { data: sites, refetch: refetchSites } = useGetSitesQuery();

  // Mutations
  const [deleteDepartement, { isLoading: deleteLoading }] = useDeleteDepartementMutation();
  const [editDepartement, { isLoading: editLoading }] = useUpdateDepartementMutation();

  // UI State
  const [activeTab, setActiveTab] = useState("departments");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // --- Handlers for Department ---
  const handleEditDept = (dept) => {
    setSelectedItem(dept);
    setEditOpen(true);
  };

  const handleDeleteDept = (dept) => {
    setSelectedItem(dept);
    setDeleteOpen(true);
  };

  const handleConfirmDeleteDept = async (department) => {
    try {
      await deleteDepartement(department.id).unwrap();
      refetchDeps();
      setDeleteOpen(false);
      setSelectedItem(null);
    } catch (err) {
      console.error("Failed to delete department:", err);
    }
  };

  const handleConfirmEditDept = async (values) => {
    try {
      await editDepartement({ id: selectedItem.id, ...values }).unwrap();
      refetchDeps();
      setEditOpen(false);
      setSelectedItem(null);
    } catch (err) {
      console.error("Failed to edit department:", err);
    }
  };

  const handleSuccessCreate = () => {
    refetchDeps();
    refetchSites();
    setCreateOpen(false);
  };

  // --- Row Actions ---
  const deptRowActions = (row) => [
    {
      key: "Edit",
      icon: <Pencil className="w-4 h-4" />,
      label: "Edit",
      onClick: () => handleEditDept(row.original),
    },
    {
      key: "delete",
      icon: <Trash2 className="w-4 h-4" />,
      label: "Delete",
      onClick: () => handleDeleteDept(row.original),
    },
  ];

  // (Optional: Add actions for Sites if you have delete/edit endpoints for them)
  const siteRowActions = (row) => []; 

  return (
    <div className="flex flex-1 flex-col h-full bg-slate-50/50 p-6">
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organization Structure</h1>
          <p className="text-muted-foreground">Manage sites and departments.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="sites">Sites</TabsTrigger>
          </TabsList>
          
          <button 
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            + Create New
          </button>
        </div>

        {/* --- Departments Tab --- */}
        <TabsContent value="departments" className="border rounded-lg bg-white shadow-sm">
          <div className="p-1">
            <DataTable
              columns={[
                ...defaultColumns.slice(0, 2), // Selection + ID placeholder
                ...deptColumns,
                defaultColumns[2], // Actions placeholder
              ]}
              data={deps || []}
              rowActions={deptRowActions}
              pageSize={10}
              title="All Departments"
              searchKey="dep_name" // Search by name
            />
          </div>
        </TabsContent>

        {/* --- Sites Tab --- */}
        <TabsContent value="sites" className="border rounded-lg bg-white shadow-sm">
          <div className="p-1">
            <DataTable
              columns={[
                ...defaultColumns.slice(0, 2),
                ...siteColumns,
                // Add actions column if you implement site actions
                // defaultColumns[2] 
              ]}
              data={sites || []}
              rowActions={siteRowActions}
              pageSize={10}
              title="All Sites"
              searchKey="name" // Search by site name
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* --- Create Dialog (Unified) --- */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Organization Unit</DialogTitle>
            <DialogDescription>
              Add a new Department or Site to your organization.
            </DialogDescription>
          </DialogHeader>
          {/* This form now handles both via its internal tabs */}
          <CreateDepartementForm
            onSuccess={handleSuccessCreate}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* --- Edit Department Dialog --- */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>Update department details.</DialogDescription>
          </DialogHeader>
          <EditDepartement
            department={selectedItem}
            onSubmit={handleConfirmEditDept}
            onCancel={() => setEditOpen(false)}
            loading={editLoading}
          />
        </DialogContent>
      </Dialog>

      {/* --- Delete Department Dialog --- */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure? This will also remove users assigned to this department.
            </DialogDescription>
          </DialogHeader>
          <DeleteDepartment
            department={selectedItem}
            onDelete={handleConfirmDeleteDept}
            onCancel={() => setDeleteOpen(false)}
            loading={deleteLoading}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminDepartements;