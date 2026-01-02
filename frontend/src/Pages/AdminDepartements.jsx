import React from "react";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CreateDepartementForm from "../components/forms/create-departement";
import { useCreateDepartementMutation } from "@/slices/departementSlice";
import {
  useDeleteDepartementMutation,
  useGetDepartementsQuery,
  useUpdateDepartementMutation,
} from "../slices/departementSlice";
import DepartmentBadge from "@/Hooks/useDepartmentBadge";
import { Pencil, Trash2 } from "lucide-react";
import DeleteDepartment from "../components/forms/delete-department";
import EditDepartement from "../components/forms/edit-departement";

const columns = [
  { id: "id", accessorKey: "id", header: "ID" },
  { id: "dep_name", accessorKey: "dep_name", header: "Name" },
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
      const d = row?.original?.createdAt;
      if (!d) return "-";
      return new Date(d).toLocaleDateString("fr-FR");
    },
  },
];

const AdminDepartements = () => {
  const { data: deps, refetch } = useGetDepartementsQuery();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  const [selectedDepartment, setSelectedDepartment] = React.useState(null);
  const [createDepartement] = useCreateDepartementMutation();
  const [deleteDepartement, { isLoading: deleteLoading }] =
    useDeleteDepartementMutation();
  const [editDepartement, { isLoading: editLoading }] =
    useUpdateDepartementMutation();

  const handleAdd = () => {
    setCreateOpen(true);
  };

  const handleCreate = async (departement) => {
    try {
      await createDepartement(departement).unwrap();
      refetch();
      setCreateOpen(false);
    } catch (error) {
      console.error("Failed to create department:", error);
    }
  };

  const handleEdit = (department) => {
    setSelectedDepartment(department);
    setEditOpen(true);
  };

  const handleDelete = (department) => {
    setSelectedDepartment(department);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async (department) => {
    try {
      // API expects id as parameter for delete endpoint
      await deleteDepartement(department.id).unwrap();
      refetch();
      setDeleteOpen(false);
      setSelectedDepartment(null);
    } catch (err) {
      console.error("Failed to delete department:", err);
    }
  };

  const handleConfirmEdit = async (values) => {
    try {
      await editDepartement({ id: selectedDepartment.id, ...values }).unwrap();
      refetch();
      setEditOpen(false);
      setSelectedDepartment(null);
    } catch (err) {
      console.error("Failed to edit department:", err);
    }
  };

  const rowActions = (row) => [
    {
      key: "Edit",
      icon: <Pencil className="w-4 h-4" />,
      label: "Edit",
      onClick: () => handleEdit(row.original),
    },

    {
      key: "delete",
      icon: <Trash2 className="w-4 h-4" />,
      label: "Delete",
      onClick: () => handleDelete(row.original),
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <DataTable
          columns={[
            ...defaultColumns.slice(0, 2),
            ...columns,
            defaultColumns[2],
          ]}
          data={deps}
          onAdd={handleAdd}
          rowActions={rowActions}
          pageSize={20}
          title={"Departements"}
        />

        <Dialog open={createOpen} onOpenChange={(v) => setCreateOpen(v)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a department</DialogTitle>
              <DialogDescription>Add a new department.</DialogDescription>
            </DialogHeader>
            <CreateDepartementForm
              onSubmit={handleCreate}
              onCancel={() => setCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={deleteOpen} onOpenChange={(v) => setDeleteOpen(v)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Department</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this department?
              </DialogDescription>
            </DialogHeader>
            <DeleteDepartment
              department={selectedDepartment}
              onDelete={handleConfirmDelete}
              onCancel={() => setDeleteOpen(false)}
              loading={deleteLoading}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onOpenChange={(v) => setEditOpen(v)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
              <DialogDescription>
                Make changes to the department details.
              </DialogDescription>
            </DialogHeader>
            <EditDepartement
              department={selectedDepartment}
              onSubmit={handleConfirmEdit}
              onCancel={() => setEditOpen(false)}
              loading={editLoading}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDepartements;
