import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { UnauthorizedError, NotFoundError } from "@/utils/error";
import type { Profile } from "@prisma/client";
import type { UpdateProfileInput } from "@/types/profileType";

/**
 * Get the currently authenticated user from Supabase.
 *
 * @returns The authenticated user object
 * @throws UnauthorizedError if no user is authenticated
 */
async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new UnauthorizedError("User is not authenticated");
  }

  return user;
}

/**
 * Fetches the current authenticated user's profile.
 *
 * @returns The user's complete Profile record
 * @throws UnauthorizedError if user is not authenticated
 * @throws NotFoundError if profile does not exist for the authenticated user
 */
export async function getProfile(): Promise<Profile> {
  // Get the currently authenticated user
  const user = await getCurrentUser();

  // Query profile by userId (foreign key to Supabase auth.users)
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  // If profile doesn't exist, throw not found error
  if (!profile) {
    throw new NotFoundError("Profile not found for the authenticated user");
  }

  // Return the complete profile record
  return profile;
}

/**
 * Updates the current authenticated user's profile.
 *
 * @param input - Validated profile update data
 * @returns The updated Profile record
 * @throws UnauthorizedError if user is not authenticated
 * @throws NotFoundError if profile does not exist for the authenticated user
 */
export async function updateProfile(input: UpdateProfileInput): Promise<Profile> {
  // Get the current user's profile
  const currentProfile = await getProfile();

  // Update profile with validated data
  return prisma.profile.update({
    where: { userId: currentProfile.userId },
    data: input,
  });
}

/**
 * Deletes the current authenticated user's profile.
 * This will cascade delete all related records (resumes, applications, analyses).
 * The Supabase trigger will automatically delete the corresponding auth.users record.
 *
 * @throws UnauthorizedError if user is not authenticated
 * @throws NotFoundError if profile does not exist for the authenticated user
 */
export async function deleteProfile(): Promise<void> {
  // Get the current user's profile (throws if not found)
  const currentProfile = await getProfile();

  // Delete profile (cascades to resumes, applications, analyses)
  await prisma.profile.delete({
    where: { userId: currentProfile.userId },
  });
}
