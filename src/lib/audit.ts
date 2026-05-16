import { supabase } from "@/lib/supabase";

export type AuditAction = 
  | 'CREATE_GOAL' 
  | 'UPDATE_GOAL' 
  | 'APPROVE_GOAL' 
  | 'REJECT_GOAL' 
  | 'SUBMIT_CHECKIN' 
  | 'REVIEW_CHECKIN' 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'DELETE_GOAL'
  | 'ADOPT_SHARED_GOAL'
  | 'PUSH_SHARED_GOAL'
  | 'UPDATE_PROFILE'
  | 'CHANGE_PASSWORD';

interface AuditLogEntry {
  action: AuditAction;
  userId: string;
  userName: string;
  userEmail: string;
  resourceId?: string;
  resourceType?: string;
  before?: any;
  after?: any;
  metadata?: any;
}

export async function logAuditAction(entry: AuditLogEntry) {
  try {
    await supabase.from('audit_logs').insert({
      action: entry.action,
      user_id: entry.userId,
      user_name: entry.userName,
      user_email: entry.userEmail,
      resource_id: entry.resourceId,
      resource_type: entry.resourceType,
      before_state: entry.before,
      after_state: entry.after,
      metadata: entry.metadata,
    });
  } catch (error) {
    console.error("Error logging audit action:", error);
  }
}
