"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { EscalationMonitoring } from "@/components/admin/EscalationMonitoring";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert } from "lucide-react";

export default function EscalationsPage() {
  const { role } = useAuth();

  if (role === "employee") {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">Only managers and admins can monitor workflow escalations.</p>
      </div>
    );
  }

  return (
    <div className="pb-10 space-y-6">
      <Breadcrumbs />
      
      <div className="mb-8">
        <h2 className="text-4xl font-black tracking-tight text-white mb-2">
          Workflow <span className="text-destructive">Escalations</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Monitor governance and compliance. Track delayed submissions, overdue approvals, and automated SLA triggers.
        </p>
      </div>

      <EscalationMonitoring />
    </div>
  );
}
