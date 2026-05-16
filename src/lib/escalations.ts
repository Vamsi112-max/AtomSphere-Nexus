import { supabase } from "@/lib/supabase";
import { createNotification } from "@/lib/notifications";
import { differenceInDays } from "date-fns";

export interface EscalationRule {
  id?: string;
  triggerType: 'PENDING_APPROVAL' | 'MISSING_CHECKIN';
  thresholdDays: number;
  escalateTo: 'ADMIN' | 'MANAGER_OF_MANAGER';
}

export async function checkAndTriggerEscalations() {
  try {
    const { data: rulesData } = await supabase.from('escalation_rules').select('*');
    const rules = rulesData ? rulesData.map(d => ({
      id: d.id,
      triggerType: d.trigger_type,
      thresholdDays: d.threshold_days,
      escalateTo: d.escalate_to,
    } as EscalationRule)) : [];

    if (rules.length === 0) return;

    const { data: pendingGoals } = await supabase.from('goals').select('*').eq('status', 'pending');
    
    if (pendingGoals) {
      for (const goal of pendingGoals) {
        const createdAt = goal.created_at ? new Date(goal.created_at) : new Date();
        const daysDiff = differenceInDays(new Date(), createdAt);

        const rule = rules.find(r => r.triggerType === 'PENDING_APPROVAL');
        if (rule && daysDiff >= rule.thresholdDays) {
          await supabase.from('escalation_logs').insert({
            resource_id: goal.id,
            resource_type: 'goal',
            type: 'PENDING_APPROVAL',
            original_owner_id: goal.employee_id,
            status: 'OPEN',
            days_overdue: daysDiff
          });

          if (rule.escalateTo === 'ADMIN') {
            const { data: admins } = await supabase.from('users').select('id').eq('role', 'admin');
            if (admins) {
              for (const admin of admins) {
                await createNotification(
                  admin.id,
                  "Priority Escalation: Delayed Approval",
                  `Goal "${goal.title}" has been pending for ${daysDiff} days. Intervention required.`,
                  "system",
                  "/admin/escalations"
                );
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Escalation engine error:", error);
  }
}
