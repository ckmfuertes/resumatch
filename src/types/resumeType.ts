import type { Resume } from "@prisma/client";

export interface ResumeWithSignedUrl extends Resume {
  signedUrl: string | null;
}
