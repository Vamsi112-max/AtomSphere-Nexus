"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { MyGoalsDashboard } from "@/components/goals/MyGoalsDashboard";

export default function MyGoalsPage() {
  return (
    <div className="pb-10 space-y-6">
      <Breadcrumbs />
      
      <div className="mb-8">
        <h2 className="text-4xl font-black tracking-tight text-primary mb-2">
          My Strategic <span className="text-primary/70">Missions</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl font-medium">
          Orchestrate your personal impact. Monitor progress, manage quarterly targets, and align with organizational velocity.
        </p>
      </div>

      <MyGoalsDashboard />
    </div>
  );
}
