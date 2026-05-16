"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DiscussionBoard } from "@/components/discussions/DiscussionBoard";

export default function DiscussionsPage() {
  return (
    <div className="pb-10 space-y-6">
      <Breadcrumbs />
      
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
          Team Discussions
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Collaborate in real-time. Share goal feedback, team updates, and tag members for instant notifications.
        </p>
      </div>

      <DiscussionBoard />
    </div>
  );
}
