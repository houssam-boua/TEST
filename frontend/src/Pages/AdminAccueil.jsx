import React from "react";
import SectionCards from "../components/blocks/section-cards";
import { PermissionGate } from "../Hooks/useHasPermission";
import ChartAreaInteractive from "../components/charts/chart-area-interactive";
import TableDemo from "../components/tables/table";
import ChartPieDonutText from "../components/charts/chart-pie-donut-text";
import { ChartPieLegend } from "../components/charts/chart-pie-legend";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import CostumeCardTitle from "../components/collection/costume-card-title";
import DashboardSectionCards from "../components/blocks/dashboard-section-cards";
const AdminAccueil = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <PermissionGate required="view_departement">
            <SectionCards />
          </PermissionGate>
          {/* <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div> */}

          <div className="grid grid-cols-3 grid-rows-1 items-stretch gap-4 px-4 lg:px-6">
            <div className="col-span-2 h-full">
              <Card className="@container/card h-full border-border flex flex-col">
                <CardHeader className="">
                  <CostumeCardTitle title="Recent Documents" />
                </CardHeader>
                <CardContent className="px-4 flex-1">
                  <TableDemo />
                </CardContent>
              </Card>
            </div>
            <div className="col-start-3 h-full [&>[data-slot=card]]:h-full">
              <ChartPieLegend />
            </div>
          </div>
          <DashboardSectionCards />
          {/* <DataTable data={data} /> */}
        </div>
      </div>
    </div>
  );
};

export default AdminAccueil;
