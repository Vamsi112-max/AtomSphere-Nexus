"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Loader2, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ApprovalDialog } from "./ApprovalDialog";

export function TeamGoalsList() {
  const [goals, setGoals] = useState<any[]>([
    { id: 't1', userId: 'dummy1', title: 'Q4 Market Dominance', description: 'Expand market share in APAC region by 15%.', uom: '%', targetValue: 15, weightage: 30, status: 'approved', quarter: 'Q4' },
    { id: 't2', userId: 'dummy1', title: 'Zero Downtime Initiative', description: 'Achieve 99.99% uptime for core microservices.', uom: '%', targetValue: 99.99, weightage: 20, status: 'pending', quarter: 'Q4' },
    { id: 't3', userId: 'dummy1', title: 'Productivity Optimization', description: 'Reduce average ticket resolution time by 25%.', uom: 'Min', targetValue: 25, weightage: 25, status: 'rework', quarter: 'Q4' },
    { id: 't4', userId: 'dummy1', title: 'Strategic Partnerships', description: 'Secure 5 new Tier-1 enterprise partnerships.', uom: 'Count', targetValue: 5, weightage: 25, status: 'approved', quarter: 'Q4' }
  ]);
  const [users, setUsers] = useState<Record<string, any>>({
    'dummy1': { id: 'dummy1', name: 'Strategic Operative', uid: 'dummy1' }
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  
  const [selectedGoal, setSelectedGoal] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchTeamGoals = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: teamUsers, error: usersError } = await supabase.from('users').select('*').eq('manager_id', user.id);
      
      if (usersError || !teamUsers || teamUsers.length === 0) {
        setLoading(false);
        return;
      }
      
      const teamUserIds = teamUsers.map(u => u.id);
      const usersMap: Record<string, any> = {};
      teamUsers.forEach(u => {
        usersMap[u.id] = { id: u.id, name: u.name, uid: u.id };
      });
      setUsers(usersMap);

      const { data: teamGoalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .in('employee_id', teamUserIds)
        .order('created_at', { ascending: false });
        
      if (teamGoalsData && teamGoalsData.length > 0) {
         setGoals(teamGoalsData.map(d => ({
          id: d.id,
          userId: d.employee_id,
          title: d.title,
          description: d.description,
          uom: d.uom,
          targetValue: d.target,
          weightage: d.weightage,
          status: d.status,
          quarter: d.quarter,
        })));
      }
    } catch (error) {
      console.error("Error fetching team goals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamGoals();
  }, [user]);

  const openDialog = (goal: any) => {
    setSelectedGoal(goal);
    setIsDialogOpen(true);
  };

  const filteredGoals = goals.filter(goal => {
    const employee = users[goal.userId];
    const employeeName = employee?.name?.toLowerCase() || "";
    const goalTitle = goal.title?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    
    return employeeName.includes(query) || goalTitle.includes(query) || goal.status?.toLowerCase().includes(query);
  });

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search team missions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 glass-panel border-black/5 bg-black/5 rounded-full h-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="glass-panel border-black/5 bg-white/40 hover:bg-white/60 rounded-full h-10 px-6 font-bold text-xs uppercase tracking-widest">
            <Filter className="h-3 w-3 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredGoals.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-dashed border-white/10 rounded-xl glass-panel">
            <p className="text-muted-foreground">No team goals found.</p>
          </div>
        ) : (
          filteredGoals.map((goal, index) => {
            const employee = users[goal.userId];
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => openDialog(goal)}
                className="glass-panel p-6 rounded-[2rem] cursor-pointer hover:bg-black/5 transition-all border border-black/5 hover:border-primary/30 group relative overflow-hidden shadow-sm"
              >
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                  goal.status === 'approved' || goal.status === 'approved_modified' ? 'bg-green-500' :
                  goal.status === 'rejected' ? 'bg-destructive' :
                  goal.status === 'rework' ? 'bg-orange-500' :
                  'bg-primary'
                }`} />
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-black text-primary text-base truncate max-w-[180px] group-hover:text-primary transition-colors">{goal.title}</h3>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{employee?.name || "Syncing..."}</p>
                  </div>
                  <span className={`px-2 py-1 text-[9px] rounded-lg uppercase font-black tracking-widest border ${
                    goal.status === 'approved' || goal.status === 'approved_modified' ? 'bg-green-500/5 text-green-600 border-green-500/10' :
                    goal.status === 'rejected' ? 'bg-destructive/5 text-destructive border-destructive/10' :
                    goal.status === 'rework' ? 'bg-orange-500/5 text-orange-600 border-orange-500/10' :
                    'bg-primary/5 text-primary border-primary/10'
                  }`}>
                    {goal.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/5 p-3 rounded-xl border border-black/5">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Target</p>
                    <p className="font-black text-primary text-sm">{goal.targetValue} {goal.uom}</p>
                  </div>
                  <div className="bg-black/5 p-3 rounded-xl border border-black/5">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Weight</p>
                    <p className="font-black text-primary text-sm">{goal.weightage}%</p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <ApprovalDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        goal={selectedGoal} 
        onSuccess={fetchTeamGoals}
      />
    </div>
  );
}
