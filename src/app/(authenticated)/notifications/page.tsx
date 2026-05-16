"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

export default function NotificationsPage() {
  return (
    <div className="pb-10 space-y-6">
      <Breadcrumbs />
      
      <div className="mb-8">
        <h2 className="text-4xl font-black tracking-tight text-primary mb-2">
          Nexus <span className="text-primary/70">Intelligence</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Stay synchronized with your performance network. Real-time updates on approvals, escalations, and team activities.
        </p>
      </div>

      <NotificationCenter />
    </div>
  );
}
