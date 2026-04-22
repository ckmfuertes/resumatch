import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name is too long")
    .regex(
      /^[a-zA-Z\s\.\-']+$/,
      "Name can only contain letters, spaces, dots, hyphens, and apostrophes",
    )
    .optional(),

  targetPosition: z
    .string()
    .trim()
    .max(200, "Target position is too long")
    .transform((val) => val || null)
    .optional(),

  targetEmploymentDate: z
    .preprocess((val) => (val ? new Date(val as string) : null), z.date().nullable())
    .optional(),

  targetSalary: z
    .preprocess(
      (val) => (val ? Number(val) : null),
      z.number().int().positive("Salary must be positive").nullable(),
    )
    .optional(),
});
