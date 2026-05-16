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
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Security Credentials
        </h3>
        <p className="text-sm text-muted-foreground">
          Maintain the integrity of your account by updating your authentication credentials regularly.
        </p>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-black/20 border-white/10 pl-10 focus-visible:ring-primary/50"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-black/20 border-white/10 pl-10 focus-visible:ring-primary/50"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirm New Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-black/20 border-white/10 pl-10 focus-visible:ring-primary/50"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full sm:w-auto bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
          Update Password
        </Button>
      </form>

      <div className="pt-8 border-t border-white/10 space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Active Sessions</h4>
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <div>
              <p className="text-sm font-medium">Current Device</p>
              <p className="text-[10px] text-muted-foreground uppercase">Last Active: Just Now</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-white">
            Manage Sessions
          </Button>
        </div>
      </div>
    </div>
  );
}
