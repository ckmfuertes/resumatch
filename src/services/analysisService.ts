import { prisma } from "@/lib/prisma";
import { getProfile } from "./profileService";
import { callGeminiAnalysis } from "./geminiService";
import { getRemainingAnalysisQuota, consumeAnalysisQuota } from "@/lib/upstash/rate-limit";
import { NotFoundError, RateLimitError } from "@/utils/error";
import { geminiAnalysisInputSchema } from "@/validations/analysisValidation";
import type { Analysis } from "@prisma/client";
import type { GenerateAnalysisInput, GenerateAnalysisResult } from "@/types/analysisType";

/**
 * Checks if an existing analysis matches the current resume and job description.
 * @returns The existing analysis if unchanged, null otherwise
 */
async function hasSameAnalysisContent(
  applicationId: string,
  currentResumeText: string,
  currentJobDescription: string,
): Promise<Analysis | null> {
  const existing = await prisma.analysis.findUnique({
    where: { applicationId },
  });

  if (
    existing &&
    existing.analyzedResumeText === currentResumeText &&
    existing.analyzedJobDescription === currentJobDescription
  ) {
    return existing;
  }

  return null;
}

/**
 * Generates or updates an analysis for an application using the selected resume.
 * @param input - Contains applicationId and resumeId
 * @returns The created or updated Analysis record
 * @throws NotFoundError if application or resume not found, or user doesn't own them
 * @throws RateLimitError if user has exceeded their monthly quota
 */
export async function generateAnalysis(
  input: GenerateAnalysisInput,
): Promise<GenerateAnalysisResult> {
  // Get authenticated user's profile
  const profile = await getProfile();

  // Check if application exists and belongs to user
  const existingApplication = await prisma.application.findFirst({
    where: {
      id: input.applicationId,
      profileId: profile.id,
    },
  });

  if (!existingApplication) {
    throw new NotFoundError("Application not found or does not belong to user");
  }

  // Check if resume exists and belongs to user
  const resume = await prisma.resume.findFirst({
    where: {
      id: input.resumeId,
      profileId: profile.id,
    },
  });

  if (!resume) {
    throw new NotFoundError("Resume not found or does not belong to user");
  }

  // Check if analysis already exists with same content
  const existingAnalysis = await hasSameAnalysisContent(
    input.applicationId,
    resume.parsedText,
    existingApplication.jobDescription || "",
  );

  if (existingAnalysis) {
    return {
      analysis: existingAnalysis,
      isCached: true,
      usedQuota: false,
    };
  }

  // Validate input sizes before calling Gemini
  geminiAnalysisInputSchema.parse({
    analyzedResumeText: resume.parsedText,
    analyzedJobDescription: existingApplication.jobDescription || "",
  });

  // Check remaining quota
  const remainingQuota = await getRemainingAnalysisQuota(profile.userId);

  if (remainingQuota <= 0) {
    const currentMonth = new Date().toLocaleString("default", { month: "long" });
    throw new RateLimitError(
      `You've reached your 20 analysis limit for ${currentMonth}. Limits reset on the 1st of next month.`,
    );
  }

  // Call Gemini AI for analysis (may fail - doesn't consume quota)
  const aiResult = await callGeminiAnalysis({
    analyzedResumeText: resume.parsedText,
    analyzedJobDescription: existingApplication.jobDescription || "",
  });

  // After successful Gemini response, consume one quota
  await consumeAnalysisQuota(profile.userId);

  // Build analysis data payload for both update and create
  const analysisData = {
    resumeId: input.resumeId,
    analyzedResumeText: resume.parsedText,
    analyzedJobDescription: existingApplication.jobDescription || "",
    matchScore: aiResult.matchScore,
    matchSummary: aiResult.matchSummary,
    matchingSkills: aiResult.matchingSkills,
    missingSkills: aiResult.missingSkills,
    recommendation: aiResult.recommendation,
    modelVersion: "Gemini 3.1 Flash Lite",
  };

  // Upsert analysis (create or update)
  const analysis = await prisma.analysis.upsert({
    where: { applicationId: input.applicationId },
    update: {
      ...analysisData,
      analyzedAt: new Date(),
    },
    create: {
      ...analysisData,
      applicationId: input.applicationId,
    },
  });

  return {
    analysis,
    isCached: false,
    usedQuota: true,
  };
}
