import { signUpUser } from "@/services/authService";
import { signUpSchema } from "@/validations/authValidation";
import { HttpError } from "@/utils/error";
import type { AuthUser } from "@/types/authType";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/signup
 * Registers a new user with email and password
 * @param req - The request containing fullName, email, and password in JSON body
 * @returns JSON response with new user or error
 */
export async function POST(
  req: NextRequest,
): Promise<NextResponse<{ success: boolean; data?: AuthUser; error?: string }>> {
  try {
    // Parse JSON body
    const body = await req.json();

    // Validate with Zod
    const validatedData = signUpSchema.parse(body);

    // Call service
    const user = await signUpUser(validatedData);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 201 },
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
