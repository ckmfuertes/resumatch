import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { PDFParse } from "pdf-parse";
import { getProfile } from "./profileService";
import { BadRequestError, InternalServerError, NotFoundError } from "@/utils/error";

/**
 * Adds a new resume for the authenticated user.
 *
 * @param resumeFile - The resume file to upload and parse
 * @returns The created resume record
 * @throws BadRequestError If file validation fails (type, size, or empty text)
 * @throws UnauthorizedError if user is not authenticated
 * @throws NotFoundError if profile doesn't exist
 * @throws InternalServerError If PDF parsing or upload fails
 */
export async function addResume(resumeFile: File) {
  // File validation
  if (resumeFile.type !== "application/pdf") {
    throw new BadRequestError("File must be a PDF");
  }
  if (resumeFile.size > 5 * 1024 * 1024) {
    throw new BadRequestError("File size exceeds 5MB limit");
  }

  // Get the authenticated user's profile
  const profile = await getProfile();

  // Check max 3 resumes
  const existingResumesCount = await prisma.resume.count({
    where: { profileId: profile.id },
  });

  if (existingResumesCount >= 3) {
    throw new BadRequestError(
      "Maximum 3 resumes allowed. Please delete an existing resume before uploading a new one.",
    );
  }

  // Parse PDF
  const parsedText = await parseResume(resumeFile);

  // Validate extracted content
  if (!parsedText || parsedText.trim().length === 0) {
    throw new BadRequestError("No scanned text. Make sure your resume is a text-based PDF.");
  }

  // Create the resume
  const resume = await prisma.resume.create({
    data: {
      profileId: profile.id,
      fileName: resumeFile.name,
      parsedText,
      fileKey: "", // Temporary placeholder
    },
  });

  // Track file key
  let uploadedFileKey: string | null = null;

  try {
    // Upload to storage
    const { fileKey } = await uploadResume(resumeFile, profile.userId);
    uploadedFileKey = fileKey;

    // Update database with actual fileKey
    return await prisma.resume.update({
      where: { id: resume.id },
      data: { fileKey },
    });
  } catch (error) {
    // Clean up the database record
    await prisma.resume.delete({ where: { id: resume.id } });

    // If the file was successfully uploaded but DB update failed, delete it from storage
    if (uploadedFileKey) {
      const supabase = await createClient();
      const { error: storageError } = await supabase.storage
        .from("resumes")
        .remove([uploadedFileKey]);

      if (storageError) {
        throw new InternalServerError(
          `Failed to delete file from storage: ${storageError.message}`,
        );
      }
    }

    throw error;
  }
}

/**
 * Retrieves all resumes for the authenticated user.
 *
 * @returns Array of resume records ordered by most recently uploaded
 * @throws UnauthorizedError if user is not authenticated
 * @throws NotFoundError if profile doesn't exist
 */
export async function getResumes() {
  // Get the authenticated user's profile
  const profile = await getProfile();

  // Retrieve resumes
  return await prisma.resume.findMany({
    where: { profileId: profile.id },
    orderBy: { uploadedAt: "desc" },
  });
}

/**
 * Retrieves a specific resume by ID for the authenticated user.
 *
 * @param resumeId - The ID of the resume to retrieve
 * @returns The resume record with a signed URL for viewing
 * @throws UnauthorizedError if user is not authenticated
 * @throws NotFoundError if profile doesn't exist or resume not found
 * @throws UnauthorizedError if resume doesn't belong to the user
 */
export async function getResumeById(resumeId: string) {
  // Get the authenticated user's profile
  const profile = await getProfile();

  // Check if the resume exists and belongs to the user
  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      profileId: profile.id,
    },
  });

  if (!resume) {
    throw new NotFoundError("Resume not found");
  }

  // Generate a signed URL for viewing (valid for 1 hour)
  const supabase = await createClient();
  let signedUrl = null;

  if (resume.fileKey && resume.fileKey !== "") {
    const { data: signedUrlData } = await supabase.storage
      .from("resumes")
      .createSignedUrl(resume.fileKey, 3600);

    signedUrl = signedUrlData?.signedUrl ?? null;
  }

  // Return the resume with signed URL
  return {
    ...resume,
    signedUrl,
  };
}

/**
 * Deletes a resume for the authenticated user.
 *
 * @param resumeId - The ID of the resume to delete
 * @returns The deleted resume record
 * @throws UnauthorizedError if user is not authenticated
 * @throws NotFoundError if resume doesn't exist or doesn't belong to user
 * @throws InternalServerError If storage deletion fails
 */
export async function deleteResume(resumeId: string) {
  // Get authenticated user's profile
  const profile = await getProfile();

  // Get the resume
  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      profile: { userId: profile.userId },
    },
    select: { fileKey: true },
  });

  if (!resume) {
    throw new NotFoundError("Resume not found");
  }

  // Delete from storage
  const supabase = await createClient();
  if (resume.fileKey && resume.fileKey !== "") {
    const { error: storageError } = await supabase.storage.from("resumes").remove([resume.fileKey]);

    if (storageError) {
      throw new InternalServerError(`Failed to delete file from storage: ${storageError.message}`);
    }
  }

  // Delete from database
  return await prisma.resume.delete({
    where: { id: resumeId },
  });
}

/**
 * Extracts text content from a resume file.
 *
 * @param resumeFile - The resume file to parse
 * @returns The extracted text content as a string
 * @throws InternalServerError If resume parsing fails
 */
async function parseResume(resumeFile: File): Promise<string> {
  // Convert to buffer
  const bytes = await resumeFile.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Initialize PDF parser
  const parser = new PDFParse({ data: buffer });

  try {
    // Extract text from the resume
    const result = await parser.getText();
    return result.text;
  } catch (error) {
    // Throw an internal server error if parsing fails
    throw new InternalServerError(
      error instanceof Error ? error.message : "Failed to parse resume",
    );
  } finally {
    // Cleanup
    await parser.destroy();
  }
}

/**
 * Uploads a resume file to Supabase storage.
 *
 * @param resumeFile - The resume file to upload
 * @param userId - The user ID (used for folder organization)
 * @returns The storage key of the uploaded file
 * @throws BadRequestError If upload fails due to client error
 */
async function uploadResume(resumeFile: File, userId: string): Promise<{ fileKey: string }> {
  // Create Supabase server client
  const supabase = await createClient();

  // Generate a unique file path using userId and timestamp
  const timestamp = Date.now();
  const safeFileName = resumeFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${userId}/${timestamp}-${safeFileName}`;

  // Convert File to buffer for upload
  const bytes = await resumeFile.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Upload to Supabase storage bucket "resumes"
  const { error: uploadError } = await supabase.storage.from("resumes").upload(filePath, buffer, {
    contentType: "application/pdf",
    cacheControl: "31536000",
    upsert: false,
  });

  // Throw an error if upload fails
  if (uploadError) {
    throw new InternalServerError(`Failed to upload resume: ${uploadError.message}`);
  }

  return {
    fileKey: filePath,
  };
}
