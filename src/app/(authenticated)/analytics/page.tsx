"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export default function AnalyticsPage() {
  return (
    <div className="pb-10 space-y-6">
      <Breadcrumbs />
      
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
          Analytics & Performance
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Real-time organizational insights and progress visualizations driven by our automated calculation engine.
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  );
}
