"use server";

import { getProfile, updateProfile, deleteProfile } from "@/services/profileService";
import { updateProfileSchema } from "@/validations/profileValidation";
import { HttpError, ActionResponse } from "@/utils/error";
import type { Profile } from "@prisma/client";

/**
 * Server action to fetch the current authenticated user's profile.
 * @returns An ActionResponse containing the profile or an error
 */
export async function getProfileAction(): Promise<ActionResponse<Profile>> {
  try {
    // Call service
    const profile = await getProfile();

    // Return success response
    return {
      success: true,
      data: profile,
    };
  } catch (error: unknown) {
    // Return error response
    return HttpError.from(error).toActionResponse();
  }
}

/**
 * Server action to update the current authenticated user's profile.
 * @param formData - The raw form data from the profile form
 * @returns An ActionResponse containing the updated profile or an error
 */
export async function updateProfileAction(formData: FormData): Promise<ActionResponse<Profile>> {
  try {
    // Parse raw form data
    const rawData = Object.fromEntries(formData);

    // Validate with Zod
    const validatedData = updateProfileSchema.parse(rawData);

    // Call service
    const updatedProfile = await updateProfile(validatedData);

    // Return success response
    return {
      success: true,
      data: updatedProfile,
    };
  } catch (error: unknown) {
    // Return error response
    return HttpError.from(error).toActionResponse();
  }
}

/**
 * Server action to delete the current authenticated user's profile.
 * @returns An ActionResponse indicating success or containing an error
 */
export async function deleteProfileAction(): Promise<ActionResponse<void>> {
  try {
    // Call service
    await deleteProfile();

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
