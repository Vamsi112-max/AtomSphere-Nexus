"use client";

import { motion } from "framer-motion";
import { format, parseISO, isPast, isToday } from "date-fns";
import { Target, Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";

interface TimelineViewProps {
  events: any[];
}

export function TimelineView({ events }: TimelineViewProps) {
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcomingEvents = sortedEvents.filter(e => {
    if (!e.date) return false;
    const d = parseISO(e.date);
    return !isPast(d) || isToday(d);
  }).slice(0, 10);

  if (upcomingEvents.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-[2rem] border border-black/5 text-center text-muted-foreground shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">No upcoming strategic events.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-[2rem] border border-black/5 p-8 relative shadow-sm">
      <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-primary uppercase tracking-widest">
        <Clock className="h-6 w-6 text-primary" />
        Intelligence Timeline
      </h3>
      
      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:to-transparent">
        {upcomingEvents.map((event, index) => {
          const isDeadline = event.type === 'deadline';
          const isReview = event.type === 'review';
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start gap-6 group"
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white shrink-0 relative z-10 shadow-sm 
                ${isDeadline ? 'border-red-500/50 text-red-600' : 
                  isReview ? 'border-purple-500/50 text-purple-600' : 
                  'border-primary/50 text-primary'}`}
              >
                {isDeadline ? (
                  <Target className="h-4 w-4" />
                ) : isReview ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <CalendarIcon className="h-4 w-4" />
                )}
              </div>
              
              <div className="flex-1 glass-panel p-6 rounded-[1.5rem] border border-black/5 hover:bg-black/5 transition-all shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isDeadline ? 'text-red-600' : isReview ? 'text-purple-600' : 'text-primary'}`}>
                    {format(parseISO(event.date), "MMM d, yyyy")}
                  </span>
                </div>
                <h4 className="text-sm font-black text-primary leading-tight">{event.title}</h4>
                {event.description && (
                  <p className="text-[11px] text-muted-foreground font-medium mt-2 line-clamp-2 leading-relaxed">{event.description}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
