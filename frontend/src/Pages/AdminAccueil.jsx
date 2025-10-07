import React from "react";
import SectionCards from "../components/blocks/section-cards";
import ChartAreaInteractive from "../components/charts/chart-area-interactive";
import TableDemo from "../components/tables/table";
import ChartPieDonutText from "../components/charts/chart-pie-donut-text";
import { ChartPieLegend } from "../components/charts/chart-pie-legend";
const AdminAccueil = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          {/* <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div> */}

          <div className="grid grid-cols-3 grid-rows-1 gap-4 px-4 lg:px-6">
            <div className="col-span-2">
              <TableDemo />
            </div>
            <div className="col-start-3">
              <ChartPieLegend />
            </div>
          </div>
          {/* <DataTable data={data} /> */}
        </div>
      </div>
    </div>
  );
};

export default AdminAccueil;
