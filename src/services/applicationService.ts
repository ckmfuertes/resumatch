import { prisma } from "@/lib/prisma";
import { getProfile } from "./profileService";
import { validateDateNotInFuture, validateDateRange } from "@/utils/date";
import { NotFoundError } from "@/utils/error";
import type { Application } from "@prisma/client";
import type {
  AddApplicationInput,
  UpdateApplicationInput,
  ApplicationWithAnalysis,
} from "@/types/applicationType";

/**
 * Creates a new job application for the authenticated user.
 *
 * @param input - Validated application data from addApplicationSchema
 * @returns The created Application record
 * @throws UnauthorizedError if user is not authenticated
 * @throws NotFoundError if profile does not exist for the authenticated user
 * @throws ConflictError if application date is in the future or deadline is before application date
 */
export async function addApplication(input: AddApplicationInput): Promise<Application> {
  // Get the authenticated user's profile
  const profile = await getProfile();

  // Validate dates
  validateDateNotInFuture(input.applicationDate, "Application date");
  validateDateRange(input.applicationDate, input.deadlineDate, "Application date", "Deadline date");

  // Create application
  const application = await prisma.application.create({
    data: {
      profileId: profile.id,
      ...input,
    },
  });

  return application;
}

/**
 * Fetches all applications for the authenticated user.
 *
 * @returns Array of all applications for table display
 * @throws UnauthorizedError if user is not authenticated
 * @throws NotFoundError if profile does not exist for the authenticated user
 */
export async function getApplications(): Promise<Application[]> {
  // Get the authenticated user's profile
  const profile = await getProfile();

  // Fetch all applications for the user
  const applications = await prisma.application.findMany({
    where: {
      profileId: profile.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return applications;
}

/**
 * Fetches a single application by ID with its analysis (panel view).
 *
 * @param id - The application ID to fetch
 * @returns The Application record with associated analysis
 * @throws UnauthorizedError if user is not authenticated
 * @throws NotFoundError if profile or application not found
 */
export async function getApplicationById(id: string): Promise<ApplicationWithAnalysis> {
  // Get the authenticated user's profile
  const profile = await getProfile();

  // Fetch application with analysis
  const application = await prisma.application.findFirst({
    where: {
      id,
      profileId: profile.id,
    },
    include: {
      analysis: true,
    },
  });

  if (!application) {
    throw new NotFoundError("Application not found or does not belong to user");
  }

  return application;
}

/**
 * Updates an existing job application for the authenticated user.
 *
 * @param id - The application ID to update
 * @param input - Validated update data from updateApplicationSchema
 * @returns The updated Application record
 * @throws UnauthorizedError if user is not authenticated
 * @throws NotFoundError if profile or application not found
 * @throws ConflictError if application date is in the future or deadline is before application date
 */
export async function updateApplication(
  id: string,
  input: UpdateApplicationInput,
): Promise<Application> {
  // Get the authenticated user's profile
  const profile = await getProfile();

  // Check if application exists and belongs to user
  const existingApplication = await prisma.application.findFirst({
    where: {
      id,
      profileId: profile.id,
    },
  });

  if (!existingApplication) {
    throw new NotFoundError("Application not found or does not belong to user");
  }

  // Get the final dates
  const applicationDate = input.applicationDate ?? existingApplication.applicationDate;
  const deadlineDate = input.deadlineDate ?? existingApplication.deadlineDate;

  // Validate dates
  validateDateNotInFuture(applicationDate, "Application date");
  validateDateRange(applicationDate, deadlineDate, "Application date", "Deadline date");

  // Update application with spread input
  const application = await prisma.application.update({
    where: { id },
    data: input,
  });

  return application;
}

/**
 * Deletes a job application for the authenticated user.
 *
 * @param id - The application ID to delete
 * @throws UnauthorizedError if user is not authenticated
 * @throws NotFoundError if profile or application not found
 */
export async function deleteApplication(id: string): Promise<void> {
  // Get the authenticated user's profile
  const profile = await getProfile();

  // Check if application exists and belongs to user
  const existingApplication = await prisma.application.findFirst({
    where: {
      id,
      profileId: profile.id,
    },
  });

  if (!existingApplication) {
    throw new NotFoundError("Application not found or does not belong to user");
  }

  // Delete application
  await prisma.application.delete({
    where: { id },
  });
}
