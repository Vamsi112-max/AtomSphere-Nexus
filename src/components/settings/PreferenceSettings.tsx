"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Monitor, Bell, Mail, Smartphone, Globe } from "lucide-react";
import { toast } from "sonner";

export function PreferenceSettings() {
  const [theme, setTheme] = useState("dark");
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    inApp: true,
    marketing: false
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success("Preference updated");
  };

  return (
    <div className="space-y-12 max-w-2xl">
      <section className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Appearance & Theme
          </h3>
          <p className="text-sm text-muted-foreground">
            Customize the visual experience of your Nexus interface.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'light', icon: Sun, label: 'Light' },
            { id: 'dark', icon: Moon, label: 'Dark' },
            { id: 'system', icon: Monitor, label: 'System' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTheme(item.id)}
              className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                theme === item.id 
                  ? 'border-primary bg-primary/10 ring-1 ring-primary' 
                  : 'border-white/10 bg-black/40 hover:bg-white/5 text-muted-foreground'
              }`}
            >
              <item.icon className={`h-6 w-6 ${theme === item.id ? 'text-primary' : ''}`} />
              <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Matrix
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure how and when you receive updates from the system.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { id: 'email', icon: Mail, label: 'Email Notifications', desc: 'Summary of goal progress and mentions.' },
            { id: 'push', icon: Smartphone, label: 'Push Notifications', desc: 'Real-time alerts on your mobile device.' },
            { id: 'inApp', icon: Bell, label: 'In-App Alerts', desc: 'Red badges and toast notifications.' },
          ].map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/5 rounded-lg">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <Switch 
                checked={notifications[item.id as keyof typeof notifications]} 
                onCheckedChange={() => handleToggle(item.id as keyof typeof notifications)}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
