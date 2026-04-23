"use server";

import {
  addApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} from "@/services/applicationService";
import { addApplicationSchema, updateApplicationSchema } from "@/validations/applicationValidation";
import { HttpError, ActionResponse } from "@/utils/error";
import type { Application } from "@prisma/client";
import type { ApplicationWithAnalysis } from "@/types/applicationType";

/**
 * Server action to add a new job application for the authenticated user.
 * @param formData - The raw form data from the application form
 * @returns An ActionResponse containing the created application or an error
 */
export async function addApplicationAction(
  formData: FormData,
): Promise<ActionResponse<Application>> {
  try {
    // Parse raw form data
    const rawData = Object.fromEntries(formData);

    // Validate with Zod
    const validatedData = addApplicationSchema.parse(rawData);

    // Call service
    const application = await addApplication(validatedData);

    // Return success response
    return {
      success: true,
      data: application,
    };
  } catch (error: unknown) {
    // Return error response
    return HttpError.from(error).toActionResponse();
  }
}

/**
 * Server action to retrieve all job applications for the authenticated user.
 * @returns An ActionResponse containing an array of applications or an error
 */
export async function getApplicationsAction(): Promise<ActionResponse<Application[]>> {
  try {
    // Call service
    const applications = await getApplications();

    // Return success response
    return {
      success: true,
      data: applications,
    };
  } catch (error: unknown) {
    // Return error response
    return HttpError.from(error).toActionResponse();
  }
}

/**
 * Server action to retrieve a specific application by ID for the authenticated user.
 * @param id - The ID of the application to retrieve
 * @returns An ActionResponse containing the application with analysis or an error
 */
export async function getApplicationByIdAction(
  id: string,
): Promise<ActionResponse<ApplicationWithAnalysis>> {
  try {
    // Call service
    const application = await getApplicationById(id);

    // Return success response
    return {
      success: true,
      data: application,
    };
  } catch (error: unknown) {
    // Return error response
    return HttpError.from(error).toActionResponse();
  }
}

/**
 * Server action to update an existing job application for the authenticated user.
 * @param id - The ID of the application to update
 * @param formData - The raw form data from the application form
 * @returns An ActionResponse containing the updated application or an error
 */
export async function updateApplicationAction(
  id: string,
  formData: FormData,
): Promise<ActionResponse<Application>> {
  try {
    // Parse raw form data
    const rawData = Object.fromEntries(formData);

    // Validate with Zod
    const validatedData = updateApplicationSchema.parse(rawData);

    // Call service
    const application = await updateApplication(id, validatedData);

    // Return success response
    return {
      success: true,
      data: application,
    };
  } catch (error: unknown) {
    // Return error response
    return HttpError.from(error).toActionResponse();
  }
}

/**
 * Server action to delete a job application for the authenticated user.
 * @param id - The ID of the application to delete
 * @returns An ActionResponse indicating success or containing an error
 */
export async function deleteApplicationAction(id: string): Promise<ActionResponse<void>> {
  try {
    // Call service
    await deleteApplication(id);

    // Return success response
    return {
      success: true,
      data: undefined,
    };
  } catch (error: unknown) {
    // Return error response
    return HttpError.from(error).toActionResponse();
  }
}
