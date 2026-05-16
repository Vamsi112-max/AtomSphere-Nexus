"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Save, User } from "lucide-react";
import { toast } from "sonner";
import { logAuditAction } from "@/lib/audit";

export function ProfileSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(user?.user_metadata?.name || "");
  const [photoURL, setPhotoURL] = useState(user?.user_metadata?.avatar_url || "");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await supabase.auth.updateUser({
        data: {
          name: displayName,
          avatar_url: photoURL
        }
      });

      await supabase.from('users').update({
        name: displayName,
        updated_at: new Date().toISOString()
      }).eq('id', user.id);

      await logAuditAction({
        action: 'UPDATE_PROFILE',
        userId: user.id,
        userName: displayName,
        userEmail: user.email || "",
        resourceId: user.id,
        resourceType: 'user_profile',
        after: { displayName, photoURL }
      });

      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-8 max-w-2xl">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <Avatar className="h-32 w-32 border-4 border-primary/20">
            <AvatarImage src={photoURL} />
            <AvatarFallback className="bg-black/40 text-primary">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <h3 className="text-xl font-bold text-white">Profile Identity</h3>
          <p className="text-sm text-muted-foreground">
            Your identity across the Nexus platform. Profile pictures are managed via external URL for this version.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Display Name</label>
          <Input 
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="bg-black/20 border-white/10 focus-visible:ring-primary/50"
            placeholder="Your full name"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avatar URL</label>
          <Input 
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
            className="bg-black/20 border-white/10 focus-visible:ring-primary/50"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Biography</label>
          <Textarea 
            placeholder="Tell us about your role and expertise..."
            className="bg-black/20 border-white/10 resize-none h-32 focus-visible:ring-primary/50"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full sm:w-auto bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:bg-primary/90"
        disabled={loading}
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save Identity Changes
      </Button>
    </form>
  );
}
