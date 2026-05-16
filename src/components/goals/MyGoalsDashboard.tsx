"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  Plus,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { calculateProgress } from "@/lib/progress";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { CheckInFormDialog } from "@/components/check-ins/CheckInFormDialog";

export function MyGoalsDashboard() {
  const { user } = useAuth();
  const currentQuarter = `Q${Math.floor((new Date().getMonth() + 3) / 3)}`;
  
  const [goals, setGoals] = useState<any[]>([
    { id: 'd1', title: 'Enterprise AI Strategy', description: 'Deploy unified AI orchestration across all business units.', uom: '%', targetValue: 100, weightage: 30, status: 'approved', quarter: currentQuarter, thrustArea: 'Innovation' },
    { id: 'd2', title: 'Global Revenue Peak', description: 'Achieve record-breaking Q3 revenue targets through strategic expansion.', uom: '$M', targetValue: 25, weightage: 40, status: 'approved', quarter: currentQuarter, thrustArea: 'Financial' },
    { id: 'd3', title: 'Customer Experience Alpha', description: 'Implement real-time feedback loop with NPS target of 95+.', uom: 'NPS', targetValue: 95, weightage: 20, status: 'pending', quarter: currentQuarter, thrustArea: 'Customer' },
    { id: 'd4', title: 'Talent Density Index', description: 'Increase specialized talent hiring by 20% in core engineering.', uom: '%', targetValue: 20, weightage: 10, status: 'approved', quarter: currentQuarter, thrustArea: 'Operational' }
  ]);
  const [updates, setUpdates] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [selectedGoalForCheckIn, setSelectedGoalForCheckIn] = useState<any | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);


  useEffect(() => {
    if (!user) return;

    const fetchGoals = async () => {
      try {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('employee_id', user.id);
        
        if (error) throw error;

        if (data && data.length > 0) {
          setGoals(data.map(d => ({
            id: d.id,
            userId: d.employee_id,
            title: d.title,
            description: d.description,
            uom: d.uom,
            targetValue: d.target,
            weightage: d.weightage,
            status: d.status,
            quarter: d.quarter,
            thrustArea: d.thrust_area || "Growth"
          })));
        }
      } catch (error) {
        console.warn("Using local performance cache");
      } finally {
        setLoading(false);
      }
    };

    const fetchUpdates = async () => {
      try {
        const { data, error } = await supabase
          .from('goal_updates')
          .select('*, goals!inner(employee_id)')
          .eq('goals.employee_id', user.id)
          .eq('quarter', currentQuarter);
          
        if (error) throw error;

        if (data) {
          const map: Record<string, any> = {};
          data.forEach(update => {
            map[update.goal_id] = {
              id: update.id,
              goalId: update.goal_id,
              quarter: update.quarter,
              actualValue: update.achievement,
              status: update.status,
              managerComment: update.manager_comment
            };
          });
          setUpdates(map);
        }
      } catch (error) {
        console.error("Error fetching updates:", error);
      }
    };

    fetchGoals();
    fetchUpdates();

    const goalsChannel = supabase
      .channel('public:goals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals', filter: `employee_id=eq.${user.id}` }, () => {
        fetchGoals();
      })
      .subscribe();

    const updatesChannel = supabase
      .channel('public:goal_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goal_updates' }, () => {
        fetchUpdates();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(goalsChannel);
      supabase.removeChannel(updatesChannel);
    };
  }, [user, currentQuarter]);

  if (loading) return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );

  const approvedGoals = goals?.filter(g => g?.status === 'approved' || g?.status === 'approved_modified') || [];
  const pendingGoals = goals?.filter(g => g?.status === 'pending') || [];
  
  const totalWeight = approvedGoals.reduce((sum, g) => sum + (g.weightage || 0), 0);
  const weightedProgress = approvedGoals.reduce((sum, g) => {
    const update = updates[g.id];
    const progress = calculateProgress(update?.actualValue || 0, g.targetValue, 'numeric', 0);
    return sum + (progress * (g.weightage || 0));
  }, 0);

  const overallProgress = totalWeight > 0 ? Math.round(weightedProgress / totalWeight) : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 soft-card relative overflow-hidden"
        >
          <div className="relative z-10">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Performance Sync</p>
            <h2 className="text-4xl font-black text-foreground mb-6">Overall Velocity</h2>
            
            <div className="flex items-end gap-4 mb-8">
              <span className="text-7xl font-black text-primary">{overallProgress}%</span>
              <div className="flex items-center text-green-500 font-bold mb-3 gap-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">+12.5% vs Last Month</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>Weighted Progress</span>
                <span>{overallProgress}% / 100%</span>
              </div>
              <div className="h-4 w-full bg-black/5 rounded-full overflow-hidden p-1 border border-black/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary/50 via-primary to-blue-400 rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-rows-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="soft-card flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-orange-500/10 rounded-2xl shadow-sm">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <span className="text-3xl font-black text-primary">{pendingGoals.length}</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Awaiting Verification</p>
              <p className="text-lg font-black text-primary">Pending Missions</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="soft-card flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-green-500/10 rounded-2xl shadow-sm">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <span className="text-3xl font-black text-primary">{approvedGoals.length}</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Operational Sync</p>
              <p className="text-lg font-black text-primary">Active Missions</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="soft-card space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Plus className="h-4 w-4 text-muted-foreground rotate-45" />
            </div>
            <input 
              type="text" 
              placeholder="Search Strategic Goals..." 
              className="w-full bg-black/5 border border-black/10 rounded-full h-12 pl-12 pr-4 text-sm focus:ring-4 focus:ring-primary/5 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-none h-12 rounded-full border-black/10 bg-white/40 hover:bg-white/60">Filter</Button>
            <Button variant="outline" className="flex-1 md:flex-none h-12 rounded-full border-black/10 bg-white/40 hover:bg-white/60">Export</Button>
            <Link href="/create-goals" className="flex-1 md:flex-none">
              <Button className="w-full h-12 pill-button">
                <Plus className="h-4 w-4 mr-2" />
                Create New Goal
              </Button>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-black/5 bg-white/20">
          <table className="w-full text-left">
            <thead className="bg-black/5 border-b border-black/5">
              <tr>
                <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Goal Title</th>
                <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Thrust Area</th>
                <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Unit</th>
                <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Target</th>
                <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Weight</th>
                <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Progress</th>
                <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              <AnimatePresence>
                {[...approvedGoals, ...pendingGoals].sort((a, b) => b.weightage - a.weightage).map((goal, index) => {
                  const update = updates[goal.id];
                  const progress = calculateProgress(update?.actualValue || 0, goal.targetValue, 'numeric', 0);
                  const isPending = goal.status === 'pending';
                  
                  return (
                    <motion.tr
                      key={goal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-black/5 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-black text-primary text-sm">{goal.title}</span>
                          <span className="text-[10px] text-muted-foreground font-medium mt-0.5">{goal.description?.substring(0, 40)}...</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-primary/5 text-primary text-[10px] font-black rounded-lg uppercase tracking-wider border border-primary/5">{goal.thrustArea || "Growth"}</span>
                      </td>
                      <td className="p-4 text-center font-black text-muted-foreground text-sm">{goal.uom || "%"}</td>
                      <td className="p-4 text-center font-black text-primary text-sm">{goal.targetValue}</td>
                      <td className="p-4 text-center font-black text-primary text-sm">{goal.weightage}%</td>
                      <td className="p-4 min-w-[150px]">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between text-[10px] font-black text-muted-foreground">
                            <span>{isPending ? '0%' : `${progress}%`}</span>
                          </div>
                          <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                            {!isPending && (
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-primary"
                              />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${
                            isPending ? 'bg-orange-500 animate-pulse' : 
                            progress >= 75 ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 
                            'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]'
                          }`} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isPending ? 'text-orange-500' : 'text-primary'}`}>
                            {isPending ? 'Pending' : progress >= 100 ? 'Completed' : 'Active'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            disabled={isPending}
                            className="h-10 w-10 text-muted-foreground hover:text-primary rounded-xl"
                            onClick={() => {
                              setSelectedGoalForCheckIn(goal);
                              setIsCheckInOpen(true);
                            }}
                          >
                            <ArrowUpRight className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary rounded-xl"><MessageSquare className="h-5 w-5" /></Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
            <tfoot className="bg-black/2">
              <tr>
                <td colSpan={4} className="p-4 text-xs font-black text-muted-foreground uppercase tracking-widest">Total Weightage:</td>
                <td className="p-4 text-center text-sm font-black text-primary">{totalWeight}%</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      <CheckInFormDialog 
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        goal={selectedGoalForCheckIn}
        onSuccess={() => {
          
        }}
      />
    </div>
  );
}
