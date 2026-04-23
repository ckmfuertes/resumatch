import { z } from "zod";
import { addApplicationSchema, updateApplicationSchema } from "@/validations/applicationValidation";
import type { Application, Analysis } from "@prisma/client";

export type AddApplicationInput = z.infer<typeof addApplicationSchema>;

export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

export type ApplicationWithAnalysis = Application & {
  analysis: Analysis | null;
};
