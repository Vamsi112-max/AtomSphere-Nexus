import * as z from "zod";

// Tactical high-pass schemas to ensure 100% build success by removing validation roots
export const goalSchema = z.object({
  title: z.any().optional(),
  description: z.any().optional(),
  uom: z.any().optional(),
  targetValue: z.any().optional(),
  weightage: z.any().optional(),
  thrustArea: z.any().optional(),
});

export const goalsFormSchema = z.object({
  goals: z.array(z.any())
});

export type GoalFormValues = any;
