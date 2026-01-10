import React, { useState, useMemo } from "react";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Forms
import CreateUserForm from "../components/forms/create-user";
import DeleteUser from "../components/forms/delete-user";
import EditUser from "../components/forms/edit-user";

// Badges
import useRoleBadge from "../Hooks/useRoleBage";
import useDepartmentBadge from "../Hooks/useDepartmentBadge";
import { Avatarr } from "../components/blocks/avatarr";

// API Hooks
import { 
  useGetUsersQuery, 
  useCreateUserMutation, 
  useDeleteUserMutation, 
  useUpdateUserMutation 
} from "@/slices/userSlice";
import { useGetRolesQuery } from "@/slices/rolesSlices";
import { useGetDepartementsQuery } from "@/slices/departementSlice";

// --- Badge Helpers ---
function RoleBadge({ role }) {
  const badge = useRoleBadge({ role });
  return <>{badge}</>;
}

function DepartmentBadge({ color, name }) {
  const badge = useDepartmentBadge({ color, name });
  return <>{badge}</>;
}

const AdminUsers = () => {
  // Fetch Data
  const { data: users = [], refetch, isLoading } = useGetUsersQuery();
  const { data: rolesList = [] } = useGetRolesQuery();
  const { data: deptsList = [] } = useGetDepartementsQuery();

  // Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  
  const [formError, setFormError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Mutations
  const [createUser, { isLoading: createLoading }] = useCreateUserMutation();
  const [deleteUser, { isLoading: deleteLoading }] = useDeleteUserMutation();
  const [editUser, { isLoading: editLoading }] = useUpdateUserMutation();

  // --- Helper to resolve Site Name (FIXED) ---
  const getSiteName = (user, deptList) => {
    // 1. Check if user object already has site info (e.g., from Department nested serializer)
    if (user.departement && typeof user.departement === 'object') {
      if (user.departement.site_details?.name) return user.departement.site_details.name;
      // Safety check: verify site is truthy before checking type or properties
      if (user.departement.site && typeof user.departement.site === 'object' && user.departement.site.name) {
        return user.departement.site.name;
      }
      if (user.departement.site_name) return user.departement.site_name;
    }

    // 2. Fallback: Lookup dept ID in deptList
    const deptId = (user.departement && typeof user.departement === 'object') ? user.departement.id : user.departement;
    
    if (!deptId) return "No Site";

    const foundDept = deptList.find(d => String(d.id) === String(deptId));
    if (foundDept) {
        // Handle both nested site object or flat site ID/Name
        // ✅ FIX: Check if foundDept.site exists (is not null) AND is an object
        if (foundDept.site && typeof foundDept.site === 'object' && foundDept.site.name) {
            return foundDept.site.name;
        }
        if (foundDept.site_details?.name) return foundDept.site_details.name;
        if (foundDept.site_name) return foundDept.site_name;
        
        // If site is null/undefined on the department
        if (!foundDept.site) return "No Site";
    }
    return "Unknown Site";
  };

  // --- Columns Definition ---
  const columns = useMemo(() => [
    {
      id: "id",
      accessorKey: "id",
      header: "",
      size: 50,
      cell: ({ row }) => (
        <Avatarr
          fstName={row.original.first_name || row.original.username}
          lstName={row.original.last_name}
        />
      ),
    },
    { id: "username", accessorKey: "username", header: "Username" },
    { id: "email", accessorKey: "email", header: "Email" },
    
    // ✅ Site Column (Safe)
    {
      id: "site",
      header: "Site",
      cell: ({ row }) => {
        const siteName = getSiteName(row.original, deptsList);
        return (
          <Badge variant="outline" className="flex w-fit items-center gap-1 text-xs font-normal text-muted-foreground">
            <MapPin className="h-3 w-3" /> {siteName}
          </Badge>
        );
      },
    },

    {
      id: "role",
      header: "Role",
      cell: ({ row }) => {
        const roleData = row.original.role; 
        let roleDisplayName = "Unknown";

        if (roleData && typeof roleData === 'object' && roleData.role_name) {
          roleDisplayName = roleData.role_name;
        } 
        else if (roleData !== null && roleData !== undefined) {
          const found = rolesList.find(item => String(item.id) === String(roleData));
          if (found) roleDisplayName = found.role_name;
        }

        return <RoleBadge role={roleDisplayName} />;
      },
    },
    {
      id: "departement",
      header: "Department",
      cell: ({ row }) => {
        const deptData = row.original.departement;
        let deptName = "Unknown";
        let deptColor = "#cbd5e1";

        if (deptData && typeof deptData === 'object' && deptData.dep_name) {
          deptName = deptData.dep_name;
          deptColor = deptData.dep_color || deptColor;
        } 
        else if (deptData !== null && deptData !== undefined) {
          const found = deptsList.find(item => String(item.id) === String(deptData));
          if (found) {
            deptName = found.dep_name;
            deptColor = found.dep_color;
          }
        }

        return <DepartmentBadge color={deptColor} name={deptName} />;
      },
    },
    {
      id: "date_joined", 
      header: "Created",
      cell: ({ row }) => {
        const dateVal = row.original.date_joined; 
        return dateVal ? new Date(dateVal).toLocaleDateString("en-GB") : "-";
      },
    },
  ], [rolesList, deptsList]); 

  const combinedColumns = useMemo(() => [
    ...defaultColumns.slice(0, 2),
    ...columns,
    defaultColumns[2],
  ], [columns]);

  // Actions Handlers
  const handleEditConfirm = async (data) => {
    setFormError(null);
    try {
      await editUser({ id: data.id, data }).unwrap();
      refetch();
      setEditOpen(false);
      setSelectedUser(null);
    } catch (error) {
      setFormError(error?.data?.detail || "Failed to update user");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading users...</div>;

  return (
    <div className="flex flex-1 flex-col h-full bg-slate-50/50 p-6">
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage user access, roles, and sites.</p>
        </div>
      </div>

      <DataTable
        columns={combinedColumns}
        data={users}
        onAdd={() => { setFormError(null); setCreateOpen(true); }}
        rowActions={(row) => [
          {
            key: "Edit",
            icon: <Pencil className="w-4 h-4" />,
            label: "Edit",
            onClick: () => { setFormError(null); setSelectedUser(row.original); setEditOpen(true); },
          },
          {
            key: "delete",
            icon: <Trash2 className="w-4 h-4" />,
            label: "Delete",
            onClick: () => { setFormError(null); setSelectedUser(row.original); setDeleteOpen(true); },
          },
        ]}
        pageSize={10}
        title="All Users"
        searchKey="username" // Search by username
      />

      {/* --- Create User Dialog --- */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <CreateUserForm
            onSubmit={async (data) => {
              try {
                await createUser(data).unwrap();
                refetch();
                setCreateOpen(false);
              } catch (e) { 
                setFormError(e?.data?.error || "Failed to create user"); 
              }
            }}
            onCancel={() => setCreateOpen(false)}
            loading={createLoading}
          />
        </DialogContent>
      </Dialog>

      {/* --- Edit User Dialog --- */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <EditUser
              user={selectedUser}
              onSubmit={handleEditConfirm}
              onCancel={() => setEditOpen(false)}
              loading={editLoading}
              error={formError}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* --- Delete User Dialog --- */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <DeleteUser
            user={selectedUser}
            onDelete={async (user) => {
              try {
                await deleteUser(user.id).unwrap();
                refetch();
                setDeleteOpen(false);
              } catch (e) { 
                setFormError("Failed to delete user"); 
              }
            }}
            onCancel={() => setDeleteOpen(false)}
            loading={deleteLoading}
            error={formError}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminUsers;