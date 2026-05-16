"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Loader2, Search, PlusCircle, Link as LinkIcon, Trash2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SharedGoalFormDialog } from "./SharedGoalFormDialog";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function SharedGoalsList() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, role } = useAuth();
  
  const [userDept, setUserDept] = useState<string | null>(null);
  
  const [selectedGoal, setSelectedGoal] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [adoptGoal, setAdoptGoal] = useState<any | null>(null);
  const [weightage, setWeightage] = useState<number>(10);
  const [isAdoptLoading, setIsAdoptLoading] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (role === "employee" || role === "manager") {
        const { data: userDoc } = await supabase.from('users').select('*').eq('id', user.id).single();
        if (userDoc) {
          setUserDept(userDoc.department_id || null);
        }
      }

      const { data: goalsSnapshot } = await supabase.from('shared_goals').select('*');
      const fetchedGoals = goalsSnapshot ? goalsSnapshot.map(doc => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        uom: doc.uom,
        targetValue: doc.target,
        thrustArea: doc.thrust_area,
        department: doc.department_id,
        createdBy: doc.created_by,
        year: doc.year,
        quarter: doc.quarter,
      })) : [];
      
      setGoals(fetchedGoals);
    } catch (error) {
      console.error("Error fetching shared goals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this shared goal?")) {
      try {
        await supabase.from('shared_goals').delete().eq('id', id);
        toast.success("Shared Goal deleted");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete goal");
      }
    }
  };

  const handleAdopt = async () => {
    if (!user || !adoptGoal) return;
    if (weightage < 10 || weightage > 100) {
      toast.error("Weightage must be between 10 and 100");
      return;
    }
    
    setIsAdoptLoading(true);
    try {
      await supabase.from('goals').insert({
        employee_id: user.id,
        shared_goal_id: adoptGoal.id,
        title: adoptGoal.title,
        description: adoptGoal.description,
        uom: adoptGoal.uom,
        target: adoptGoal.targetValue,
        thrust_area: adoptGoal.thrustArea,
        weightage: weightage,
        is_shared: true,
        status: "pending",
        year: new Date().getFullYear(),
        quarter: `Q${Math.floor((new Date().getMonth() + 3) / 3)}`
      });
      toast.success("Shared Goal adopted successfully!");
      setAdoptGoal(null);
    } catch (error) {
      toast.error("Failed to adopt goal");
    } finally {
      setIsAdoptLoading(false);
    }
  };

  const filteredGoals = goals.filter(goal => {
    if (role !== "admin" && userDept && goal.department) {
      if (goal.department.toLowerCase() !== userDept.toLowerCase()) return false;
    }
    
    const query = searchQuery.toLowerCase();
    return (
      goal.title?.toLowerCase().includes(query) || 
      goal.department?.toLowerCase().includes(query)
    );
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
            placeholder="Search shared goals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 glass-panel border-white/10"
          />
        </div>
        {role === "admin" && (
          <Button onClick={() => { setSelectedGoal(null); setIsFormOpen(true); }} className="bg-primary text-primary-foreground">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Shared Goal
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredGoals.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-dashed border-white/10 rounded-xl glass-panel">
            <p className="text-muted-foreground">No shared goals available.</p>
          </div>
        ) : (
          filteredGoals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-6 rounded-xl border border-white/5 relative group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg pr-8">{goal.title}</h3>
                {role === "admin" && (
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedGoal(goal); setIsFormOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(goal.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{goal.description}</p>
              
              <div className="grid grid-cols-2 gap-2 text-sm mb-6">
                <div className="bg-black/20 p-2 rounded-md border border-white/5">
                  <p className="text-xs text-muted-foreground">Target</p>
                  <p className="font-medium">{goal.targetValue} {goal.uom}</p>
                </div>
                <div className="bg-black/20 p-2 rounded-md border border-white/5">
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="font-medium">{goal.department || "All"}</p>
                </div>
              </div>

              {role !== "admin" && (
                <Button 
                  className="w-full bg-primary/20 text-primary hover:bg-primary hover:text-white transition-colors border border-primary/50"
                  onClick={() => setAdoptGoal(goal)}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Adopt Goal
                </Button>
              )}
            </motion.div>
          ))
        )}
      </div>

      <SharedGoalFormDialog 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        goalToEdit={selectedGoal} 
        onSuccess={fetchData}
      />

      <Dialog open={!!adoptGoal} onOpenChange={(open) => !open && setAdoptGoal(null)}>
        <DialogContent className="sm:max-w-[400px] glass-panel border-white/10">
          <DialogHeader>
            <DialogTitle>Adopt Shared Goal</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Assign a weightage to <strong>{adoptGoal?.title}</strong>. This will be added to your personal goals list.
            </p>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase font-semibold">Weightage (%)</label>
              <Input
                type="number"
                min={10}
                max={100}
                value={weightage}
                onChange={(e) => setWeightage(Number(e.target.value))}
                className="bg-black/20 border-white/10 font-bold"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAdoptGoal(null)}>Cancel</Button>
            <Button onClick={handleAdopt} disabled={isAdoptLoading}>
              {isAdoptLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirm Adoption"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
