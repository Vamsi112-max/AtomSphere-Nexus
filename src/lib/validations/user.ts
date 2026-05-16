import * as z from "zod";

export const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long."),
  email: z.string().email("Please enter a valid email address."),
  role: z.enum(["employee", "manager", "admin"]),
  department: z.string().optional(),
  managerId: z.string().optional(),
});
