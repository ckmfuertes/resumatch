import { z } from "zod";
import { updateProfileSchema } from "@/validations/profileValidation";

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
