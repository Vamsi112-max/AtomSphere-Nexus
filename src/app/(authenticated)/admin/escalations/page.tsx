"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { EscalationRules } from "@/components/admin/EscalationRules";
import { AlertTriangle, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function EscalationPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('escalation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (data) {
        setLogs(data.map(doc => ({
          id: doc.id,
          status: doc.status,
          type: doc.type,
          resourceId: doc.resource_id,
          daysOverdue: doc.days_overdue,
          createdAt: doc.created_at,
        })));
      }
      setLoading(false);
    };

    fetchLogs();

    const channel = supabase
      .channel('public:escalation_logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'escalation_logs' }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="pb-10 space-y-8">
      <Breadcrumbs />
      
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-xl">
          <AlertTriangle className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-4xl font-black tracking-tight text-primary">
            Workflow <span className="text-primary/70">Escalation Engine</span>
          </h2>
          <p className="text-muted-foreground mt-1 font-medium">
            Monitor delayed approvals and automated task escalations across the organizational hierarchy.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <EscalationRules />
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-black flex items-center gap-2 text-primary">
            <Clock className="h-5 w-5 text-primary" />
            Recent Escalation History
          </h3>
          
          <div className="glass-panel rounded-[2rem] border border-black/5 overflow-hidden">
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground italic font-medium">
                No active escalations recorded. System is running optimally.
              </div>
            ) : (
              <div className="divide-y divide-black/5">
                {logs.map((log) => (
                  <div key={log.id} className="p-6 hover:bg-black/5 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        log.status === 'OPEN' ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'
                      }`}>
                        {log.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-bold">
                        {log.createdAt ? format(new Date(log.createdAt), "MMM d, HH:mm") : "Just now"}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-foreground mb-1">
                      {log.type === 'PENDING_APPROVAL' ? 'Approval Threshold Exceeded' : 'Submission Missing'}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      Resource: <span className="text-primary font-black">{log.resourceId.substring(0, 8)}</span> • Overdue by {log.daysOverdue} days
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
