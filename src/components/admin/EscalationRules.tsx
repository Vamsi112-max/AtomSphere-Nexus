"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, PlusCircle, ShieldAlert, Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { checkAndTriggerEscalations } from "@/lib/escalations";

export function EscalationRules() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  const [triggerType, setTriggerType] = useState("PENDING_APPROVAL");
  const [thresholdDays, setThresholdDays] = useState(3);
  const [escalateTo, setEscalateTo] = useState("ADMIN");

  useEffect(() => {
    const fetchRules = async () => {
      const { data } = await supabase.from('escalation_rules').select('*');
      if (data) {
        setRules(data.map(d => ({
          id: d.id,
          triggerType: d.trigger_type,
          thresholdDays: d.threshold_days,
          escalateTo: d.escalate_to
        })));
      }
      setLoading(false);
    };

    fetchRules();

    const channel = supabase
      .channel('public:escalation_rules')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'escalation_rules' }, () => {
        fetchRules();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddRule = async () => {
    try {
      await supabase.from('escalation_rules').insert({
        trigger_type: triggerType,
        threshold_days: Number(thresholdDays),
        escalate_to: escalateTo,
      });
      toast.success("Escalation rule added");
    } catch (error) {
      toast.error("Failed to add rule");
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await supabase.from('escalation_rules').delete().eq('id', id);
      toast.success("Rule removed");
    } catch (error) {
      toast.error("Failed to remove rule");
    }
  };

  const runManualCheck = async () => {
    setIsRunning(true);
    try {
      await checkAndTriggerEscalations();
      toast.success("Manual escalation check completed");
    } catch (error) {
      toast.error("Manual check failed");
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2 text-white">
          <ShieldAlert className="h-5 w-5 text-primary" />
          Active Workflow Rules
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={runManualCheck} 
          disabled={isRunning}
          className="border-primary/50 text-primary hover:bg-primary/10"
        >
          {isRunning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          Run Manual Check
        </Button>
      </div>

      <div className="grid gap-4">
        {rules.map((rule) => (
          <div key={rule.id} className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">
                {rule.triggerType.replace('_', ' ')}
              </p>
              <p className="text-xs text-muted-foreground">
                Escalate to <span className="text-foreground font-medium">{rule.escalateTo}</span> after <span className="text-foreground font-medium">{rule.thresholdDays} days</span> of inactivity.
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        <div className="p-4 rounded-xl border border-dashed border-white/10 bg-white/5 space-y-4">
          <p className="text-xs font-bold text-muted-foreground uppercase">Create New Rule</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={triggerType} onValueChange={setTriggerType}>
              <SelectTrigger className="bg-black/20 border-white/10 focus:ring-primary/50">
                <SelectValue placeholder="Trigger" />
              </SelectTrigger>
              <SelectContent className="glass-panel border-white/10">
                <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                <SelectItem value="MISSING_CHECKIN">Missing Check-in</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Input 
                type="number" 
                value={thresholdDays} 
                onChange={(e) => setThresholdDays(Number(e.target.value))}
                className="bg-black/20 border-white/10 pl-4 focus-visible:ring-primary/50"
                placeholder="Days"
              />
              <span className="absolute right-3 top-2.5 text-[10px] text-muted-foreground uppercase">Days</span>
            </div>
            <Select value={escalateTo} onValueChange={setEscalateTo}>
              <SelectTrigger className="bg-black/20 border-white/10 focus:ring-primary/50">
                <SelectValue placeholder="Escalate To" />
              </SelectTrigger>
              <SelectContent className="glass-panel border-white/10">
                <SelectItem value="ADMIN">System Admin</SelectItem>
                <SelectItem value="MANAGER_OF_MANAGER">Direct Manager</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddRule} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
