import React from "react";
import SectionCards from "../components/blocks/section-cards";
import { PermissionGate } from "../Hooks/useHasPermission";
import { ChartPieLegend } from "../components/charts/chart-pie-legend";
import DashboardSectionCards from "../components/blocks/dashboard-section-cards";
import { LayoutDashboard } from "lucide-react";

const AdminAccueil = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* IMPORTANT: this enables @xl/main, @5xl/main ... */}
      <div className="@container/main mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground leading-tight">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Overview of documents, activity, workflows, and analytics.
              </p>
            </div>
          </div>
          <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <div className="space-y-8">
          <PermissionGate required="view_departement">
            <section className="rounded-2xl border border-border bg-white/60 backdrop-blur-xl shadow-sm">
              <div className="p-4 sm:p-6">
                <SectionCards />
              </div>
            </section>
          </PermissionGate>

          <section className="rounded-2xl border border-border bg-white/60 backdrop-blur-xl shadow-sm p-4 sm:p-6">
            <ChartPieLegend />
          </section>

          <section className="rounded-2xl border border-border bg-white/60 backdrop-blur-xl shadow-sm">
            <div className="p-4 sm:p-6">
              <DashboardSectionCards />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminAccueil;
