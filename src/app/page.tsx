"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Activity, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10" />
      
      <header className="w-full p-6 flex justify-between items-center glass-panel sticky top-0 z-50 border-b border-white/5 rounded-none shadow-none">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">AtomQuest</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-muted-foreground">
          <Link href="#features" className="hover:text-primary transition-colors">Strategic Matrix</Link>
          <Link href="#solutions" className="hover:text-primary transition-colors">Core Nodes</Link>
          <Link href="#pricing" className="hover:text-primary transition-colors">Access Tier</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="hover:bg-white/5 text-sm font-bold">Initiate Sync</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-primary text-primary-foreground font-bold shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:bg-primary/90 rounded-xl">
              Register Node
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 pt-24 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-12 shadow-[0_0_20px_rgba(var(--primary),0.1)]">
            <Zap className="h-3 w-3" />
            <span>Autonomous Strategic OS v4.0</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 leading-[1.1]">
            Velocity-Driven <br />
            <span className="text-primary">Strategic Alignment.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed font-medium">
            AtomQuest is the neural layer for organizational performance. 
            Synchronize every goal, audit every action, and visualize organizational velocity in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-lg font-bold h-16 px-12 bg-primary text-primary-foreground shadow-[0_10px_40px_rgba(var(--primary),0.4)] hover:bg-primary/90 rounded-2xl transition-all hover:translate-y-[-4px]">
                Enter Portal
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#demo" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg font-bold h-16 px-12 glass-panel border-white/10 hover:bg-white/5 rounded-2xl">
                System Overview
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="mt-32 w-full max-w-6xl glass-panel aspect-video rounded-[3rem] border border-white/10 relative overflow-hidden flex items-center justify-center bg-black/40 shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
          <div className="flex flex-col items-center gap-6">
            <div className="p-8 bg-primary/10 rounded-full border border-primary/20 animate-pulse">
              <Shield className="h-20 w-20 text-primary" />
            </div>
            <p className="text-sm font-black text-primary uppercase tracking-[0.3em]">Quantum Secure Infrastructure</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
