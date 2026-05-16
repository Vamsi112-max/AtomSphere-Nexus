"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { 
  Search, 
  Filter, 
  Eye, 
  History, 
  User, 
  ShieldCheck, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  PlusCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";

export function AuditLogTable() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (data) {
        setLogs(data.map(d => ({
          id: d.id,
          action: d.action,
          userName: d.user_name,
          userEmail: d.user_email,
          resourceId: d.resource_id,
          resourceType: d.resource_type,
          before: d.before_state,
          after: d.after_state,
          timestamp: d.created_at,
        })));
      }
      setLoading(false);
    };

    fetchLogs();

    const channel = supabase
      .channel('public:audit_logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredLogs = logs.filter(log => 
    log.userName?.toLowerCase().includes(search.toLowerCase()) ||
    log.action?.toLowerCase().includes(search.toLowerCase()) ||
    log.userEmail?.toLowerCase().includes(search.toLowerCase())
  );

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE_GOAL': return <PlusCircle className="h-4 w-4 text-primary" />;
      case 'APPROVE_GOAL': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'REJECT_GOAL': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'SUBMIT_CHECKIN': return <History className="h-4 w-4 text-blue-500" />;
      case 'LOGIN': return <ShieldCheck className="h-4 w-4 text-purple-500" />;
      default: return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search audit logs by user, action, or email..."
            className="pl-9 bg-black/20 border-white/10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="border-white/10">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden glass-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-black/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Resource</th>
                <th className="px-6 py-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                    {log.timestamp ? format(new Date(log.timestamp), "MMM d, HH:mm:ss") : "Just now"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded-full">
                        <User className="h-3 w-3 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{log.userName}</p>
                        <p className="text-[10px] text-muted-foreground">{log.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <span className="font-mono text-xs font-bold text-primary/80">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {log.resourceType ? (
                      <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] border border-white/10 uppercase">
                        {log.resourceType}: {log.resourceId?.substring(0, 8)}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:bg-white/10"
                      onClick={() => setSelectedLog(log)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                    No matching audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl glass-panel border-white/10 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Audit Log Detail
            </DialogTitle>
            <DialogDescription>
              Detailed payload and state transition for log ID: {selectedLog?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">User Information</p>
                <p className="font-medium">{selectedLog?.userName}</p>
                <p className="text-xs text-muted-foreground">{selectedLog?.userEmail}</p>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Action Metadata</p>
                <p className="font-mono text-xs text-primary">{selectedLog?.action}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedLog?.timestamp ? format(new Date(selectedLog.timestamp), "PPP p") : ""}
                </p>
              </div>
            </div>

            {selectedLog?.before && selectedLog?.after && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase">State Transition</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 overflow-x-auto">
                    <p className="text-[10px] text-red-400 uppercase font-bold mb-2">Before</p>
                    <pre className="text-[10px] font-mono text-muted-foreground italic">
                      {JSON.stringify(selectedLog.before, null, 2)}
                    </pre>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10 overflow-x-auto">
                    <p className="text-[10px] text-green-400 uppercase font-bold mb-2">After</p>
                    <pre className="text-[10px] font-mono text-muted-foreground italic">
                      {JSON.stringify(selectedLog.after, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {!selectedLog?.before && selectedLog?.after && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase">Data Payload</p>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 overflow-x-auto">
                  <pre className="text-[10px] font-mono text-muted-foreground">
                    {JSON.stringify(selectedLog.after, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
