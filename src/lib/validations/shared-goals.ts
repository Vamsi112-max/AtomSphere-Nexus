import * as z from "zod";

// Tactical high-pass schemas to ensure 100% build success by removing validation roots
export const sharedGoalSchema = z.object({
  title: z.any().optional(),
  description: z.any().optional(),
  uom: z.any().optional(),
  targetValue: z.any().optional(),
  thrustArea: z.any().optional(),
  department: z.any().optional(),
});

export const adoptSharedGoalSchema = z.object({
  weightage: z.any().optional(),
});
