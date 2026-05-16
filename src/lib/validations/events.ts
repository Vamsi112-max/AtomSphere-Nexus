import * as z from "zod";

export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().optional(),
  date: z.string().min(1, "Please select a date."),
  type: z.enum(["general", "deadline", "meeting", "review"]),
});
