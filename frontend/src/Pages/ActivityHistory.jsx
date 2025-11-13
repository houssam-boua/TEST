import React from "react";
import { ChartBarInteractive } from "../components/charts/chart-bar-interactive";
import { HistoryDataTable } from "../components/tables/history-data-table";
import data from "./data.json";
import CostumeCardTitle from "../components/collection/costume-card-title";
const ActivityHistory = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <CostumeCardTitle title="Activity History" />

        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <ChartBarInteractive />
          </div>
          <HistoryDataTable data={data} />
        </div>
      </div>
    </div>
  );
};

export default ActivityHistory;
