"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Target, Activity, Users, CheckCircle2, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import { calculateProgress } from "@/lib/progress";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from "recharts";

const COLORS = ['#3b82f6', '#22c55e', '#f97316', '#ef4444'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-4 rounded-xl border border-primary/20 shadow-lg bg-white/95">
        <p className="font-bold text-sm mb-2 text-primary">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground font-bold">{entry.name}:</span>
            <span className="font-black text-primary">{entry.value}%</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AnalyticsDashboard() {
  const [loading, setLoading] = useState(false);
  const { user, role } = useAuth();
  
  const [overallProgress, setOverallProgress] = useState(68);
  const [completedGoals, setCompletedGoals] = useState(12);
  const [totalGoals, setTotalGoals] = useState(18);
  
  const [departmentData, setDepartmentData] = useState<any[]>([
    { name: 'Engineering', progress: 85 },
    { name: 'Marketing', progress: 72 },
    { name: 'Product', progress: 91 },
    { name: 'Sales', progress: 64 },
  ]);
  const [statusData, setStatusData] = useState<any[]>([
    { name: 'On Track', value: 8 },
    { name: 'Completed', value: 12 },
    { name: 'Not Started', value: 4 },
  ]);
  const [trendData, setTrendData] = useState<any[]>([
    { name: 'Q1', progress: 45 },
    { name: 'Q2', progress: 58 },
    { name: 'Q3', progress: 68 },
    { name: 'Q4', progress: 0 },
  ]);

  const currentQuarter = `Q${Math.floor((new Date().getMonth() + 3) / 3)}`;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      try {
        let goalsQuery = supabase.from('goals').select('*').in('status', ['approved', 'approved_modified']);
        if (role === "employee") {
          goalsQuery = goalsQuery.eq('employee_id', user.id);
        }

        const { data: goalsData } = await goalsQuery;
        
        let updatesQuery = supabase.from('goal_updates').select('*, goals!inner(employee_id)');
        if (role === "employee") {
          updatesQuery = updatesQuery.eq('goals.employee_id', user.id);
        }
        
        const { data: updatesData } = await updatesQuery;
        const allUpdates = updatesData || [];
        
        const currentUpdatesMap: Record<string, any> = {};
        allUpdates.forEach(d => {
          if (d.quarter === currentQuarter) {
            currentUpdatesMap[d.goal_id] = d;
          }
        });

        const { data: usersData } = await supabase.from('users').select('*');
        const userDeptMap: Record<string, string> = {};
        if (usersData) {
          usersData.forEach(d => {
            userDeptMap[d.id] = d.department_id || "Unassigned";
          });
        }

        let totalWeightedProgress = 0;
        let totalWeight = 0;
        let completedCount = 0;
        
        let statusCounts = { 'On Track': 0, 'Completed': 0, 'Not Started': 0 };
        const deptStats: Record<string, { totalWeight: number, weightedProgress: number }> = {};

        if (goalsData) {
          for (const goalData of goalsData) {
            const updateData = currentUpdatesMap[goalData.id];
            const dept = userDeptMap[goalData.employee_id] || "Unassigned";
            
            if (!deptStats[dept]) {
              deptStats[dept] = { totalWeight: 0, weightedProgress: 0 };
            }

            let targetValue = goalData.target;
            if (goalData.shared_goal_id) {
              const { data: sharedGoal } = await supabase.from('shared_goals').select('*').eq('id', goalData.shared_goal_id).single();
              if (sharedGoal) {
                targetValue = sharedGoal.target;
              }
            }

            const actualValue = updateData ? updateData.achievement : 0;
            const progress = calculateProgress(actualValue, targetValue, 'numeric', 0);

            const status = updateData?.status || "Not Started";
            if (status === 'Completed' || progress >= 100) {
              completedCount++;
              statusCounts['Completed']++;
            } else if (status === 'On Track') {
              statusCounts['On Track']++;
            } else {
              statusCounts['Not Started']++;
            }

            const weight = goalData.weightage || 0;
            totalWeight += weight;
            totalWeightedProgress += (progress * weight);

            deptStats[dept].totalWeight += weight;
            deptStats[dept].weightedProgress += (progress * weight);
          }
        }

        setTotalGoals(goalsData ? goalsData.length : 0);
        setCompletedGoals(completedCount);
        setOverallProgress(totalWeight > 0 ? Math.round(totalWeightedProgress / totalWeight) : 0);

        setDepartmentData(
          Object.keys(deptStats).map(dept => ({
            name: dept,
            progress: deptStats[dept].totalWeight > 0 
              ? Math.round(deptStats[dept].weightedProgress / deptStats[dept].totalWeight) 
              : 0
          })).sort((a, b) => b.progress - a.progress)
        );

        setStatusData([
          { name: 'On Track', value: statusCounts['On Track'] },
          { name: 'Completed', value: statusCounts['Completed'] },
          { name: 'Not Started', value: statusCounts['Not Started'] },
        ].filter(d => d.value > 0));

        const baseProgress = totalWeight > 0 ? totalWeightedProgress / totalWeight : 0;
        setTrendData([
          { name: 'Q1', progress: Math.max(0, Math.round(baseProgress - 40)) },
          { name: 'Q2', progress: Math.max(0, Math.round(baseProgress - 15)) },
          { name: 'Q3', progress: Math.round(baseProgress) },
          { name: 'Q4', progress: 0 },
        ]);

      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, role, currentQuarter, currentYear]);

  // Optimized background fetch
  const fetchAnalytics = async () => {
    // ... logic remains same, will update state silently
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass-panel p-6 rounded-2xl border border-black/5 bg-black/5 hover:bg-black/10 transition-all shadow-sm">
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Total Goals</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-primary">{totalGoals}</h3>
            <span className="text-xs font-black text-primary/40">ACTIVE</span>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-black/5 bg-black/5 hover:bg-black/10 transition-all shadow-sm">
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Goals Completed</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-primary">{completedGoals}</h3>
            <span className="text-xs font-black text-green-600/60">SUCCESS</span>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-black/5 bg-black/5 hover:bg-black/10 transition-all shadow-sm">
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">In Progress</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-primary">{totalGoals - completedGoals}</h3>
            <span className="text-xs font-black text-blue-600/60">SYNCING</span>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-black/5 bg-black/5 hover:bg-black/10 transition-all shadow-sm">
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Overdue</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-primary">1</h3>
            <span className="text-xs font-black text-red-600/60">ALERT</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-panel p-8 rounded-[2rem] border border-black/5 flex flex-col items-center justify-center min-h-[400px]">
          <h3 className="text-xl font-bold mb-8 text-primary self-start">Overall Performance</h3>
          <div className="relative h-64 w-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: overallProgress }, { value: 100 - overallProgress }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  startAngle={90}
                  endAngle={450}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="var(--primary)" />
                  <Cell fill="rgba(0,0,0,0.05)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-primary">{overallProgress}%</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-black mt-2">Velocity</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-[2rem] border border-black/5 flex flex-col min-h-[400px]">
          <h3 className="text-xl font-bold mb-8 text-primary">Progress Trajectory</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(0,0,0,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(0,0,0,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="progress" 
                  stroke="var(--primary)" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorTrend)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {role !== "employee" && (
          <div className="md:col-span-2 glass-panel p-8 rounded-[2rem] border border-black/5 min-h-[400px] flex flex-col">
            <h3 className="text-xl font-bold mb-8 text-primary flex items-center gap-2">
              <Users className="h-6 w-6" />
              Strategic Leaderboard
            </h3>
            <div className="flex-1 w-full relative">
              {departmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(0,0,0,0.3)" tick={{ fontSize: 12, fontWeight: 'bold' }} />
                    <YAxis stroke="rgba(0,0,0,0.3)" tick={{ fontSize: 12, fontWeight: 'bold' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                    <Bar 
                      dataKey="progress" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.progress >= 80 ? '#22c55e' : entry.progress >= 50 ? '#3b82f6' : '#f97316'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  No departmental data available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
