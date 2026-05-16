"use client";

import { useState, useEffect } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CalendarView } from "@/components/calendar/CalendarView";
import { TimelineView } from "@/components/calendar/TimelineView";
import { EventFormDialog } from "@/components/calendar/EventFormDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { endOfQuarter, format } from "date-fns";

export default function CalendarPage() {
  const { user, role } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: eventsData } = await supabase.from('events').select('*');
      const customEvents = eventsData ? eventsData.map(doc => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        date: doc.date,
        type: doc.type,
      })) : [];

      const { data: goalsData } = await supabase.from('goals').select('*');
      const goals = goalsData || [];
      
      const deadlineEvents = goals.map(g => {
        const match = g.quarter?.match(/Q([1-4])/);
        const qNum = match ? parseInt(match[1]) : 1;
        const year = new Date().getFullYear(); 
        const qEndMonth = qNum * 3 - 1;
        const deadlineDate = endOfQuarter(new Date(year, qEndMonth, 1));
        
        return {
          id: `deadline-${g.id || Math.random()}`,
          title: `Deadline: ${g.title || 'Goal'}`,
          date: format(deadlineDate, 'yyyy-MM-dd'),
          type: 'deadline',
          description: `Goal deadline for ${g.quarter} ${year}`
        };
      });

      setEvents([...customEvents, ...deadlineEvents]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pb-10 space-y-6">
      <Breadcrumbs />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
            Organizational Calendar
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Track schedules, performance review cycles, and synthesized goal deadlines across the enterprise timeline.
          </p>
        </div>
        
        {role === "admin" && (
          <Button onClick={() => setIsEventFormOpen(true)} className="bg-primary text-primary-foreground">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CalendarView events={events} />
        </div>
        <div className="lg:col-span-1">
          <TimelineView events={events} />
        </div>
      </div>

      <EventFormDialog 
        isOpen={isEventFormOpen}
        onClose={() => setIsEventFormOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
