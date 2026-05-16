"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { logAuditAction, AuditAction } from "@/lib/audit";

interface ApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goal: any | null;
  onSuccess: () => void;
}

export function ApprovalDialog({ isOpen, onClose, goal, onSuccess }: ApprovalDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [targetValue, setTargetValue] = useState<number>(0);
  const [weightage, setWeightage] = useState<number>(0);
  const { user } = useAuth();

  useEffect(() => {
    if (goal) {
      setTargetValue(goal.targetValue);
      setWeightage(goal.weightage);
      setFeedback(goal.managerFeedback || "");
    }
  }, [goal]);

  const handleClose = () => {
    setFeedback("");
    onClose();
  };

  const handleAction = async (action: 'approved' | 'rejected' | 'rework') => {
    if (!user || !goal) return;
    
    if ((action === 'rejected' || action === 'rework') && !feedback.trim()) {
      toast.error("Feedback is required for this action");
      return;
    }

    setIsLoading(true);
    setActionLoading(action);
    
    try {
      const isModified = targetValue !== goal.targetValue || weightage !== goal.weightage;
      const finalStatus = action === 'approved' && isModified ? 'approved_modified' : action;

      const { error } = await supabase.from('goals').update({
        status: finalStatus,
        target: targetValue,
        weightage: weightage,
        manager_feedback: feedback || null,
        approved_by: action === 'approved' ? user.id : null,
      }).eq('id', goal.id);

      if (error) throw error;

      const actionMap: Record<string, AuditAction> = {
        'approved': 'APPROVE_GOAL',
        'approved_modified': 'APPROVE_GOAL',
        'rejected': 'REJECT_GOAL',
        'rework': 'UPDATE_GOAL'
      };

      await logAuditAction({
        action: actionMap[finalStatus] || 'UPDATE_GOAL',
        userId: user.id,
        userName: user.user_metadata?.name || "Manager",
        userEmail: user.email || "",
        resourceId: goal.id,
        resourceType: 'goal',
        before: {
          status: goal.status,
          targetValue: goal.targetValue,
          weightage: goal.weightage
        },
        after: {
          status: finalStatus,
          targetValue: targetValue,
          weightage: weightage,
          feedback: feedback
        }
      });

      toast.success(`Goal ${action} successfully`);
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error("Failed to update goal status");
    } finally {
      setIsLoading(false);
      setActionLoading(null);
    }
  };

  if (!goal) return null;

  const isLocked = goal.status === 'approved' || goal.status === 'approved_modified';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px] glass-panel border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>Review Goal</span>
            <span className={`px-2 py-1 text-xs rounded-full uppercase ${
              goal.status === 'approved' || goal.status === 'approved_modified' ? 'bg-green-500/20 text-green-500' :
              goal.status === 'rejected' ? 'bg-destructive/20 text-destructive' :
              goal.status === 'rework' ? 'bg-orange-500/20 text-orange-500' :
              'bg-blue-500/20 text-blue-500'
            }`}>
              {goal.status}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground uppercase">Title</h4>
            <p className="font-semibold text-lg">{goal.title}</p>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground uppercase">Description</h4>
            <p className="text-sm bg-black/20 p-3 rounded-md border border-white/5">{goal.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground uppercase">Unit of Measurement</h4>
              <p className="font-medium">{goal.uom}</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground uppercase">Thrust Area</h4>
              <p className="font-medium">{goal.thrustArea}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground uppercase">Target Value</label>
              <Input 
                type="number" 
                value={targetValue} 
                onChange={(e) => setTargetValue(Number(e.target.value))}
                disabled={isLocked || isLoading}
                className="bg-black/20 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground uppercase">Weightage (%)</label>
              <Input 
                type="number" 
                value={weightage} 
                onChange={(e) => setWeightage(Number(e.target.value))}
                disabled={isLocked || isLoading}
                className="bg-black/20 border-white/10"
              />
            </div>
          </div>

          {!isLocked && (
            <div className="space-y-2 pt-4 border-t border-white/10">
              <label className="text-sm font-medium text-muted-foreground uppercase">Manager Feedback</label>
              <Textarea 
                placeholder="Required for Rejection or Rework requests..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isLoading}
                className="bg-black/20 border-white/10 resize-none h-24"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          {!isLocked ? (
            <>
              <Button 
                type="button" 
                variant="outline" 
                className="border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => handleAction('rejected')}
                disabled={isLoading}
              >
                {actionLoading === 'rejected' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                Reject
              </Button>
              <Button 
                type="button" 
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
                onClick={() => handleAction('rework')}
                disabled={isLoading}
              >
                {actionLoading === 'rework' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Rework
              </Button>
              <Button 
                type="button" 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleAction('approved')}
                disabled={isLoading}
              >
                {actionLoading === 'approved' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Approve
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={handleClose} className="border-white/20">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
