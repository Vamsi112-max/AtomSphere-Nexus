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
      <DialogContent className="sm:max-w-[500px] glass-panel border-white/10">
        <DialogHeader>
          <DialogTitle>{goalToEdit ? "Edit Shared Goal" : "Create Shared Goal"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Goal Title"
              className="bg-black/20 border-white/10 font-medium"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Detailed Description"
              className="bg-black/20 border-white/10 resize-none h-20"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase font-semibold">UoM</label>
              <Input
                placeholder="%, $m, count"
                className="bg-black/20 border-white/10"
                {...form.register("uom")}
              />
              {form.formState.errors.uom && (
                <p className="text-xs text-destructive">{form.formState.errors.uom.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase font-semibold">Target</label>
              <Input
                type="number"
                step="any"
                placeholder="0"
                className="bg-black/20 border-white/10"
                {...form.register("targetValue")}
              />
              {form.formState.errors.targetValue && (
                <p className="text-xs text-destructive">{form.formState.errors.targetValue.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase font-semibold">Thrust Area</label>
              <Input
                placeholder="e.g. Revenue"
                className="bg-black/20 border-white/10"
                {...form.register("thrustArea")}
              />
              {form.formState.errors.thrustArea && (
                <p className="text-xs text-destructive">{form.formState.errors.thrustArea.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase font-semibold">Department</label>
              <Input
                placeholder="e.g. Engineering"
                className="bg-black/20 border-white/10"
                {...form.register("department")}
              />
              {form.formState.errors.department && (
                <p className="text-xs text-destructive">{form.formState.errors.department.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {goalToEdit ? "Save Changes" : "Push to Department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
