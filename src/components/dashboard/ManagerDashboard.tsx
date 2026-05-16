"use client";

import { motion } from "framer-motion";
import { Users, Target, Activity, AlertTriangle } from "lucide-react";

const metrics = [
  { title: "Team Goal Completion", value: "78%", icon: Target, trend: "+5% from last month", color: "text-blue-500" },
  { title: "Department KPIs", value: "14/18", icon: Activity, trend: "On track", color: "text-green-500" },
  { title: "Active Members", value: "24", icon: Users, trend: "Across 3 teams", color: "text-purple-500" },
  { title: "Escalations", value: "2", icon: AlertTriangle, trend: "Requires immediate attention", color: "text-destructive" },
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

export function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manager Overview</h2>
        <p className="text-muted-foreground">Monitor team performance and department KPIs.</p>
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
          <h3 className="font-semibold mb-4 text-foreground">Team Performance Trends</h3>
          <div className="w-full h-[300px] flex items-center justify-center border border-dashed border-black/10 rounded-lg bg-black/5">
            <span className="text-muted-foreground">Chart Area</span>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 col-span-3 min-h-[400px]">
          <h3 className="font-semibold mb-4 text-foreground">Pending Approvals</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-black/5 pb-4 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">JD</div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe Q3 Goals</p>
                    <p className="text-xs text-muted-foreground">Submitted 1 day ago</p>
                  </div>
                </div>
                <button className="text-xs font-medium text-primary hover:underline">Review</button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
