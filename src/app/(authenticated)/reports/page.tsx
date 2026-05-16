"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ReportingDashboard } from "@/components/reports/ReportingDashboard";

export default function ReportsPage() {
  return (
    <div className="pb-10 space-y-6">
      <Breadcrumbs />
      
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
          Advanced Reports
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Generate, filter, and instantly export comprehensive performance metrics across CSV, Excel, and PDF formats.
        </p>
      </div>

      <ReportingDashboard />
    </div>
  );
}
