"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { PreferenceSettings } from "@/components/settings/PreferenceSettings";
import { User, Shield, Sliders, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { logout } = useAuth();

  return (
    <div className="pb-10 space-y-6">
      <Breadcrumbs />
      
      <div>
        <h2 className="text-4xl font-black tracking-tight mb-3 text-primary uppercase tracking-widest">
          Account Intelligence
        </h2>
        <p className="text-muted-foreground font-medium max-w-2xl leading-relaxed">
          Manage your enterprise identity, configure security protocols, and personalize your strategic platform experience.
        </p>
      </div>

      <div className="glass-panel rounded-[2rem] border border-black/5 overflow-hidden shadow-sm">
        <Tabs defaultValue="profile" className="flex flex-col md:flex-row h-full min-h-[700px]">
          <div className="md:w-72 border-b md:border-b-0 md:border-r border-black/5 p-8 bg-black/5">
            <TabsList className="flex flex-col w-full h-auto bg-transparent gap-2 p-0">
              <TabsTrigger 
                value="profile" 
                className="w-full justify-start gap-4 px-6 py-4 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-muted-foreground hover:bg-black/5 transition-all rounded-2xl border-none shadow-none font-black text-[10px] uppercase tracking-widest"
              >
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="w-full justify-start gap-4 px-6 py-4 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-muted-foreground hover:bg-black/5 transition-all rounded-2xl border-none shadow-none font-black text-[10px] uppercase tracking-widest"
              >
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="preferences" 
                className="w-full justify-start gap-4 px-6 py-4 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-muted-foreground hover:bg-black/5 transition-all rounded-2xl border-none shadow-none font-black text-[10px] uppercase tracking-widest"
              >
                <Sliders className="h-4 w-4" />
                Preferences
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-8 pt-8 border-t border-black/5">
              <Button 
                variant="ghost" 
                onClick={logout}
                className="w-full justify-start gap-4 px-6 py-4 text-destructive hover:bg-destructive/5 hover:text-destructive rounded-2xl font-black text-[10px] uppercase tracking-widest"
              >
                <LogOut className="h-4 w-4" />
                Terminate Session
              </Button>
            </div>
          </div>

          <div className="flex-1 p-8 sm:p-12 bg-white/20">
            <TabsContent value="profile" className="mt-0 focus-visible:outline-none border-none outline-none">
              <ProfileSettings />
            </TabsContent>
            <TabsContent value="security" className="mt-0 focus-visible:outline-none border-none outline-none">
              <SecuritySettings />
            </TabsContent>
            <TabsContent value="preferences" className="mt-0 focus-visible:outline-none border-none outline-none">
              <PreferenceSettings />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
