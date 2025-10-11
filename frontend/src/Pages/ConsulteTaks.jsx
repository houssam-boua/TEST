import React from "react";
import CollapsibleCard from "../components/blocks/collapsible-card";

const ConsulteTaks = () => {
  return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
          <CollapsibleCard />
        </div>
      </div>
  );
};

export default ConsulteTaks;
