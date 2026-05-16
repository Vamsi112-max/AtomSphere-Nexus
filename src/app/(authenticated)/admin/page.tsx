"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ShieldCheck, Users, History, AlertTriangle, Settings, Lock } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const adminModules = [
    { title: "User Management", desc: "Manage roles and access", icon: Users, href: "/users", color: "text-blue-500" },
    { title: "Audit Trail", desc: "System-wide activity logs", icon: History, href: "/admin/audit", color: "text-purple-500" },
    { title: "Escalation Engine", desc: "Monitor overdue tasks", icon: AlertTriangle, href: "/admin/escalations", color: "text-red-500" },
    { title: "Governance", desc: "Policy and compliance", icon: Lock, href: "/governance", color: "text-green-500" },
    { title: "System Settings", desc: "Global platform config", icon: Settings, href: "/settings", color: "text-orange-500" },
  ];

  return (
    <div className="pb-10 space-y-8">
      <Breadcrumbs />
      
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-4xl font-black tracking-tight text-primary">
            Nexus <span className="text-primary/70">Admin Center</span>
          </h2>
          <p className="text-muted-foreground mt-1 font-medium">
            Centralized orchestration of organizational data, security protocols, and system integrity.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminModules.map((module) => (
          <Link key={module.href} href={module.href}>
            <div className="glass-panel p-8 rounded-[2rem] border border-black/5 hover:bg-black/5 transition-all group cursor-pointer h-full">
              <div className={`p-3 rounded-xl bg-black/5 w-fit mb-6 group-hover:scale-110 transition-transform`}>
                <module.icon className={`h-6 w-6 ${module.color}`} />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">{module.title}</h3>
              <p className="text-sm text-muted-foreground font-medium">{module.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
