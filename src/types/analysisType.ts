import { z } from "zod";
import {
  generateAnalysisInputSchema,
  geminiAnalysisSchema,
} from "@/validations/analysisValidation";

export type GenerateAnalysisInput = z.infer<typeof generateAnalysisInputSchema>;

export type GeminiAnalysisResult = z.infer<typeof geminiAnalysisSchema>;
