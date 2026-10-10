import { z } from "zod";

/**
 * Common validation schemas according to PRD & form_templates_config.json.
 */
export const studentCommonDetailsSchema = z.object({
  full_name: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(80, "Full name must not exceed 80 characters")
    .regex(/^[a-zA-Z\s]+$/, "Only letters and spaces allowed"),
  class_year: z.enum(["FE", "SE", "TE", "BE"], {
    errorMap: () => ({ message: "Select a valid class year" }),
  }),
  branch: z.enum([
    "Computer Engineering",
    "IT",
    "Mechanical",
    "Civil",
    "Electrical",
    "E&TC",
  ], {
    errorMap: () => ({ message: "Select a valid branch" }),
  }),
  tuf_id: z
    .string()
    .min(1, "TUF ID is required")
    .max(30, "TUF ID too long"),
  division: z.string().optional(),
  academic_year: z.string().min(1, "Academic year is required"),
});

export type StudentCommonDetails = z.infer<typeof studentCommonDetailsSchema>;
