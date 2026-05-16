"use client";

import { useState } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  parseISO
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarViewProps {
  events: any[];
}

export function CalendarView({ events }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      const dayEvents = events.filter(e => {
        if (!e.date) return false;
        const eDate = parseISO(e.date);
        return isSameDay(eDate, cloneDay);
      });

      days.push(
        <div
          key={day.toString()}
          className={`min-h-[100px] md:min-h-[120px] p-4 border border-black/5 transition-all relative group
            ${!isSameMonth(day, monthStart) ? "text-muted-foreground/30 bg-black/5" : "text-primary font-bold bg-white/20 hover:bg-white/40"}
            ${isSameDay(day, new Date()) ? "border-primary/50 bg-primary/5 ring-1 ring-inset ring-primary/20" : ""}
          `}
        >
          <span className={`text-sm font-semibold ${isSameDay(day, new Date()) ? "text-primary" : ""}`}>
            {formattedDate}
          </span>
          
          <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px] no-scrollbar">
            {dayEvents.map((evt, idx) => (
              <div 
                key={idx} 
                className={`text-[9px] px-2 py-1 rounded-full flex items-center gap-1 truncate font-black uppercase tracking-tighter
                  ${evt.type === 'deadline' ? 'bg-red-500/10 text-red-600 border border-red-500/10' : 
                    evt.type === 'meeting' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/10' : 
                    evt.type === 'review' ? 'bg-purple-500/10 text-purple-600 border border-purple-500/10' :
                    'bg-primary/10 text-primary border border-primary/10'}
                `}
                title={evt.title}
              >
                {evt.type === 'deadline' ? <Target className="h-3 w-3 shrink-0" /> : <CalendarIcon className="h-3 w-3 shrink-0" />}
                <span className="truncate">{evt.title}</span>
              </div>
            ))}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="glass-panel rounded-[2rem] border border-black/5 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-black/5 flex items-center justify-between bg-black/5">
        <h2 className="text-xl font-black flex items-center gap-3 text-primary uppercase tracking-widest">
          <CalendarIcon className="h-6 w-6 text-primary" />
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-10 w-10 hover:bg-primary/5 rounded-full">
            <ChevronLeft className="h-5 w-5 text-primary" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())} className="h-10 px-6 font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5 rounded-full">
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-10 w-10 hover:bg-primary/5 rounded-full">
            <ChevronRight className="h-5 w-5 text-primary" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 border-b border-black/5 bg-black/5">
        {weekdays.map((day) => (
          <div key={day} className="p-3 text-center text-[10px] font-black text-primary uppercase tracking-[0.2em]">
            {day}
          </div>
        ))}
      </div>
      
      <div className="flex flex-col">
        {rows}
      </div>
    </div>
  );
}
