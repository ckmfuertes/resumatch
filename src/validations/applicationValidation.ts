import { z } from "zod";
import { Status, EmploymentType, WorkArrangement } from "@prisma/client";

export const addApplicationSchema = z.object({
  jobPosition: z
    .string()
    .trim()
    .min(1, "Job position is required")
    .max(200, "Job position is too long"),

  company: z.string().trim().min(1, "Company is required").max(200, "Company name is too long"),

  location: z
    .string()
    .trim()
    .max(200, "Location is too long")
    .transform((val) => val || null)
    .optional(),

  status: z.enum(Status).default(Status.Bookmarked),

  jobDescription: z
    .string()
    .trim()
    .max(5000, "Job description is too long")
    .transform((val) => val || null)
    .optional(),

  employmentType: z.enum(EmploymentType).default(EmploymentType.NotSpecified),

  workArrangement: z.enum(WorkArrangement).default(WorkArrangement.NotSpecified),

  jobUrl: z
    .preprocess(
      (val) => (val === "" || val === undefined || val === null ? null : val),
      z.string().trim().url("Please enter a valid URL").nullable(),
    )
    .transform((val) => val || null)
    .optional(),

  applicationDate: z
    .preprocess((val) => (val ? new Date(val as string) : null), z.date().nullable())
    .optional(),

  deadlineDate: z
    .preprocess((val) => (val ? new Date(val as string) : null), z.date().nullable())
    .optional(),

  excitementLevel: z.preprocess(
    (val) => (val ? Number(val) : 0),
    z.number().int().min(0).max(5).default(0),
  ),
});

export const updateApplicationSchema = addApplicationSchema.partial();
