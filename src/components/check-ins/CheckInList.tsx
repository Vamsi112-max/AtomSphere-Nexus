"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Loader2, Calendar, Target, Activity, CheckCircle2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckInFormDialog } from "./CheckInFormDialog";
import { ManagerReviewDialog } from "./ManagerReviewDialog";

export function CheckInList() {
  const [data, setData] = useState<any[]>([
    {
      goal: { id: 'd1', title: 'Enterprise AI Strategy', targetValue: 100, uom: '%', weightage: 30 },
      checkIn: { actualValue: 65, status: 'On Track', managerReviewed: false, employee_comment: 'Making significant progress in cloud migration.' }
    },
    {
      goal: { id: 'd2', title: 'Global Revenue Peak', targetValue: 25, uom: '$M', weightage: 40 },
      checkIn: { actualValue: 18, status: 'On Track', managerReviewed: true, manager_comment: 'Excellent revenue traction in the APAC region.', employee_comment: 'Closing Q3 with strong lead generation.' }
    }
  ]);
  const [loading, setLoading] = useState(false);
  const { user, role } = useAuth();
  
  const [selectedGoalForCheckIn, setSelectedGoalForCheckIn] = useState<any | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  const [selectedCheckInForReview, setSelectedCheckInForReview] = useState<any | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const currentQuarter = `Q${Math.floor((new Date().getMonth() + 3) / 3)}`;
  const currentYear = new Date().getFullYear();

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (role === "employee") {
        const { data: goalsData } = await supabase
          .from('goals')
          .select('*')
          .eq('employee_id', user.id)
          .in('status', ['approved', 'approved_modified']);
          
        const { data: updatesData } = await supabase
          .from('goal_updates')
          .select('*, goals!inner(employee_id)')
          .eq('goals.employee_id', user.id)
          .eq('quarter', currentQuarter);
          
        const updatesMap: Record<string, any> = {};
        if (updatesData) {
          updatesData.forEach(doc => {
            updatesMap[doc.goal_id] = { 
              id: doc.id, 
              actualValue: doc.achievement,
              status: doc.status,
              managerComment: doc.manager_comment,
              managerReviewed: doc.manager_reviewed,
              ...doc 
            };
          });
        }

        const mergedData = [];
        if (goalsData) {
          for (const goalDoc of goalsData) {
            const goalData = { 
              id: goalDoc.id, 
              title: goalDoc.title,
              targetValue: goalDoc.target,
              uom: goalDoc.uom,
              weightage: goalDoc.weightage,
              sharedGoalId: goalDoc.shared_goal_id,
              ...goalDoc 
            } as any;
            
            if (goalData.sharedGoalId) {
              const { data: sharedData } = await supabase.from('shared_goals').select('*').eq('id', goalData.sharedGoalId).single();
              if (sharedData) {
                goalData.title = sharedData.title;
                goalData.targetValue = sharedData.target;
                goalData.uom = sharedData.uom;
                goalData.description = sharedData.description;
              }
            }
            
            mergedData.push({
              goal: goalData,
              checkIn: updatesMap[goalData.id] || null,
            });
          }
        }
        setData(mergedData);
      } else {
        const { data: usersData } = await supabase.from('users').select('*').eq('manager_id', user.id);
        const teamIds = usersData ? usersData.map(doc => doc.id) : [];
        const usersMap: Record<string, any> = {};
        if (usersData) {
          usersData.forEach(doc => {
            usersMap[doc.id] = doc;
          });
        }

        if (teamIds.length === 0) {
          setData([]);
          setLoading(false);
          return;
        }

        const { data: teamUpdatesData } = await supabase
          .from('goal_updates')
          .select('*, goals!inner(employee_id)')
          .in('goals.employee_id', teamIds)
          .eq('quarter', currentQuarter);
          
        const teamUpdates = teamUpdatesData ? teamUpdatesData.map(doc => ({
          id: doc.id,
          goalId: doc.goal_id,
          actualValue: doc.achievement,
          status: doc.status,
          managerComment: doc.manager_comment,
          managerReviewed: doc.manager_reviewed,
          userId: doc.goals.employee_id,
          ...doc
        })) : [];

        const mergedData = [];
        for (const update of teamUpdates) {
          const { data: goalSnap } = await supabase.from('goals').select('*').eq('id', update.goalId).single();
          if (goalSnap) {
            const goalData = { 
              id: goalSnap.id, 
              title: goalSnap.title,
              targetValue: goalSnap.target,
              uom: goalSnap.uom,
              weightage: goalSnap.weightage,
              sharedGoalId: goalSnap.shared_goal_id,
              ...goalSnap 
            } as any;
            if (goalData.sharedGoalId) {
              const { data: sharedData } = await supabase.from('shared_goals').select('*').eq('id', goalData.sharedGoalId).single();
              if (sharedData) {
                goalData.title = sharedData.title;
                goalData.targetValue = sharedData.target;
                goalData.uom = sharedData.uom;
              }
            }
            mergedData.push({
              checkIn: update,
              goal: goalData,
              employee: usersMap[update.userId],
            });
          }
        }
        setData(mergedData);
      }
    } catch (error) {
      console.error("Error fetching check-ins:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, role]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border border-black/5 rounded-[2rem] p-8 flex items-center gap-6 shadow-sm">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Calendar className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-black text-primary uppercase tracking-widest">Active Quarter: {currentQuarter} {currentYear}</h3>
          <p className="text-xs text-muted-foreground font-bold mt-1">
            {role === "employee" 
              ? "Ensure all your approved missions have an up-to-date check-in before the end of the strategic cycle."
              : "Review and provide tactical feedback on the check-ins submitted by your organization."}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {data.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-white/10 rounded-xl glass-panel">
            <p className="text-muted-foreground">
              {role === "employee" ? "No approved goals found to check-in against." : "No team check-ins submitted yet."}
            </p>
          </div>
        ) : (
          data.map((item, index) => {
            const progress = item.checkIn && item.goal.targetValue > 0 
              ? Math.min(Math.round((item.checkIn.actualValue / item.goal.targetValue) * 100), 100) 
              : 0;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-panel p-8 rounded-[2rem] border border-black/5 relative overflow-hidden shadow-sm"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <h3 className="text-xl font-black text-primary leading-tight">{item.goal.title}</h3>
                    {role !== "employee" && item.employee && (
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Operative: {item.employee.name}</p>
                    )}
                  </div>
                  
                  {role === "employee" ? (
                    <Button 
                      onClick={() => { setSelectedGoalForCheckIn(item.goal); setIsCheckInOpen(true); }}
                      variant={item.checkIn ? "ghost" : "default"}
                      className={item.checkIn ? "rounded-full font-black text-[10px] uppercase text-primary" : "pill-button px-8"}
                    >
                      {item.checkIn ? "Update Intelligence" : "Submit Update"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => { setSelectedCheckInForReview({ ...item.checkIn, goal: item.goal }); setIsReviewOpen(true); }}
                      disabled={item.checkIn.managerReviewed}
                      className={item.checkIn.managerReviewed ? "bg-green-500/10 text-green-600 rounded-full font-black text-[10px] uppercase px-8" : "pill-button px-8"}
                    >
                      {item.checkIn.managerReviewed ? (
                        <><CheckCircle2 className="mr-2 h-4 w-4" /> Validated</>
                      ) : (
                        <><MessageSquare className="mr-2 h-4 w-4" /> Review Mission</>
                      )}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-black/5 p-4 rounded-2xl border border-black/5">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Target className="h-3 w-3 text-primary" /> Target
                    </p>
                    <p className="text-sm font-black text-primary">{item.goal.targetValue} {item.goal.uom}</p>
                  </div>
                  <div className="bg-black/5 p-4 rounded-2xl border border-black/5">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Activity className="h-3 w-3 text-primary" /> Achievement
                    </p>
                    <p className="text-sm font-black text-primary">{item.checkIn ? `${item.checkIn.actualValue} ${item.goal.uom}` : "--"}</p>
                  </div>
                  <div className="bg-black/5 p-4 rounded-2xl border border-black/5">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">Status</p>
                    <p className={`text-xs font-black uppercase tracking-widest ${
                      item.checkIn?.status === 'Completed' ? 'text-green-600' :
                      item.checkIn?.status === 'On Track' ? 'text-blue-600' :
                      'text-muted-foreground'
                    }`}>
                      {item.checkIn?.status || "Not Started"}
                    </p>
                  </div>
                  <div className="bg-black/5 p-4 rounded-2xl border border-black/5">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">Validation</p>
                    <p className="text-xs font-black uppercase tracking-widest text-primary">
                      {item.checkIn ? (item.checkIn.managerReviewed ? "Validated" : "Pending") : "--"}
                    </p>
                  </div>
                </div>

                {item.checkIn && (
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                      <span>Tactical Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-3 w-full bg-black/5 rounded-full overflow-hidden border border-black/5">
                      <motion.div 
                        className={`h-full ${progress === 100 ? 'bg-green-500' : 'bg-primary'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}

                {item.checkIn?.managerComment && (
                  <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl mt-4">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Tactical Feedback</p>
                    <p className="text-sm font-bold text-primary/80 leading-relaxed">{item.checkIn.managerComment}</p>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      <CheckInFormDialog 
        isOpen={isCheckInOpen} 
        onClose={() => setIsCheckInOpen(false)} 
        goal={selectedGoalForCheckIn} 
        onSuccess={fetchData}
      />

      <ManagerReviewDialog
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        checkIn={selectedCheckInForReview}
        onSuccess={fetchData}
      />
    </div>
  );
}
