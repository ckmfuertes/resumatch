import { logoutUser } from "@/services/authService";
import { HttpError } from "@/utils/error";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/logout
 * Logs out the current user
 * @returns JSON response indicating success or error
 */
export async function POST(): Promise<NextResponse<{ success: boolean; error?: string }>> {
  try {
    // Call service
    await logoutUser();

    // Return success response
    return NextResponse.json(
      {
        success: true,
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
