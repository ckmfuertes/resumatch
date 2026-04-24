import { geminiAi } from "@/lib/gemini/client";
import { buildAnalysisPrompt } from "@/lib/gemini/prompts";
import { InternalServerError } from "@/utils/error";
import { geminiAnalysisSchema } from "@/validations/analysisValidation";
import type { GenerateAnalysisInput, GeminiAnalysisResult } from "@/types/analysisType";

/**
 * Calls the Gemini API to analyze the resume against the job description.
 * @param input - The input containing resume and job description details.
 * @returns A promise resolving to the analysis result.
 * @throws InternalServerError if the response from Gemini is invalid or cannot be parsed.
 */
export async function callGeminiAnalysis(
  input: GenerateAnalysisInput,
): Promise<GeminiAnalysisResult> {
  // Build the prompt
  const prompt = buildAnalysisPrompt(input.analyzedResumeText, input.analyzedJobDescription);

  // Call the Gemini API
  const response = await geminiAi.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text;
  if (!text) {
    throw new InternalServerError("Empty response from Gemini API");
  }

  // Extract JSON from the response text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new InternalServerError("Failed to parse Gemini response");
  }

  const result = JSON.parse(jsonMatch[0]);

  // Validate output with Zod
  return geminiAnalysisSchema.parse(result);
}
