"use client";

import { Bell, Menu, Search, User as UserIcon, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export function TopNav({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className={cn("h-16 glass-panel flex items-center justify-between px-8 sticky top-4 m-4 z-40 shadow-lg border-black/5", className)}>
      <div className="flex items-center gap-6 flex-1">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={
            <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-primary rounded-full">
              <Menu className="h-6 w-6" />
            </Button>
          } />
          <SheetContent side="left" className="p-0 w-64 border-none glass-panel m-4 h-[calc(100vh-2rem)]">
            <Sidebar className="w-full border-none shadow-none m-0 h-full" />
          </SheetContent>
        </Sheet>

        <div className="relative w-full max-w-md group hidden sm:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input 
            placeholder="Search Strategic Intelligence..." 
            className="w-full bg-black/5 border-black/5 pl-11 h-10 rounded-full focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-sm font-black text-primary placeholder:text-muted-foreground/40"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full">
          <Settings className="h-5 w-5" />
        </Button>
        <div className="h-8 w-[1px] bg-black/5 mx-2" />
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-primary uppercase tracking-widest">{user?.email?.split('@')[0] || 'User'}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Authorized Participant</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 border border-black/5 shadow-sm flex items-center justify-center text-primary font-black">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
