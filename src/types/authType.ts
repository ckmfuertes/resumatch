import { z } from "zod";
import {
  loginSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/validations/authValidation";

export type AuthUser = {
  id: string;
  email: string;
};

export type LoginInput = z.infer<typeof loginSchema>;

export type SignUpInput = z.infer<typeof signUpSchema>;

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
