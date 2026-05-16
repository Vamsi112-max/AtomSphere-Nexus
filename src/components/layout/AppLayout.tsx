"use client";

import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-transparent text-foreground relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] aspect-square bg-primary/20 rounded-full blur-[120px] animate-pulse -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] aspect-square bg-blue-500/10 rounded-full blur-[120px] -z-10" />
      
      <Sidebar className="hidden md:flex" />

      <main className="flex-1 flex flex-col w-full z-0 relative min-h-screen">
        <TopNav />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
