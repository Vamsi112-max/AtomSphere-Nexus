"use client";

import { useAuth } from "@/context/AuthContext";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { UserTable } from "@/components/users/UserTable";
import { Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UsersPage() {
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
        <h2 className="text-3xl font-black tracking-tight text-primary">User <span className="text-primary/70">Management</span></h2>
        <p className="text-muted-foreground">Manage roles, departments, and access across the Nexus.</p>
      </div>

      <UserTable />
    </div>
  );
}
