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
        <h2 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
          Account Settings
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Manage your enterprise identity, configure security protocols, and personalize your platform experience.
        </p>
      </div>

      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        <Tabs defaultValue="profile" className="flex flex-col md:flex-row h-full min-h-[600px]">
          <div className="md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-4 bg-black/40">
            <TabsList className="flex flex-col w-full h-auto bg-transparent gap-2 p-0">
              <TabsTrigger 
                value="profile" 
                className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground hover:bg-white/5 transition-all rounded-xl border-none shadow-none"
              >
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground hover:bg-white/5 transition-all rounded-xl border-none shadow-none"
              >
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="preferences" 
                className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground hover:bg-white/5 transition-all rounded-xl border-none shadow-none"
              >
                <Sliders className="h-4 w-4" />
                Preferences
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-8 pt-8 border-t border-white/10">
              <Button 
                variant="ghost" 
                onClick={logout}
                className="w-full justify-start gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl"
              >
                <LogOut className="h-4 w-4" />
                Logout Account
              </Button>
            </div>
          </div>

          <div className="flex-1 p-6 sm:p-10 bg-black/20">
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
