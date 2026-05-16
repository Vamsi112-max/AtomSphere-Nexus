"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { TemplateList } from "@/components/templates/TemplateList";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="pb-10 space-y-6">
      <Breadcrumbs />
      
      <div className="mb-8">
        <h2 className="text-4xl font-black tracking-tight text-primary mb-2">
          Mission <span className="text-primary/70">Blueprints</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl font-medium">
          Standardize performance excellence. Create and manage reusable goal blueprints for your department.
        </p>
      </div>

      <TemplateList />
    </div>
  );
}
