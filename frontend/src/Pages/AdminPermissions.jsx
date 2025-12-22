import React from "react";
import CostumeCardTitle from "../components/collection/costume-card-title";
import { DataTable, defaultColumns } from "../components/tables/data-table";
import { useGetPermissionsQuery } from "../Slices/permissionSlice";
import useActionBadge from "../Hooks/useActionBadge";

function ActionBadgeCell({ action }) {
  const badge = useActionBadge({ action });
  return badge;
}
const columns = [
  { id: "id", accessorKey: "id", header: "ID" },
  { id: "name", accessorKey: "name", header: "Title" },
  {
    id: "action",
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => <ActionBadgeCell action={row.original.action} />,
  },
  {
    id: "target",
    accessorKey: "target",
    header: "Target object",
  },
  {
    id: "description",
    accessorKey: "label",
    header: "Description",
  },
];
const AdminPermissions = () => {
  const { data: permissions, refetch } = useGetPermissionsQuery();

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
            data={permissions}
            pageSize={20}
            title={"Permissions"}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPermissions;
