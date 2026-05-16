import * as z from "zod";

export const goalSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  uom: z.string().min(1, "Unit of Measurement is required."),
  targetValue: z.number({ coerce: true }).min(0, "Target value must be a positive number."),
  weightage: z.number({ coerce: true }).min(10, "Minimum weightage is 10% per goal.").max(100, "Maximum weightage is 100%."),
  thrustArea: z.string().min(1, "Thrust area is required."),
});

export const goalsFormSchema = z.object({
  goals: z.array(goalSchema)
    .min(1, "You must create at least one goal.")
    .max(8, "You cannot create more than 8 goals.")
}).superRefine((data, ctx) => {
  const totalWeightage = data.goals.reduce((sum, goal) => sum + (Number(goal.weightage) || 0), 0);
  
  if (totalWeightage !== 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Total weightage must equal exactly 100%. Current total: ${totalWeightage}%`,
      path: ["goals"],
    });
  }
});

export type GoalFormValues = z.infer<typeof goalsFormSchema>;
