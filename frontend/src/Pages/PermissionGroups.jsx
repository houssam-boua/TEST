import React from "react";
import {
  useCreatePermissionGroupMutation,
  useGetPermissionGroupsQuery,
} from "../Slices/permissionSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import CreatePermissionGroups from "../components/forms/create-permission-groups";

const columns = [
  { id: "id", accessorKey: "id", header: "ID" },
  { id: "name", accessorKey: "name", header: "Title" },
  {
    id: "action",
    accessorKey: "action",
    header: "Action",
  },
  {
    id: "target",
    accessorKey: "target",
    header: "Target",
  },
  {
    id: "description",
    accessorKey: "label",
    header: "Description",
  },
];

const PermissionGroups = () => {
  const [createOpen, setCreateOpen] = React.useState(false);
  const { data: permissiongroups, refetch } = useGetPermissionGroupsQuery();
  const [createpermssiongroup, { createLoading }] =
    useCreatePermissionGroupMutation();

  const handleCreate = () => setCreateOpen(true);

  const handleCreateSubmit = async (values) => {
    try {
      await createpermssiongroup(values).unwrap();
      await refetch();
      setCreateOpen(false);
    } catch (err) {
      console.error("Create role failed", err);
    }
  };
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <DataTable
            columns={[
              ...defaultColumns.slice(0, 2),
              ...columns,
              defaultColumns[2],
            ]}
            data={permissiongroups}
            pageSize={20}
            title={" Permission Groups"}
            onAdd={handleCreate}
          />

          <Dialog open={createOpen} onOpenChange={(v) => setCreateOpen(v)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new group</DialogTitle>
                <DialogDescription>
                  Add a new permission group.
                </DialogDescription>
              </DialogHeader>
              <CreatePermissionGroups
                onSubmit={handleCreateSubmit}
                onCancel={() => setCreateOpen(false)}
                loading={createLoading}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default PermissionGroups;
