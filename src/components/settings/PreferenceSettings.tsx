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
      <section className="space-y-8">
        <div className="space-y-3">
          <h3 className="text-3xl font-black text-primary flex items-center gap-3 uppercase tracking-widest leading-tight">
            <Globe className="h-7 w-7 text-primary" />
            Visual Interface
          </h3>
          <p className="text-xs font-bold text-muted-foreground leading-relaxed">
            Customize the tactical visual experience of your Nexus intelligence interface.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {[
            { id: 'light', icon: Sun, label: 'Standard' },
            { id: 'dark', icon: Moon, label: 'Stealth' },
            { id: 'system', icon: Monitor, label: 'Adaptive' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTheme(item.id)}
              className={`p-6 rounded-[1.5rem] border flex flex-col items-center gap-4 transition-all shadow-sm ${
                theme === item.id 
                  ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'border-black/5 bg-black/5 hover:bg-black/10 text-muted-foreground font-bold'
              }`}
            >
              <item.icon className={`h-8 w-8 ${theme === item.id ? 'text-white' : 'text-primary/40'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="space-y-3">
          <h3 className="text-3xl font-black text-primary flex items-center gap-3 uppercase tracking-widest leading-tight">
            <Bell className="h-7 w-7 text-primary" />
            Intelligence Matrix
          </h3>
          <p className="text-xs font-bold text-muted-foreground leading-relaxed">
            Configure how and when you receive strategic updates from the system.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { id: 'email', icon: Mail, label: 'Tactical Email', desc: 'Summary of mission progress and operative mentions.' },
            { id: 'push', icon: Smartphone, label: 'Matrix Push', desc: 'Real-time alerts on your mobile device.' },
            { id: 'inApp', icon: Bell, label: 'Neural Alerts', desc: 'High-visibility badges and tactical toasts.' },
          ].map((item) => (
            <div key={item.id} className="p-6 rounded-[1.5rem] bg-black/5 border border-black/5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-6">
                <div className="p-3 bg-white rounded-full shadow-sm border border-black/5">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-black text-primary">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{item.desc}</p>
                </div>
              </div>
              <Switch 
                checked={notifications[item.id as keyof typeof notifications]} 
                onCheckedChange={() => handleToggle(item.id as keyof typeof notifications)}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
