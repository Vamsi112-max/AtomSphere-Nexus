"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SharedGoalsList } from "@/components/goals/SharedGoalsList";

export default function SharedGoalsPage() {
  return (
    <div className="pb-10 space-y-6">
      <Breadcrumbs />
      
      <div>
        <h2 className="text-3xl font-black tracking-tight mb-2 text-primary">
          Shared <span className="text-primary/70">Missions</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          View and adopt high-level goals assigned to your department. Adapting shared goals helps align your performance with the overall company strategy.
        </p>
      </div>

      <SharedGoalsList />
    </div>
  );
}
