"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { managerReviewSchema } from "@/lib/validations/check-ins";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ManagerReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  checkIn: any | null;
  onSuccess: () => void;
}

export function ManagerReviewDialog({ isOpen, onClose, checkIn, onSuccess }: ManagerReviewDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm<z.infer<typeof managerReviewSchema>>({
    resolver: zodResolver(managerReviewSchema),
    defaultValues: {
      managerComment: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof managerReviewSchema>) => {
    if (!user || !checkIn) return;
    setIsLoading(true);
    try {
      await supabase.from('goal_updates').update({
        manager_comment: values.managerComment,
        manager_reviewed: true,
      }).eq('id', checkIn.id);
      toast.success("Review submitted successfully");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to submit review");
    } finally {
      setIsLoading(false);
    }
  };

  if (!checkIn) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] glass-panel border-black/5 p-10">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-primary uppercase tracking-widest">Tactical Review</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-black/5 p-6 rounded-[2rem] border border-black/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-primary uppercase font-black tracking-widest">Operational Sync</span>
              <span className={`px-3 py-1 text-[10px] rounded-full uppercase font-black tracking-wider border ${
                checkIn.status === 'Completed' ? 'bg-green-500/10 text-green-600 border-green-500/10' :
                checkIn.status === 'On Track' ? 'bg-primary/10 text-primary border-primary/10' :
                'bg-orange-500/10 text-orange-600 border-orange-500/10'
              }`}>
                {checkIn.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-6 mt-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Target</p>
                <p className="font-black text-primary text-sm">{checkIn.goal?.targetValue} {checkIn.goal?.uom}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Actual</p>
                <p className="font-black text-primary text-sm">{checkIn.actualValue} {checkIn.goal?.uom}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="ml-4 text-[10px] text-muted-foreground uppercase font-black tracking-widest">Employee Narrative</label>
            <div className="p-6 bg-black/5 rounded-[2rem] border border-black/5 text-sm font-bold text-primary italic leading-relaxed">
              "{checkIn.employeeComment}"
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="ml-4 text-[10px] text-muted-foreground uppercase font-black tracking-widest">Manager Intelligence Feedback</label>
              <Textarea
                placeholder="Provide strategic feedback on this update..."
                className="rounded-[2rem] bg-black/5 border-black/5 min-h-[100px] px-6 py-4 focus:bg-white transition-all text-primary font-bold placeholder:text-muted-foreground/30"
                {...form.register("managerComment")}
              />
              {form.formState.errors.managerComment && (
                <p className="ml-4 text-[10px] font-black text-destructive uppercase tracking-widest">{String(form.formState.errors.managerComment.message)}</p>
              )}
            </div>

            <DialogFooter className="pt-8">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading} className="rounded-full">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="pill-button px-8">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Review
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
