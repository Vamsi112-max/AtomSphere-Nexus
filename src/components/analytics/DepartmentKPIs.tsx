"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ResponsiveContainer, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { Loader2, TrendingUp, Users, Target, Activity } from "lucide-react";
import { motion } from "framer-motion";

export function DepartmentKPIs() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        setData([
          { subject: 'Innovation', Engineering: 120, Sales: 70, HR: 40, fullMark: 150 },
          { subject: 'Efficiency', Engineering: 98, Sales: 110, HR: 130, fullMark: 150 },
          { subject: 'Revenue', Engineering: 86, Sales: 130, HR: 20, fullMark: 150 },
          { subject: 'Compliance', Engineering: 99, Sales: 90, HR: 140, fullMark: 150 },
          { subject: 'Collaboration', Engineering: 85, Sales: 90, HR: 120, fullMark: 150 },
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col h-[500px]"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Cross-Department Alignment
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} stroke="rgba(255,255,255,0.1)" />
                <Radar name="Engineering" dataKey="Engineering" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                <Radar name="Sales" dataKey="Sales" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Radar name="HR" dataKey="HR" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                <Legend />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col h-[500px]"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Performance Velocity by Department
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="subject" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Bar dataKey="Engineering" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="HR" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "Total Departments", value: "6", icon: Users, color: "text-blue-400" },
          { title: "Top Performer", value: "Engineering", icon: TrendingUp, color: "text-green-400" },
          { title: "Active Shared Goals", value: "14", icon: Target, color: "text-purple-400" },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (i * 0.1) }}
            className="glass-panel p-6 rounded-2xl border border-white/10"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.title}</p>
                <h4 className="text-2xl font-black text-white">{stat.value}</h4>
              </div>
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
