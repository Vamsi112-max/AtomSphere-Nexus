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
      <DialogContent className="sm:max-w-[500px] glass-panel border-white/10">
        <DialogHeader>
          <DialogTitle>Review Check-in: {checkIn.quarter} {checkIn.year}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-black/20 p-4 rounded-md border border-white/5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Employee Progress</span>
              <span className={`px-2 py-1 text-[10px] rounded-full uppercase font-bold tracking-wider ${
                checkIn.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                checkIn.status === 'On Track' ? 'bg-blue-500/10 text-blue-500' :
                'bg-muted/10 text-muted-foreground'
              }`}>
                {checkIn.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mt-2">
              <div>
                <p className="text-xs text-muted-foreground">Target Value</p>
                <p className="font-medium">{checkIn.goal?.targetValue} {checkIn.goal?.uom}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Actual Value</p>
                <p className="font-medium">{checkIn.actualValue} {checkIn.goal?.uom}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground uppercase font-semibold">Employee Comment</label>
            <div className="p-3 bg-black/20 rounded-md border border-white/5 text-sm">
              {checkIn.employeeComment}
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase font-semibold">Manager Feedback</label>
              <Textarea
                placeholder="Provide constructive feedback on this update..."
                className="bg-black/20 border-white/10 resize-none h-24"
                {...form.register("managerComment")}
              />
              {form.formState.errors.managerComment && (
                <p className="text-xs text-destructive">{form.formState.errors.managerComment.message}</p>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Mark as Reviewed
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
