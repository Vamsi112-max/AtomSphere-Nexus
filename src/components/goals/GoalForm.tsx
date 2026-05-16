"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { goalsFormSchema, GoalFormValues } from "@/lib/validations/goals";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Loader2, Target } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { logAuditAction } from "@/lib/audit";

export function GoalForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalsFormSchema),
    defaultValues: {
      goals: [
        {
          title: "",
          description: "",
          uom: "",
          targetValue: 0,
          weightage: 10,
          thrustArea: "",
        }
      ]
    },
    mode: "onChange"
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "goals",
  });

  const watchGoals = form.watch("goals");
  const currentTotalWeightage = watchGoals.reduce((sum, goal) => sum + (Number(goal.weightage) || 0), 0);
  const isOverWeightage = currentTotalWeightage > 100;
  const isExactWeightage = currentTotalWeightage === 100;

  const onSubmit = async (values: GoalFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const goalsToInsert = values.goals.map((goal) => ({
        employee_id: user.id,
        title: goal.title,
        description: goal.description,
        uom: goal.uom,
        target: goal.targetValue,
        weightage: goal.weightage,
        thrust_area: goal.thrustArea,
        status: "pending",
        quarter: `Q${Math.floor((new Date().getMonth() + 3) / 3)}`,
      }));

      const { data, error } = await supabase.from('goals').insert(goalsToInsert).select();
      
      if (error) throw error;

      if (data) {
        data.forEach((insertedGoal, index) => {
          logAuditAction({
            action: 'CREATE_GOAL',
            userId: user.id,
            userName: user.user_metadata?.full_name || "User",
            userEmail: user.email || "",
            resourceId: insertedGoal.id,
            resourceType: 'goal',
            after: values.goals[index],
          });
        });
      }

      toast.success("Goals successfully created!");
      router.push("/my-goals");
    } catch (error: any) {
      toast.error(error.message || "Failed to create goals");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 rounded-[2rem] border border-black/5 sticky top-20 z-30 backdrop-blur-3xl shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-black text-primary flex items-center gap-2 uppercase tracking-widest text-[10px]">
            <Target className="h-4 w-4 text-primary" />
            Total Weightage Allocation
          </h3>
          <span className={`font-bold ${isOverWeightage ? 'text-destructive' : isExactWeightage ? 'text-green-500' : 'text-primary'}`}>
            {currentTotalWeightage}% / 100%
          </span>
        </div>
        <div className="h-4 w-full bg-black/20 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${isOverWeightage ? 'bg-destructive' : isExactWeightage ? 'bg-green-500' : 'bg-primary'}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(currentTotalWeightage, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        {form.formState.errors.goals?.root && (
          <p className="text-destructive text-sm mt-2 font-medium">
            {String((form.formState.errors.goals.root as any).message)}
          </p>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AnimatePresence>
          {fields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="glass-panel p-8 rounded-[2rem] border border-black/5 relative overflow-hidden shadow-sm"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
              
              <div className="flex justify-between items-start mb-6">
                <h4 className="text-lg font-bold text-primary">Goal #{index + 1}</h4>
                {fields.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => remove(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Input
                    placeholder="Goal Title"
                    className="bg-black/5 border-black/5 text-lg font-black text-primary placeholder:text-muted-foreground/30 rounded-xl h-12"
                    {...form.register(`goals.${index}.title`)}
                  />
                  {form.formState.errors.goals?.[index]?.title && (
                    <p className="text-xs text-destructive">{String(form.formState.errors.goals[index]?.title?.message)}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Textarea
                    placeholder="Provide a detailed description of this objective..."
                    className="bg-black/5 border-black/5 resize-none h-24 rounded-xl font-medium"
                    {...form.register(`goals.${index}.description`)}
                  />
                  {form.formState.errors.goals?.[index]?.description && (
                    <p className="text-xs text-destructive">{String(form.formState.errors.goals[index]?.description?.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unit of Measurement</label>
                  <Input
                    placeholder="e.g. %, $m, count"
                    className="pill-input"
                    {...form.register(`goals.${index}.uom`)}
                  />
                  {form.formState.errors.goals?.[index]?.uom && (
                    <p className="ml-4 text-[10px] font-black text-destructive uppercase tracking-widest">{String(form.formState.errors.goals[index]?.uom?.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Value</label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0"
                    className="pill-input"
                    {...form.register(`goals.${index}.targetValue`)}
                  />
                  {form.formState.errors.goals?.[index]?.targetValue && (
                    <p className="ml-4 text-[10px] font-black text-destructive uppercase tracking-widest">{String(form.formState.errors.goals[index]?.targetValue?.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Thrust Area</label>
                  <Input
                    placeholder="e.g. Revenue, Innovation"
                    className="pill-input"
                    {...form.register(`goals.${index}.thrustArea`)}
                  />
                  {form.formState.errors.goals?.[index]?.thrustArea && (
                    <p className="ml-4 text-[10px] font-black text-destructive uppercase tracking-widest">{String(form.formState.errors.goals[index]?.thrustArea?.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Weightage (%)</label>
                  <Input
                    type="number"
                    min={10}
                    max={100}
                    placeholder="10"
                    className={`pill-input ${form.formState.errors.goals?.[index]?.weightage ? 'border-destructive' : ''}`}
                    {...form.register(`goals.${index}.weightage`)}
                  />
                  {form.formState.errors.goals?.[index]?.weightage && (
                    <p className="ml-4 text-[10px] font-black text-destructive uppercase tracking-widest">{String(form.formState.errors.goals[index]?.weightage?.message)}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-6 border-t border-black/5">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5 px-8"
            onClick={() => {
              if (fields.length < 8) {
                append({
                  title: "",
                  description: "",
                  uom: "",
                  targetValue: 0,
                  weightage: 10,
                  thrustArea: "",
                });
              }
            }}
            disabled={fields.length >= 8}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Another Goal {fields.length >= 8 && "(Max 8)"}
          </Button>

          <Button 
            type="submit" 
            className="pill-button px-10 h-14"
            disabled={isSubmitting || currentTotalWeightage !== 100}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Deploy Missions"}
          </Button>
        </div>
      </form>
    </div>
  );
}
