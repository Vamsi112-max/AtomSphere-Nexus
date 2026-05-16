"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  Clock, 
  User, 
  ChevronRight, 
  Bell,
  Settings,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EscalationRules } from "./EscalationRules";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";

export function EscalationMonitoring() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('escalations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (data) {
        setLogs(data.map(d => ({
          id: d.id,
          isResolved: d.status === 'RESOLVED',
          ruleName: d.type,
          targetUserName: d.original_owner_id, 
          actionTaken: d.status,
          timestamp: d.created_at
        })));
      }
      setLoading(false);
    };

    fetchLogs();

    const channel = supabase
      .channel('public:escalations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'escalations' }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="bg-white/5 border border-white/10 p-1 h-12 rounded-2xl">
        <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-primary">Real-time Monitoring</TabsTrigger>
        <TabsTrigger value="rules" className="rounded-xl data-[state=active]:bg-primary">Governance Rules</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-destructive/5">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-destructive/10 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <span className="text-3xl font-black text-white">{logs.filter(l => !l.isResolved).length}</span>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Escalations</p>
            <h4 className="text-lg font-bold text-white">Critical Violations</h4>
          </div>
          
          <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-orange-500/5">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <span className="text-3xl font-black text-white">4.2h</span>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Avg. Resolution Time</p>
            <h4 className="text-lg font-bold text-white">Response Velocity</h4>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-primary/5">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <span className="text-3xl font-black text-white">12</span>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Auto Reminders</p>
            <h4 className="text-lg font-bold text-white">Triggered Today</h4>
          </div>
        </div>

        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/5">
            <h3 className="text-xl font-bold text-white">Incident Stream</h3>
          </div>
          <div className="divide-y divide-white/5">
            {logs.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No active escalations detected in the Nexus.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-6">
                    <div className={`p-3 rounded-2xl ${log.isResolved ? 'bg-green-500/10' : 'bg-destructive/10 animate-pulse'}`}>
                      <ShieldAlert className={`h-6 w-6 ${log.isResolved ? 'text-green-500' : 'text-destructive'}`} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{log.ruleName}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <User className="h-3 w-3" />
                        Target: {log.targetUserName}
                        <ChevronRight className="h-3 w-3" />
                        Action: {log.actionTaken}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-white uppercase tracking-widest mb-1">
                      {log.timestamp ? formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }) : "Recent"}
                    </p>
                    <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 h-8">
                      View Audit Trail
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="rules">
        <EscalationRules />
      </TabsContent>
    </Tabs>
  );
}
