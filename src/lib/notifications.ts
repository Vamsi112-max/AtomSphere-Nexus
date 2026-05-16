import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export type NotificationType = 'approval_alert' | 'goal_reminder' | 'quarterly_reminder' | 'system';

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  link?: string
) {
  try {
    const id = uuidv4();
    await supabase.from('notifications').insert({
      id,
      user_id: userId,
      title,
      message,
      type,
      link: link || null,
      read: false,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}
