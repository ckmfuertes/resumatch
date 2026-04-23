import {
  getApplicationById,
  updateApplication,
  deleteApplication,
} from "@/services/applicationService";
import { updateApplicationSchema } from "@/validations/applicationValidation";
import { HttpError } from "@/utils/error";
import type { Application } from "@prisma/client";
import type { ApplicationWithAnalysis } from "@/types/applicationType";
import { NextRequest, NextResponse } from "next/server";

type ApplicationByIdSuccessResponse =
  | { success: true; data: ApplicationWithAnalysis }
  | { success: true; data: Application }
  | { success: true; data: undefined };

type ApplicationByIdErrorResponse = {
  success: false;
  error: string;
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET /api/applications/[id]
 * Retrieves a specific application by ID for the authenticated user.
 */
export async function GET(
  _req: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApplicationByIdSuccessResponse | ApplicationByIdErrorResponse>> {
  try {
    const { id } = await context.params;

    // Call service
    const application = await getApplicationById(id);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: application,
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
 * PATCH /api/applications/[id]
 * Updates an existing job application for the authenticated user.
 */
export async function PATCH(
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApplicationByIdSuccessResponse | ApplicationByIdErrorResponse>> {
  try {
    const { id } = await context.params;

    // Parse JSON body
    const body = await req.json();

    // Validate with Zod
    const validatedData = updateApplicationSchema.parse(body);

    // Call service
    const application = await updateApplication(id, validatedData);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: application,
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
 * DELETE /api/applications/[id]
 * Deletes a job application for the authenticated user.
 */
export async function DELETE(
  _req: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ApplicationByIdSuccessResponse | ApplicationByIdErrorResponse>> {
  try {
    const { id } = await context.params;

    // Call service
    await deleteApplication(id);

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
