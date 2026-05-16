"use client";

import { motion } from "framer-motion";
import { Server, Users, ShieldAlert, Activity } from "lucide-react";

const metrics = [
  { title: "Total Users", value: "1,284", icon: Users, trend: "+124 this month", color: "text-blue-500" },
  { title: "System Health", value: "99.9%", icon: Activity, trend: "All services operational", color: "text-green-500" },
  { title: "Server Load", value: "42%", icon: Server, trend: "Normal limits", color: "text-purple-500" },
  { title: "Security Alerts", value: "0", icon: ShieldAlert, trend: "No active threats", color: "text-destructive" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Admin</h2>
        <p className="text-muted-foreground">Global platform metrics and security overview.</p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {metrics.map((metric) => (
          <motion.div key={metric.title} variants={item} className="glass-card p-6 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{metric.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{metric.trend}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6"
      >
        <div className="glass-card rounded-xl p-6 col-span-4 min-h-[400px]">
          <h3 className="font-semibold mb-4 text-foreground">Platform Usage Metrics</h3>
          <div className="w-full h-[300px] flex items-center justify-center border border-dashed border-black/10 rounded-lg bg-black/5">
            <span className="text-muted-foreground">Chart Area</span>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 col-span-3 min-h-[400px]">
          <h3 className="font-semibold mb-4 text-foreground">Recent Audit Logs</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 border-b border-black/5 pb-4 last:border-0">
                <div className="h-8 w-8 rounded-full bg-black/5 flex items-center justify-center text-muted-foreground">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">User roles updated</p>
                  <p className="text-xs text-muted-foreground">Admin changed role for user_1042</p>
                </div>
                <p className="text-xs text-muted-foreground">1h ago</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
