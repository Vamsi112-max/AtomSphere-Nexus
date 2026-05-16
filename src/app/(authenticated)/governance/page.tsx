"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Lock } from "lucide-react";

export default function GovernanceRulesPage() {
  return (
    <div className="pb-10 space-y-6">
      <Breadcrumbs />
      
      <div className="mb-8">
        <h2 className="text-4xl font-black tracking-tight text-white mb-2">
          Governance <span className="text-primary">Rules</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Compliance protocols, policy management, and strategic constraints.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="p-6 bg-primary/10 rounded-full mb-6">
          <Lock className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Protocol Enforcement</h3>
        <p className="text-muted-foreground max-w-md">
          Defining the operational boundaries and compliance standards for all organization nodes.
        </p>
      </div>
    </div>
  );
}
