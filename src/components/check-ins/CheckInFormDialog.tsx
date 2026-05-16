"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { checkInSchema } from "@/lib/validations/check-ins";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface CheckInFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goal: any | null;
  onSuccess: () => void;
}

export function CheckInFormDialog({ isOpen, onClose, goal, onSuccess }: CheckInFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [existingCheckInId, setExistingCheckInId] = useState<string | null>(null);
  const { user } = useAuth();

  const currentQuarter = `Q${Math.floor((new Date().getMonth() + 3) / 3)}`;
  const currentYear = new Date().getFullYear();

  const form = useForm<z.infer<typeof checkInSchema>>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      actualValue: 0,
      status: "Not Started",
      employeeComment: "",
    },
  });

  useEffect(() => {
    const fetchExisting = async () => {
      if (!goal || !user) return;
      try {
        const { data } = await supabase
          .from('goal_updates')
          .select('*')
          .eq('goal_id', goal.id)
          .eq('quarter', currentQuarter);
          
        if (data && data.length > 0) {
          const existing = data[0];
          setExistingCheckInId(existing.id);
          form.reset({
            actualValue: existing.achievement,
            status: existing.status,
            employeeComment: existing.employee_comment || "",
          });
        } else {
          setExistingCheckInId(null);
          form.reset({
            actualValue: 0,
            status: "Not Started",
            employeeComment: "",
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (isOpen) fetchExisting();
  }, [goal, isOpen, user, currentQuarter, currentYear, form]);

  const onSubmit = async (values: z.infer<typeof checkInSchema>) => {
    if (!user || !goal) return;
    setIsLoading(true);
    try {
      if (existingCheckInId) {
        await supabase.from('goal_updates').update({
          achievement: values.actualValue,
          status: values.status,
          employee_comment: values.employeeComment,
          manager_reviewed: false,
        }).eq('id', existingCheckInId);
      } else {
        const checkInId = uuidv4();
        await supabase.from('goal_updates').insert({
          id: checkInId,
          goal_id: goal.id,
          quarter: currentQuarter,
          achievement: values.actualValue,
          status: values.status,
          employee_comment: values.employeeComment,
          manager_reviewed: false,
        });
      }
      toast.success("Check-in submitted successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to submit check-in");
    } finally {
      setIsLoading(false);
    }
  };

  if (!goal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] glass-panel border-black/5 p-10">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-primary uppercase tracking-widest">Quarterly Check-in</DialogTitle>
        </DialogHeader>

        <div className="bg-black/5 p-6 rounded-[2rem] border border-black/5 space-y-3 mb-6">
          <p className="text-lg font-black text-primary leading-tight">{goal.title}</p>
          <div className="flex justify-between text-[10px] text-muted-foreground font-black uppercase tracking-widest">
            <span>Target: {goal.targetValue} {goal.uom}</span>
            <span>Weightage: {goal.weightage}%</span>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actual Achievement ({goal.uom})</label>
              <Input
                type="number"
                step="any"
                className="pill-input"
                {...form.register("actualValue")}
              />
              {form.formState.errors.actualValue && (
                <p className="ml-4 text-[10px] font-black text-destructive uppercase tracking-widest">{String(form.formState.errors.actualValue.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Execution Status</label>
              <Select onValueChange={(val) => form.setValue("status", val as any)} defaultValue={form.getValues("status") || "Not Started"}>
                <SelectTrigger className="pill-input">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="glass-panel border-black/5">
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="On Track">On Track</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="ml-4 text-[10px] font-black text-destructive uppercase tracking-widest">{String(form.formState.errors.status.message)}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Strategic Narrative & Roadblocks</label>
            <Textarea
              placeholder="Detail your progress, roadblocks, and achievements..."
              className="rounded-[2rem] bg-black/5 border-black/5 min-h-[120px] px-6 py-4 focus:bg-white transition-all text-primary font-bold placeholder:text-muted-foreground/30"
              {...form.register("employeeComment")}
            />
            {form.formState.errors.employeeComment && (
              <p className="ml-4 text-[10px] font-black text-destructive uppercase tracking-widest">{String(form.formState.errors.employeeComment.message)}</p>
            )}
          </div>

          <DialogFooter className="pt-8">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading} className="rounded-full">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="pill-button px-8">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {existingCheckInId ? "Sync Intelligence" : "Deploy Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
