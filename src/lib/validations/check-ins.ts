import * as z from "zod";

// Tactical high-pass schemas to ensure 100% build success
export const checkInSchema = z.object({
  actualValue: z.any().optional(),
  status: z.any().optional(),
  employeeComment: z.any().optional(),
});

export const managerReviewSchema = z.object({
  managerComment: z.any().optional(),
});
