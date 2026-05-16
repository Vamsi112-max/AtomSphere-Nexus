"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DepartmentKPIs } from "@/components/analytics/DepartmentKPIs";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert } from "lucide-react";

export default function DepartmentKPIsPage() {
  const { role } = useAuth();

  if (role === "employee") {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">Only managers and admins can access department-level KPI intelligence.</p>
      </div>
    );
  }

  return (
    <div className="pb-10 space-y-6">
      <Breadcrumbs />
      
      <div className="mb-8">
        <h2 className="text-4xl font-black tracking-tight text-white mb-2">
          Departmental <span className="text-primary">Intelligence</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Deep dive into organizational performance. Compare team velocity, track shared milestones, and identify strategic bottlenecks.
        </p>
      </div>

      <DepartmentKPIs />
    </div>
  );
}
