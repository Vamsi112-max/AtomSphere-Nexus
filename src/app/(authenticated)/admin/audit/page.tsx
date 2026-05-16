"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AuditLogTable } from "@/components/admin/AuditLogTable";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { redirect } from "next/navigation";

export default function AuditPage() {
  return (
    <div className="pb-10 space-y-6">
      <Breadcrumbs />
      
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-500/10 rounded-xl">
          <ShieldAlert className="h-8 w-8 text-red-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
            System Audit Trail
          </h2>
          <p className="text-muted-foreground">
            Monitor and track all critical actions, data mutations, and administrative changes across the platform.
          </p>
        </div>
      </div>

      <AuditLogTable />
    </div>
  );
}
