import { getProfile, updateProfile, deleteProfile } from "@/services/profileService";
import { updateProfileSchema } from "@/validations/profileValidation";
import { HttpError } from "@/utils/error";
import type { Profile } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type ProfileApiSuccessResponse =
  | { success: true; data: Profile }
  | { success: true; data: undefined };

type ProfileApiErrorResponse = {
  success: false;
  error: string;
};

/**
 * GET /api/profile
 * Fetches the current authenticated user's profile
 */
export async function GET(): Promise<NextResponse<ProfileApiSuccessResponse | ProfileApiErrorResponse>> {
  try {
    // Call service
    const profile = await getProfile();

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: profile,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    // Handle error response
    const httpError = HttpError.from(error);
    return NextResponse.json(
      {
        success: false,
        error: httpError.message,
      },
      { status: httpError.status },
    );
  }
}

/**
 * PATCH /api/profile
 * Updates the current authenticated user's profile
 */
export async function PATCH(
  req: NextRequest,
): Promise<NextResponse<ProfileApiSuccessResponse | ProfileApiErrorResponse>> {
  try {
    // Parse JSON body
    const body = await req.json();

    // Validate with Zod
    const validatedData = updateProfileSchema.parse(body);

    // Call service
    const updatedProfile = await updateProfile(validatedData);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: updatedProfile,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    // Handle error response
    const httpError = HttpError.from(error);
    return NextResponse.json(
      {
        success: false,
        error: httpError.message,
      },
      { status: httpError.status },
    );
  }
}

/**
 * DELETE /api/profile
 * Deletes the current authenticated user's profile
 */
export async function DELETE(): Promise<NextResponse<ProfileApiSuccessResponse | ProfileApiErrorResponse>> {
  try {
    // Call service
    await deleteProfile();

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: undefined,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    // Handle error response
    const httpError = HttpError.from(error);
    return NextResponse.json(
      {
        success: false,
        error: httpError.message,
      },
      { status: httpError.status },
    );
  }
}
