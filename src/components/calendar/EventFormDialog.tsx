"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { eventSchema } from "@/lib/validations/events";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EventFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EventFormDialog({ isOpen, onClose, onSuccess }: EventFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      type: "general",
    },
  });

  const onSubmit = async (values: z.infer<typeof eventSchema>) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('events').insert({
        title: values.title,
        description: values.description,
        date: values.date,
        type: values.type,
        created_by: user.id
      });
      if (error) throw error;
      toast.success("Event created successfully");
      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to create event");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] glass-panel border-white/10">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground uppercase font-semibold">Event Title</label>
            <Input
              placeholder="e.g., Q3 Performance Review Kickoff"
              className="bg-black/20 border-white/10"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase font-semibold">Date</label>
              <Input
                type="date"
                className="bg-black/20 border-white/10"
                {...form.register("date")}
              />
              {form.formState.errors.date && (
                <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase font-semibold">Event Type</label>
              <Select onValueChange={(val) => form.setValue("type", val as any)} defaultValue={form.getValues("type")}>
                <SelectTrigger className="bg-black/20 border-white/10">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="glass-panel border-white/10">
                  <SelectItem value="general">General Event</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="meeting">Company Meeting</SelectItem>
                  <SelectItem value="review">Performance Review</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-xs text-destructive">{form.formState.errors.type.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground uppercase font-semibold">Description (Optional)</label>
            <Textarea
              placeholder="Add any additional details..."
              className="bg-black/20 border-white/10 resize-none h-20"
              {...form.register("description")}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
