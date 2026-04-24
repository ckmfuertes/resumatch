import { z } from "zod";
import { Analysis } from "@prisma/client";
import {
  generateAnalysisInputSchema,
  geminiAnalysisInputSchema,
  geminiAnalysisSchema,
} from "@/validations/analysisValidation";

export type GenerateAnalysisInput = z.infer<typeof generateAnalysisInputSchema>;

export type GenerateAnalysisResult = {
  analysis: Analysis;
  isCached: boolean;
  usedQuota: boolean;
};

export type GeminiAnalysisInput = z.infer<typeof geminiAnalysisInputSchema>;

export type GeminiAnalysisResult = z.infer<typeof geminiAnalysisSchema>;
