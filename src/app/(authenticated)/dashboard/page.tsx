"use client";

import { useAuth } from "@/context/AuthContext";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { EmployeeDashboard } from "@/components/dashboard/EmployeeDashboard";
import { ManagerDashboard } from "@/components/dashboard/ManagerDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 opacity-50" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <Skeleton className="lg:col-span-2 h-[400px] rounded-xl" />
        <Skeleton className="lg:col-span-1 h-[400px] rounded-xl" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="pb-10">
        <Breadcrumbs />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="pb-10">
      <Breadcrumbs />
      
      {role === "employee" && <EmployeeDashboard />}
      {role === "manager" && <ManagerDashboard />}
      {role === "admin" && <AdminDashboard />}
      {!role && <EmployeeDashboard />}
    </div>
  );
}
