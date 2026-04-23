"use server";

import { addResume, getResumes, getResumeById, deleteResume } from "@/services/resumeService";
import { HttpError, ActionResponse } from "@/utils/error";
import type { Resume } from "@prisma/client";
import type { ResumeWithSignedUrl } from "@/types/resumeType";

/**
 * Server action to add a new resume for the authenticated user.
 * @param resumeFile - The resume file to upload and parse
 * @returns An ActionResponse containing the created resume or an error
 */
export async function addResumeAction(resumeFile: File): Promise<ActionResponse<Resume>> {
  try {
    // Call service
    const resume = await addResume(resumeFile);

    // Return success response
    return {
      success: true,
      data: resume,
    };
  } catch (error: unknown) {
    // Return error response
    return HttpError.from(error).toActionResponse();
  }
}

/**
 * Server action to retrieve all resumes for the authenticated user.
 * @returns An ActionResponse containing an array of resumes or an error
 */
export async function getResumesAction(): Promise<ActionResponse<Resume[]>> {
  try {
    // Call service
    const resumes = await getResumes();

    // Return success response
    return {
      success: true,
      data: resumes,
    };
  } catch (error: unknown) {
    // Return error response
    return HttpError.from(error).toActionResponse();
  }
}

/**
 * Server action to retrieve a specific resume by ID for the authenticated user.
 * @param resumeId - The ID of the resume to retrieve
 * @returns An ActionResponse containing the resume or an error
 */
export async function getResumeByIdAction(
  resumeId: string,
): Promise<ActionResponse<ResumeWithSignedUrl>> {
  try {
    // Call service
    const resume = await getResumeById(resumeId);

    // Return success response
    return {
      success: true,
      data: resume,
    };
  } catch (error: unknown) {
    // Return error response
    return HttpError.from(error).toActionResponse();
  }
}

/**
 * Server action to delete a resume for the authenticated user.
 * @param resumeId - The ID of the resume to delete
 * @returns An ActionResponse indicating success or containing an error
 */
export async function deleteResumeAction(resumeId: string): Promise<ActionResponse<Resume>> {
  try {
    // Call service
    const deletedResume = await deleteResume(resumeId);

    // Return success response
    return {
      success: true,
      data: deletedResume,
    };
  } catch (error: unknown) {
    // Return error response
    return HttpError.from(error).toActionResponse();
  }
}
