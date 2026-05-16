import * as z from "zod";

export const sharedGoalSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  uom: z.string().min(1, "Unit of Measurement is required."),
  targetValue: z.number({ coerce: true }).min(0, "Target value must be a positive number."),
  thrustArea: z.string().min(1, "Thrust area is required."),
  department: z.string().min(2, "Target department is required."),
});

export const adoptSharedGoalSchema = z.object({
  weightage: z.number({ coerce: true }).min(10, "Minimum weightage is 10%.").max(100, "Maximum weightage is 100%."),
});
