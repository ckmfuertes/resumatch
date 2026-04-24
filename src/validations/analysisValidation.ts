import { z } from "zod";

export const generateAnalysisInputSchema = z.object({
  applicationId: z.string().uuid("Invalid application ID format"),

  resumeId: z.string().uuid("Invalid resume ID format"),

  analyzedResumeText: z
    .string()
    .min(1, "Resume text cannot be empty")
    .max(50000, "Resume text too large"),

  analyzedJobDescription: z
    .string()
    .min(1, "Job description cannot be empty")
    .max(50000, "Job description too large"),
});

export const geminiAnalysisSchema = z.object({
  matchScore: z.number().int().min(0).max(100),

  matchSummary: z.string().max(500),

  matchingSkills: z.array(z.string()).max(8),

  missingSkills: z.array(z.string()).max(8),

  recommendation: z.string().max(500),
});
