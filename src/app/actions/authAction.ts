"use server";

import {
  loginUser,
  logoutUser,
  signUpUser,
  forgotPassword,
  resetPassword,
} from "@/services/authService";
import {
  loginSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/validations/authValidation";
import { HttpError, ActionResponse } from "@/utils/error";
import type { AuthUser } from "@/types/authType";

/**
 * Server action to handle user login.
 * @param formData - The raw form data from the login form
 * @returns An ActionResponse containing the authenticated user or an error
 */
export async function loginUserAction(formData: FormData): Promise<ActionResponse<AuthUser>> {
  try {
    // Parse raw form data
    const rawData = Object.fromEntries(formData);

    // Validate with Zod
    const validatedData = loginSchema.parse(rawData);

    // Call service
    const user = await loginUser(validatedData);

    // Return success response
    return {
      success: true,
      data: user,
    };
  } catch (error: unknown) {
    // Return error response
    return HttpError.from(error).toActionResponse();
  }
}

/**
 * Server action to handle user signup.
 * @param formData - The raw form data from the signup form
 * @return An ActionResponse containing the newly created user or an error
 */
export async function signUpUserAction(formData: FormData): Promise<ActionResponse<AuthUser>> {
  try {
    // Parse raw form data
    const rawData = Object.fromEntries(formData);

    // Validate with Zod
    const validatedData = signUpSchema.parse(rawData);

    // Call service
    const user = await signUpUser(validatedData);

    // Return success response
    return {
      success: true,
      data: user,
    };
  } catch (error: unknown) {
    // Return error response
    return HttpError.from(error).toActionResponse();
  }
}

/**
 * Server action to handle user logout.
 * @returns An ActionResponse indicating success or containing an error
 */
export async function logoutAction(): Promise<ActionResponse<void>> {
  try {
    // Call service
    await logoutUser();

    // Return success response
    return { success: true, data: undefined };
  } catch (error: unknown) {
    // Return error response
    return HttpError.from(error).toActionResponse();
  }
}

/**
 * Server action to handle forgot password request.
 * @param formData - The raw form data from the forgot password form
 * @return An ActionResponse indicating success or containing an error
 */
export async function forgotPasswordAction(formData: FormData): Promise<ActionResponse<void>> {
  try {
    // Parse raw form data
    const rawData = Object.fromEntries(formData);

    // Validate with Zod
    const validatedData = forgotPasswordSchema.parse(rawData);

    // Call service
    await forgotPassword(validatedData);

    // Return success response
    return {
      success: true,
      data: undefined,
    };
  } catch (error: unknown) {
    // Return error response
    return HttpError.from(error).toActionResponse();
  }
}

/**
 * Server action to handle password reset.
 * @param formData - The raw form data from the reset password form
 * @return An ActionResponse indicating success or containing an error
 */
export async function resetPasswordAction(formData: FormData): Promise<ActionResponse<void>> {
  try {
    // Parse raw form data
    const rawData = Object.fromEntries(formData);

    // Validate with Zod
    const validatedData = resetPasswordSchema.parse(rawData);

    // Call service
    await resetPassword(validatedData);

    // Return success response
    return {
      success: true,
      data: undefined,
    };
  } catch (error: unknown) {
    // Return error response
    return HttpError.from(error).toActionResponse();
  }
}
