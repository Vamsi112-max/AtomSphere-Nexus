import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { MessageSquare, Target, TrendingUp, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function EmployeeDashboard() {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(" ")[0] || "User";

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h2 className="text-3xl font-black text-primary flex items-center gap-3">
            Welcome back, {user?.displayName || "Node"} 👋
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic">Here's what's happening with your goals today.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-black/5 rounded-xl border border-black/5 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </motion.div>

      <AnalyticsDashboard />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel p-8 rounded-[2rem] border border-black/5 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-primary">Upcoming Check-ins</h3>
            <span className="text-xs text-primary font-black uppercase tracking-widest cursor-pointer hover:underline">View All</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-black/5 rounded-2xl border border-black/5 group hover:bg-black/10 transition-all">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">Q3 Check-in</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Oct 01 - Oct 15, 2024</span>
              </div>
              <Button size="sm" className="bg-primary text-white font-black text-[10px] uppercase rounded-xl px-4">Upcoming</Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-black/5 rounded-2xl border border-black/5 group hover:bg-black/10 transition-all">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">Q4 Check-in</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Jan 01 - Jan 15, 2025</span>
              </div>
              <Button size="sm" className="bg-primary text-white font-black text-[10px] uppercase rounded-xl px-4">Upcoming</Button>
            </div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-[2rem] border border-black/5 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-primary">Recent Activities</h3>
            <span className="text-xs text-primary font-black uppercase tracking-widest cursor-pointer hover:underline">View All</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-black/5 rounded-2xl border border-black/5 group hover:bg-black/10 transition-all">
              <div className="p-2 bg-green-500/10 rounded-lg mt-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
              <div className="flex flex-col flex-1">
                <p className="text-sm text-muted-foreground font-medium">Your goal <span className="text-primary font-bold">"Increase Revenue"</span> was approved by <span className="text-primary font-bold">Rahul Mehta</span></p>
                <span className="text-[10px] text-muted-foreground mt-1">2h ago</span>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-black/5 rounded-2xl border border-black/5 group hover:bg-black/10 transition-all">
              <div className="p-2 bg-primary/10 rounded-lg mt-1">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <div className="flex flex-col flex-1">
                <p className="text-sm text-muted-foreground font-medium">You updated <span className="text-primary font-bold">Q2 Achievement</span> for <span className="text-primary font-bold">"Reduce TAT"</span></p>
                <span className="text-[10px] text-muted-foreground mt-1">5h ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
