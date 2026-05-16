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
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex flex-1 gap-4 w-full md:max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search goals or owners..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-black/20 border-white/10"
              />
            </div>
            {role !== 'employee' && (
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-[180px] bg-black/20 border-white/10">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="glass-panel border-white/10">
                  <SelectItem value="all">All Departments</SelectItem>
                  {uniqueDepartments.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={quarterFilter} onValueChange={setQuarterFilter}>
              <SelectTrigger className="w-[140px] bg-black/20 border-white/10">
                <SelectValue placeholder="Quarter" />
              </SelectTrigger>
              <SelectContent className="glass-panel border-white/10">
                <SelectItem value="all">All Quarters</SelectItem>
                <SelectItem value="Q1">Q1</SelectItem>
                <SelectItem value="Q2">Q2</SelectItem>
                <SelectItem value="Q3">Q3</SelectItem>
                <SelectItem value="Q4">Q4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="border-white/10 hover:bg-white/5">
              <FileText className="mr-2 h-4 w-4 text-blue-400" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel} className="border-white/10 hover:bg-white/5">
              <FileSpreadsheet className="mr-2 h-4 w-4 text-green-400" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="border-white/10 hover:bg-white/5">
              <FileIcon className="mr-2 h-4 w-4 text-red-400" />
              PDF
            </Button>
          </div>
        </div>

        <div className="rounded-md border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-black/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Goal</th>
                  {role !== 'employee' && <th className="px-4 py-3 font-semibold">Owner</th>}
                  {role !== 'employee' && <th className="px-4 py-3 font-semibold">Dept</th>}
                  <th className="px-4 py-3 font-semibold">Quarter</th>
                  <th className="px-4 py-3 font-semibold">Target</th>
                  <th className="px-4 py-3 font-semibold">Actual</th>
                  <th className="px-4 py-3 font-semibold">Progress</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
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
                    <tr key={`${row.goalId}-${idx}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate" title={row.title}>{row.title}</td>
                      {role !== 'employee' && <td className="px-4 py-3 whitespace-nowrap">{row.ownerName}</td>}
                      {role !== 'employee' && <td className="px-4 py-3 whitespace-nowrap"><span className="px-2 py-1 bg-white/5 rounded text-xs">{row.department}</span></td>}
                      <td className="px-4 py-3 whitespace-nowrap">{row.quarter} {row.year}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{row.target}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-primary">{row.actual}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-full h-1.5 bg-white/10 rounded-full max-w-[50px]">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, row.progress)}%` }} />
                          </div>
                          <span className="text-xs">{row.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          row.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                          row.status === 'On Track' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-orange-500/20 text-orange-400'
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
