"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Loader2, KeyRound, Lock } from "lucide-react";
import { toast } from "sonner";
import { logAuditAction } from "@/lib/audit";

export function SecuritySettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;

      await logAuditAction({
        action: 'CHANGE_PASSWORD',
        userId: user.id,
        userName: user.user_metadata?.name || "User",
        userEmail: user.email,
        resourceId: user.id,
        resourceType: 'user_security'
      });

      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to change password. Ensure current password is correct.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-3">
        <h3 className="text-3xl font-black text-primary flex items-center gap-3 uppercase tracking-widest leading-tight">
          <ShieldCheck className="h-7 w-7 text-primary" />
          Tactical Shield
        </h3>
        <p className="text-xs font-bold text-muted-foreground leading-relaxed">
          Maintain the tactical integrity of your account by updating your authentication credentials regularly.
        </p>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-6">
        <div className="space-y-3">
          <label className="ml-4 text-[10px] font-black text-primary uppercase tracking-[0.2em]">Current Password</label>
          <div className="relative">
            <Lock className="absolute left-5 top-5 h-5 w-5 text-primary/40" />
            <Input 
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="pill-input h-14 pl-14 text-lg"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="ml-4 text-[10px] font-black text-primary uppercase tracking-[0.2em]">New Password</label>
            <div className="relative">
              <KeyRound className="absolute left-5 top-5 h-5 w-5 text-primary/40" />
              <Input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pill-input h-14 pl-14 text-lg"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="ml-4 text-[10px] font-black text-primary uppercase tracking-[0.2em]">Confirm New Password</label>
            <div className="relative">
              <KeyRound className="absolute left-5 top-5 h-5 w-5 text-primary/40" />
              <Input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pill-input h-14 pl-14 text-lg"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="pill-button h-14 px-12"
          disabled={loading}
        >
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Lock className="mr-2 h-5 w-5" />}
          Update Protocol Credentials
        </Button>
      </form>

      <div className="pt-8 border-t border-black/5 space-y-6">
        <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Active Sessions</h4>
        <div className="p-6 rounded-[1.5rem] bg-black/5 border border-black/5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <div>
              <p className="text-sm font-black text-primary">Current Device</p>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Last Active: Just Now</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="rounded-full font-black text-[10px] uppercase tracking-widest text-primary hover:bg-black/5">
            Manage Tactical Access
          </Button>
        </div>
      </div>
    </div>
  );
}
