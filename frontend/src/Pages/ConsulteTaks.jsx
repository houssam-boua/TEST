import React from "react";
import CollapsibleCard from "../components/blocks/collapsible-card";
import CostumeCardTitle from "../components/collection/costume-card-title";

const ConsulteTaks = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <CostumeCardTitle title="Tâches en cours" />
        <CollapsibleCard />
      </div>
    </div>
  );
};

export default ConsulteTaks;
