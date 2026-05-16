"use client";

import { useAuth } from "@/context/AuthContext";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { TeamGoalsList } from "@/components/goals/TeamGoalsList";
import { Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TeamGoalsPage() {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pb-10 space-y-6">
      <Breadcrumbs />
      
      <div>
        <h2 className="text-3xl font-black tracking-tight mb-2 text-primary">
          Team Mission <span className="text-primary/70">Control</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Review, edit, and approve the quarterly performance goals submitted by your direct reports.
        </p>
      </div>

      <TeamGoalsList />
    </div>
  );
}
