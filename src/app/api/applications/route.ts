import { addApplication, getApplications } from "@/services/applicationService";
import { addApplicationSchema } from "@/validations/applicationValidation";
import { HttpError } from "@/utils/error";
import type { Application } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type ApplicationsSuccessResponse =
  | { success: true; data: Application[] }
  | { success: true; data: Application };

type ApplicationsErrorResponse = {
  success: false;
  error: string;
};

/**
 * GET /api/applications
 * Retrieves all job applications for the authenticated user.
 */
export async function GET(): Promise<
  NextResponse<ApplicationsSuccessResponse | ApplicationsErrorResponse>
> {
  try {
    // Call service
    const applications = await getApplications();

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: applications,
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
 * POST /api/applications
 * Adds a new job application for the authenticated user.
 */
export async function POST(
  req: NextRequest,
): Promise<NextResponse<ApplicationsSuccessResponse | ApplicationsErrorResponse>> {
  try {
    // Parse JSON body
    const body = await req.json();

    // Validate with Zod
    const validatedData = addApplicationSchema.parse(body);

    // Call service
    const application = await addApplication(validatedData);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: application,
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
