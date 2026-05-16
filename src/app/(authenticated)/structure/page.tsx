"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Network } from "lucide-react";

export default function TeamStructurePage() {
  return (
    <div className="pb-10 space-y-6">
      <Breadcrumbs />
      
      <div className="mb-8">
        <h2 className="text-4xl font-black tracking-tight text-white mb-2">
          Team <span className="text-primary">Structure</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Hierarchical orchestration and department connectivity matrix.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="p-6 bg-primary/10 rounded-full mb-6">
          <Network className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Neural Connectivity Map</h3>
        <p className="text-muted-foreground max-w-md">
          Visualizing the relationships and reporting lines between all organizational nodes.
        </p>
      </div>
    </div>
  );
}
