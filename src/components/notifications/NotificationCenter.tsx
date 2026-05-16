"use client";

import { useNotifications } from "@/context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle2, AlertCircle, Info, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export function NotificationCenter() {
  const { notifications, markAsRead, unreadCount } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'ERROR': return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'WARNING': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default: return <Info className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell className="h-6 w-6 text-primary" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full border-2 border-[#060816]" />
            )}
          </div>
          <span className="font-bold text-white">{unreadCount} Unread Notifications</span>
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-white">
          Mark all as read
        </Button>
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {notifications.length === 0 ? (
            <div className="text-center p-12 glass-panel rounded-3xl border border-white/10">
              <p className="text-muted-foreground">Your alert history is clear.</p>
            </div>
          ) : (
            notifications.map((notif, index) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`glass-panel p-6 rounded-3xl border transition-all ${
                  notif.read ? 'border-white/5 opacity-60' : 'border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.05)]'
                }`}
              >
                <div className="flex gap-4">
                  <div className={`p-3 rounded-2xl ${notif.read ? 'bg-white/5' : 'bg-primary/10'}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <p className={`font-bold ${notif.read ? 'text-white/60' : 'text-white'}`}>
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                          {notif.createdAt?.toDate ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true }) : "Recent"}
                        </span>
                        <div className="flex gap-1">
                          {!notif.read && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-primary hover:bg-primary/10"
                              onClick={() => markAsRead(notif.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
