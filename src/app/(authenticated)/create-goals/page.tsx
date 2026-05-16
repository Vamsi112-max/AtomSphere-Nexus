"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { GoalForm } from "@/components/goals/GoalForm";

export default function CreateGoalsPage() {
  return (
    <div className="pb-20 space-y-6 relative">
      <Breadcrumbs />
      
      <div>
        <h2 className="text-3xl font-black tracking-tight mb-2 text-primary">
          Strategic <span className="text-primary/70">Initiatives</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Define your objectives for the current quarter. You must create at least one goal, 
          up to a maximum of 8. The total weightage of all goals must equal exactly 100%.
        </p>
      </div>

      <GoalForm />
    </div>
  );
}
