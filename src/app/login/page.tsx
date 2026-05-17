"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginSchema } from "@/lib/validations/auth";
import { motion } from "framer-motion";
import Link from "next/link";
import { Activity, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) throw error;
      toast.success("Successfully logged in!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl glass-panel p-12 md:p-16 flex flex-col items-center text-center shadow-[0_50px_100px_rgba(0,0,0,0.05)]"
      >
        <h1 className="text-4xl font-black text-primary uppercase tracking-[0.3em] mb-12">Login</h1>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
          <div className="space-y-6 text-left">
            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-6">Email address</label>
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full h-14 px-8 rounded-full bg-white/60 border border-white/80 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-foreground"
                {...form.register("email")}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-6 mr-6">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Password</label>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full h-14 px-8 rounded-full bg-white/60 border border-white/80 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-foreground"
                {...form.register("password")}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
              <input type="checkbox" className="rounded-sm border-white/50 bg-white/50" />
              Remember me
            </label>
            <Link href="#" className="hover:text-primary transition-colors">Forgot password?</Link>
          </div>

          <Button type="submit" className="w-full h-16 rounded-full bg-primary text-white font-black uppercase tracking-[0.2em] text-lg shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Sign In"}
          </Button>
        </form>

        <div className="relative w-full my-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/5" />
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="bg-transparent px-4 text-muted-foreground">Or sync with</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          type="button" 
          className="w-full h-14 rounded-full border-white/80 bg-white/40 hover:bg-white/60 text-foreground font-bold transition-all flex items-center justify-center gap-3"
          onClick={loginWithGoogle}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google Cloud Sync
        </Button>

        <div className="mt-12 w-full glass-panel p-8 rounded-[2rem] border border-black/5 bg-white/20">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6">Tactical Access Matrix</p>
          <div className="grid grid-cols-1 gap-4 text-left">
            <div className="p-4 bg-white/40 rounded-2xl border border-white/60">
              <p className="text-[8px] font-black text-primary/60 uppercase tracking-widest mb-1">Administrator</p>
              <p className="text-xs font-bold text-primary">admin@atomsphere.com / admin123</p>
            </div>
            <div className="p-4 bg-white/40 rounded-2xl border border-white/60">
              <p className="text-[8px] font-black text-primary/60 uppercase tracking-widest mb-1">Manager</p>
              <p className="text-xs font-bold text-primary">manager@atomsphere.com / manager123</p>
            </div>
            <div className="p-4 bg-white/40 rounded-2xl border border-white/60">
              <p className="text-[8px] font-black text-primary/60 uppercase tracking-widest mb-1">Employee</p>
              <p className="text-xs font-bold text-primary">employee@atomsphere.com / employee123</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
