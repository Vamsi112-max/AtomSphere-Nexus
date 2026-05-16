"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationConfig } from "@/config/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { role, logout } = useAuth();

  if (!role) return <div className={cn("w-64 glass-sidebar h-screen sticky top-0", className)}></div>;

  const allowedNavItems = navigationConfig.filter(item => item.roles.includes(role));
  const mainNavItems = allowedNavItems.filter(item => !item.isBottom);
  const bottomNavItems = allowedNavItems.filter(item => item.isBottom);

  return (
    <aside aria-label="Main Navigation" role="navigation" className={cn("w-72 glass-panel flex flex-col h-[calc(100vh-2rem)] sticky top-4 m-4 z-50 shadow-2xl", className)}>
      <div className="p-8 flex items-center gap-4">
        <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
          <Target className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tight text-primary leading-none">AtomQuest</h2>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Nexus v4.0</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto scrollbar-hide">
        <nav className="space-y-1.5">
          {mainNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className="block group">
                <span
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all",
                    isActive 
                      ? "text-white bg-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-muted-foreground")} />
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 mt-auto border-t border-black/5">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-4 px-4 py-3 text-muted-foreground hover:text-red-500 hover:bg-red-50/50 h-auto font-black uppercase tracking-widest text-[10px] rounded-2xl"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Terminate
        </Button>
      </div>
    </aside>
  );
}
