"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Download, FileText, FileSpreadsheet, FileIcon, Loader2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportToCSV, exportToExcel, exportToPDF } from "@/lib/export";
import { calculateProgress } from "@/lib/progress";

export function ReportingDashboard() {
  const [loading, setLoading] = useState(true);
  const { user, role } = useAuth();
  
  const [reportData, setReportData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [quarterFilter, setQuarterFilter] = useState("all");

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const { data: usersData } = await supabase.from('users').select('*');
        const userMap: Record<string, any> = {};
        if (usersData) {
          usersData.forEach(doc => {
            userMap[doc.id] = doc;
          });
        }

        const { data: goalsData } = await supabase.from('goals').select('*');
        const allGoals = goalsData ? goalsData.map(d => ({ 
          id: d.id, 
          userId: d.employee_id, 
          title: d.title, 
          targetValue: d.target, 
          uom: d.uom, 
          sharedGoalId: d.shared_goal_id, 
          quarter: d.quarter, 
          year: d.year 
        } as any)) : [];

        const { data: updatesData } = await supabase.from('goal_updates').select('*');
        const updatesByGoal: Record<string, any[]> = {};
        if (updatesData) {
          updatesData.forEach(doc => {
            const data = {
              id: doc.id,
              goalId: doc.goal_id,
              quarter: doc.quarter,
              year: doc.year || new Date().getFullYear(),
              actualValue: doc.achievement,
              status: doc.status
            };
            if (!updatesByGoal[data.goalId]) updatesByGoal[data.goalId] = [];
            updatesByGoal[data.goalId].push(data);
          });
        }

        const compiledData: any[] = [];

        for (const goal of allGoals) {
          const owner = userMap[goal.userId] || { name: 'Unknown', department_id: 'Unassigned' };
          
          let targetValue = goal.targetValue;
          let uom = goal.uom;
          let title = goal.title;

          if (goal.sharedGoalId) {
            const { data: sharedData } = await supabase.from('shared_goals').select('*').eq('id', goal.sharedGoalId).single();
            if (sharedData) {
              targetValue = sharedData.target;
              uom = sharedData.uom;
              title = sharedData.title;
            }
          }

          const updates = updatesByGoal[goal.id] || [];
          
          if (updates.length === 0) {
            compiledData.push({
              goalId: goal.id,
              title: title,
              ownerName: owner.name,
              department: owner.department_id,
              quarter: goal.quarter || "N/A",
              year: goal.year || new Date().getFullYear(),
              target: `${targetValue} ${uom}`,
              actual: `0 ${uom}`,
              progress: 0,
              status: "Not Started"
            });
          } else {
            for (const update of updates) {
              const progress = calculateProgress(update.actualValue, targetValue, 'numeric', 0);
              compiledData.push({
                goalId: goal.id,
                title: title,
                ownerName: owner.name,
                department: owner.department_id,
                quarter: update.quarter,
                year: update.year,
                target: `${targetValue} ${uom}`,
                actual: `${update.actualValue} ${uom}`,
                progress: progress,
                status: update.status
              });
            }
          }
        }

        let finalData = compiledData;
        if (role === 'employee') {
          finalData = compiledData.filter(d => d.ownerName === user?.user_metadata?.name);
        }

        setReportData(finalData);
        setFilteredData(finalData);
      } catch (error) {
        console.error("Error fetching report data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [user, role]);

  useEffect(() => {
    let result = reportData;

    if (search) {
      result = result.filter(r => 
        r.title.toLowerCase().includes(search.toLowerCase()) || 
        r.ownerName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (deptFilter !== "all") {
      result = result.filter(r => r.department === deptFilter);
    }

    if (quarterFilter !== "all") {
      result = result.filter(r => r.quarter === quarterFilter);
    }

    setFilteredData(result);
  }, [search, deptFilter, quarterFilter, reportData]);

  const handleExportCSV = () => {
    exportToCSV(filteredData, `performance_report_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportExcel = () => {
    exportToExcel(filteredData, `performance_report_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportPDF = () => {
    const headers = ["Title", "Owner", "Dept", "Quarter", "Target", "Actual", "Progress", "Status"];
    const data = filteredData.map(r => [
      r.title, 
      r.ownerName, 
      r.department, 
      `${r.quarter} ${r.year}`, 
      r.target, 
      r.actual, 
      `${r.progress}%`, 
      r.status
    ]);
    exportToPDF(headers, data, `performance_report_${new Date().toISOString().split('T')[0]}`, "AtomSphere Nexus Performance Report");
  };

  const uniqueDepartments = Array.from(new Set(reportData.map(r => r.department))).filter(Boolean);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="glass-panel p-8 rounded-[2rem] border border-black/5 space-y-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="flex flex-1 gap-6 w-full md:max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-primary/40" />
              <Input 
                placeholder="Search strategic goals or owners..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pill-input h-12 pl-12"
              />
            </div>
            {role !== 'employee' && (
              <Select value={deptFilter} onValueChange={(val) => val && setDeptFilter(val)}>
                <SelectTrigger className="w-[200px] bg-white border-black/5 rounded-full h-12 font-black text-[10px] uppercase tracking-widest text-primary focus:ring-primary/10 transition-all shadow-sm">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="glass-panel border-black/5 rounded-2xl">
                  <SelectItem value="all" className="font-black text-[10px] uppercase tracking-widest">All Departments</SelectItem>
                  {uniqueDepartments.map(d => (
                    <SelectItem key={d} value={d} className="font-black text-[10px] uppercase tracking-widest">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={quarterFilter} onValueChange={(val) => val && setQuarterFilter(val)}>
              <SelectTrigger className="w-[160px] bg-white border-black/5 rounded-full h-12 font-black text-[10px] uppercase tracking-widest text-primary focus:ring-primary/10 transition-all shadow-sm">
                <SelectValue placeholder="Quarter" />
              </SelectTrigger>
              <SelectContent className="glass-panel border-black/5 rounded-2xl">
                <SelectItem value="all" className="font-black text-[10px] uppercase tracking-widest">All Quarters</SelectItem>
                <SelectItem value="Q1" className="font-black text-[10px] uppercase tracking-widest">Q1</SelectItem>
                <SelectItem value="Q2" className="font-black text-[10px] uppercase tracking-widest">Q2</SelectItem>
                <SelectItem value="Q3" className="font-black text-[10px] uppercase tracking-widest">Q3</SelectItem>
                <SelectItem value="Q4" className="font-black text-[10px] uppercase tracking-widest">Q4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Button variant="ghost" size="sm" onClick={handleExportCSV} className="rounded-full h-12 px-6 font-black text-[10px] uppercase tracking-widest text-primary hover:bg-black/5">
              <FileText className="mr-2 h-5 w-5 text-blue-600" />
              CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExportExcel} className="rounded-full h-12 px-6 font-black text-[10px] uppercase tracking-widest text-primary hover:bg-black/5">
              <FileSpreadsheet className="mr-2 h-5 w-5 text-green-600" />
              Excel
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExportPDF} className="rounded-full h-12 px-6 font-black text-[10px] uppercase tracking-widest text-primary hover:bg-black/5">
              <FileIcon className="mr-2 h-5 w-5 text-red-600" />
              PDF
            </Button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-black/5 overflow-hidden shadow-sm bg-white/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/5 border-b border-black/5">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-primary uppercase tracking-widest">Goal Title</th>
                  {role !== 'employee' && <th className="px-6 py-4 text-[10px] font-black text-primary uppercase tracking-widest">Owner</th>}
                  {role !== 'employee' && <th className="px-6 py-4 text-[10px] font-black text-primary uppercase tracking-widest">Dept</th>}
                  <th className="px-6 py-4 text-[10px] font-black text-primary uppercase tracking-widest">Quarter</th>
                  <th className="px-6 py-4 text-[10px] font-black text-primary uppercase tracking-widest">Target</th>
                  <th className="px-6 py-4 text-[10px] font-black text-primary uppercase tracking-widest">Actual</th>
                  <th className="px-6 py-4 text-[10px] font-black text-primary uppercase tracking-widest">Progress</th>
                  <th className="px-6 py-4 text-[10px] font-black text-primary uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={role !== 'employee' ? 8 : 6} className="px-4 py-8 text-center text-muted-foreground">
                      No data found matching the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, idx) => (
                    <tr key={`${row.goalId}-${idx}`} className="border-b border-black/5 hover:bg-black/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-black text-primary text-sm truncate max-w-[200px]" title={row.title}>{row.title}</span>
                        </div>
                      </td>
                      {role !== 'employee' && <td className="px-6 py-4 font-bold text-primary text-sm whitespace-nowrap">{row.ownerName}</td>}
                      {role !== 'employee' && <td className="px-6 py-4 whitespace-nowrap"><span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black rounded-lg uppercase tracking-widest">{row.department}</span></td>}
                      <td className="px-6 py-4 font-bold text-primary/70 text-sm whitespace-nowrap uppercase tracking-tighter">{row.quarter} {row.year}</td>
                      <td className="px-6 py-4 font-black text-primary text-sm whitespace-nowrap">{row.target}</td>
                      <td className="px-6 py-4 font-black text-primary text-sm whitespace-nowrap">{row.actual}</td>
                      <td className="px-6 py-4 min-w-[150px]">
                        <div className="flex items-center gap-3">
                          <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]" style={{ width: `${Math.min(100, row.progress)}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-primary">{row.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          row.status === 'Completed' ? 'bg-green-500/10 text-green-600 border-green-500/10' :
                          row.status === 'On Track' ? 'bg-primary/10 text-primary border-primary/10' :
                          'bg-orange-500/10 text-orange-600 border-orange-500/10'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="text-xs text-muted-foreground flex justify-between items-center">
          <span>Showing {filteredData.length} records</span>
          <span>Data reflects real-time Firestore synchronization</span>
        </div>
      </div>
    </div>
  );
}
