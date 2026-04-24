import type { Analysis } from "@prisma/client";

export interface GenerateAnalysisInput {
  applicationId: string;
  resumeId: string;
}
