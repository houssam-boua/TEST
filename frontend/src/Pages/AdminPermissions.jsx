import React from "react";
import CostumeCardTitle from "../components/collection/costume-card-title";

const AdminPermissions = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <CostumeCardTitle title="Permissions list" />

        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6"></div>
      </div>
    </div>
  );
};

export default AdminPermissions;
