import { loginUser } from "@/services/authService";
import { loginSchema } from "@/validations/authValidation";
import { HttpError } from "@/utils/error";
import type { AuthUser } from "@/types/authType";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/login
 * Authenticates a user with email and password
 * @param req - The request containing email and password in JSON body
 * @returns JSON response with authenticated user or error
 */
export async function POST(
  req: NextRequest,
): Promise<NextResponse<{ success: boolean; data?: AuthUser; error?: string }>> {
  try {
    // Parse JSON body
    const body = await req.json();

    // Validate with Zod
    const validatedData = loginSchema.parse(body);

    // Call service
    const user = await loginUser(validatedData);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: user,
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
