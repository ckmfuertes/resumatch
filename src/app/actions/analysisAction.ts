"use server";

import { generateAnalysis } from "@/services/analysisService";
import { generateAnalysisInputSchema } from "@/validations/analysisValidation";
import { HttpError, ActionResponse } from "@/utils/error";
import type { GenerateAnalysisResult } from "@/types/analysisType";

/**
 * Server action to generate or update an analysis for an application.
 * @param applicationId - The ID of the application to analyze
 * @param resumeId - The ID of the resume to use for analysis
 * @returns An ActionResponse containing the analysis result or an error
 */
export async function generateAnalysisAction(
  formData: FormData,
): Promise<ActionResponse<GenerateAnalysisResult>> {
  try {
    // Parse raw form data
    const rawData = Object.fromEntries(formData);

    // Validate with Zod
    const validatedData = generateAnalysisInputSchema.parse(rawData);

    // Call service
    const analysisResult = await generateAnalysis(validatedData);

    // Return success response
    return {
      success: true,
      data: analysisResult,
    };
  } catch (error: unknown) {
    // Return error response
    return HttpError.from(error).toActionResponse();
  }
}
