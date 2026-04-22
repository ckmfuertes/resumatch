import { resetPassword } from "@/services/authService";
import { resetPasswordSchema } from "@/validations/authValidation";
import { HttpError } from "@/utils/error";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/reset-password
 * Resets a user's password
 * @param req - The request containing password in JSON body
 * @returns JSON response indicating success or error
 */
export async function POST(
  req: NextRequest,
): Promise<NextResponse<{ success: boolean; error?: string }>> {
  try {
    // Parse JSON body
    const body = await req.json();

    // Validate with Zod
    const validatedData = resetPasswordSchema.parse(body);

    // Call service
    await resetPassword(validatedData);

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
