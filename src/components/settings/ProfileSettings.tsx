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
      <div className="flex flex-col sm:flex-row items-center gap-8">
        <div className="relative group">
          <Avatar className="h-40 w-40 border-4 border-primary/10 shadow-xl">
            <AvatarImage src={photoURL} />
            <AvatarFallback className="bg-primary/5 text-primary">
              <User className="h-16 w-16" />
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
            <Camera className="h-10 w-10 text-primary" />
          </div>
        </div>
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <h3 className="text-3xl font-black text-primary uppercase tracking-widest leading-tight">Profile Identity</h3>
          <p className="text-xs font-bold text-muted-foreground leading-relaxed">
            Your intelligence identity across the Nexus platform. Profile pictures are managed via tactical external URL for this version.
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        <div className="space-y-3">
          <label className="ml-4 text-[10px] font-black text-primary uppercase tracking-[0.2em]">Display Name</label>
          <Input 
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="pill-input h-14 text-lg"
            placeholder="Your full tactical name"
          />
        </div>

        <div className="space-y-3">
          <label className="ml-4 text-[10px] font-black text-primary uppercase tracking-[0.2em]">Avatar URL</label>
          <Input 
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
            className="pill-input h-14"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        <div className="space-y-3">
          <label className="ml-4 text-[10px] font-black text-primary uppercase tracking-[0.2em]">Biography</label>
          <Textarea 
            placeholder="Tell us about your strategic role and enterprise expertise..."
            className="bg-white border-black/5 resize-none h-40 focus-visible:ring-primary/10 rounded-[1.5rem] p-6 font-bold text-primary placeholder:text-muted-foreground/30 shadow-sm"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="pill-button h-14 px-12"
        disabled={loading}
      >
        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
        Deploy Identity Changes
      </Button>
    </form>
  );
}
