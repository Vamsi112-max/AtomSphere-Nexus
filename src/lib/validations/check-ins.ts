import * as z from "zod";

export const checkInSchema = z.object({
  actualValue: z.coerce.number().min(0, "Actual value must be a positive number."),
  status: z.enum(["Not Started", "On Track", "Completed"], {
    required_error: "Please select a status.",
  }),
  employeeComment: z.string().min(10, "Please provide at least 10 characters of context for this update."),
});

export const managerReviewSchema = z.object({
  managerComment: z.string().min(10, "Please provide at least 10 characters of feedback."),
});
