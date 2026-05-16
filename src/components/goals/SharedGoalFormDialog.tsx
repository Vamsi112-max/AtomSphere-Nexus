"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { sharedGoalSchema } from "@/lib/validations/shared-goals";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface SharedGoalFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit: any | null;
  onSuccess: () => void;
}

export function SharedGoalFormDialog({ isOpen, onClose, goalToEdit, onSuccess }: SharedGoalFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm<z.infer<typeof sharedGoalSchema>>({
    resolver: zodResolver(sharedGoalSchema),
    defaultValues: {
      title: "",
      description: "",
      uom: "",
      targetValue: 0,
      thrustArea: "",
      department: "",
    },
  });

  useEffect(() => {
    if (goalToEdit) {
      form.reset({
        title: goalToEdit.title,
        description: goalToEdit.description,
        uom: goalToEdit.uom,
        targetValue: goalToEdit.targetValue,
        thrustArea: goalToEdit.thrustArea,
        department: goalToEdit.department,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        uom: "",
        targetValue: 0,
        thrustArea: "",
        department: "",
      });
    }
  }, [goalToEdit, form, isOpen]);

  const onSubmit = async (values: z.infer<typeof sharedGoalSchema>) => {
    if (!user) return;
    setIsLoading(true);
    try {
      if (goalToEdit) {
        await supabase.from('shared_goals').update({
          title: values.title,
          description: values.description,
          uom: values.uom,
          target: values.targetValue,
          thrust_area: values.thrustArea,
          department_id: values.department,
        }).eq('id', goalToEdit.id);
        toast.success("Shared Goal updated successfully");
      } else {
        const goalId = uuidv4();
        await supabase.from('shared_goals').insert({
          id: goalId,
          title: values.title,
          description: values.description,
          uom: values.uom,
          target: values.targetValue,
          thrust_area: values.thrustArea,
          department_id: values.department,
          created_by: user.id,
          year: new Date().getFullYear(),
          quarter: `Q${Math.floor((new Date().getMonth() + 3) / 3)}`
        });
        toast.success("Shared Goal created successfully");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Failed to save shared goal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] glass-panel border-black/5 p-10">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-primary uppercase tracking-widest">{goalToEdit ? "Sync Blueprint" : "Deploy Strategy"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Strategic Objective Title"
              className="bg-black/5 border-black/5 text-lg font-black text-primary placeholder:text-muted-foreground/30 rounded-xl h-12"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="ml-4 text-[10px] font-black text-destructive uppercase tracking-widest">{String(form.formState.errors.title.message)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Provide a detailed strategic roadmap for this initiative..."
              className="rounded-[2rem] bg-black/5 border-black/5 min-h-[100px] px-6 py-4 focus:bg-white transition-all text-primary font-bold placeholder:text-muted-foreground/30"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="ml-4 text-[10px] font-black text-destructive uppercase tracking-widest">{String(form.formState.errors.description.message)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unit (UoM)</label>
              <Input
                placeholder="%, $m, count"
                className="pill-input"
                {...form.register("uom")}
              />
              {form.formState.errors.uom && (
                <p className="ml-4 text-[10px] font-black text-destructive uppercase tracking-widest">{String(form.formState.errors.uom.message)}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target</label>
              <Input
                type="number"
                step="any"
                placeholder="0"
                className="pill-input"
                {...form.register("targetValue")}
              />
              {form.formState.errors.targetValue && (
                <p className="ml-4 text-[10px] font-black text-destructive uppercase tracking-widest">{String(form.formState.errors.targetValue.message)}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Thrust Area</label>
              <Input
                placeholder="e.g. Revenue"
                className="pill-input"
                {...form.register("thrustArea")}
              />
              {form.formState.errors.thrustArea && (
                <p className="ml-4 text-[10px] font-black text-destructive uppercase tracking-widest">{String(form.formState.errors.thrustArea.message)}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Department</label>
              <Input
                placeholder="e.g. Engineering"
                className="pill-input"
                {...form.register("department")}
              />
              {form.formState.errors.department && (
                <p className="ml-4 text-[10px] font-black text-destructive uppercase tracking-widest">{String(form.formState.errors.department.message)}</p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-8">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading} className="rounded-full">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="pill-button px-8">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {goalToEdit ? "Sync Logic" : "Deploy Initiative"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
