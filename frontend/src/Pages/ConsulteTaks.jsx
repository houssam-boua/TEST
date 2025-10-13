import React from "react";
import CostumeCardTitle from "../components/collection/costume-card-title";
import CostumeTableHeader from "../components/collection/costume-table-header";
import CollapsibleCard from "../components/collection/collapsible-card";

const ConsulteTaks = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <CostumeCardTitle title="Tâches en cours" />
        <CostumeTableHeader />
        <CollapsibleCard className="border-b-2 border-muted" />
      </div>
    </div>
  );
};

export default ConsulteTaks;
