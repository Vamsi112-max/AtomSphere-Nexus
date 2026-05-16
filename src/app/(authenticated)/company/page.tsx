"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Briefcase } from "lucide-react";

export default function CompanyProfilePage() {
  return (
    <div className="pb-10 space-y-6">
      <Breadcrumbs />
      
      <div className="mb-8">
        <h2 className="text-4xl font-black tracking-tight text-white mb-2">
          Company <span className="text-primary">Profile</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Corporate identity, organizational values, and primary strategic thrust areas.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="p-6 bg-primary/10 rounded-full mb-6">
          <Briefcase className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Organization Node Alpha</h3>
        <p className="text-muted-foreground max-w-md">
          The central hub for all corporate data and high-level strategic alignment metrics.
        </p>
      </div>
    </div>
  );
}
