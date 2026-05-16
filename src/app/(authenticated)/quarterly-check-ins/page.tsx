"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CheckInList } from "@/components/check-ins/CheckInList";

export default function QuarterlyCheckInsPage() {
  return (
    <div className="pb-10 space-y-6">
      <Breadcrumbs />
      
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
          Quarterly Check-ins
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Track progress against approved goals and provide narrative updates for the current performance period.
        </p>
      </div>

      <CheckInList />
    </div>
  );
}
