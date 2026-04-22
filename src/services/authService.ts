import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { UnauthorizedError, ConflictError, InternalServerError } from "@/utils/error";
import type {
  AuthUser,
  LoginInput,
  SignUpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/types/authType";

/**
 * Authenticates a user with email and password via Supabase.
 *
 * @param input - Login credentials (email, password)
 * @returns The authenticated user's ID and email
 * @throws UnauthorizedError if credentials are invalid
 * @throws ConflictError if email is not confirmed
 */
export async function loginUser(input: LoginInput): Promise<AuthUser> {
  // Destructure email and password from input
  const { email, password } = input;

  // Create Supabase server client
  const supabase = await createClient();

  // Attempt login
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Check Profile table to see if user exists but is unconfirmed
    const existingProfile = await prisma.profile.findUnique({
      where: { email },
      select: { emailConfirmed: true },
    });

    if (existingProfile && !existingProfile.emailConfirmed) {
      throw new ConflictError(
        "Please confirm your email address before logging in. Check your inbox for the confirmation link.",
      );
    }

    throw new UnauthorizedError("Invalid email or password");
  }

  if (!data.user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Return authenticated user data
  return {
    id: data.user.id,
    email: data.user.email ?? "",
  };
}

/**
 * Registers a new user with email and password.
 *
 * @param input - { fullName, email, password }
 * @throws ConflictError If email already exists (confirmed) or sends resend for unconfirmed
 * @throws InternalServerError If Supabase signup fails
 *
 * @returns The new user's ID and email
 */
export async function signUpUser(input: SignUpInput): Promise<AuthUser> {
  // Destructure fullName, email, and password from input
  const { fullName, email, password } = input;
  const supabase = await createClient();

  // Check if profile exists and get confirmation status
  const existingProfile = await prisma.profile.findUnique({
    where: { email },
    select: { emailConfirmed: true },
  });

  if (existingProfile) {
    // If profile exists but email not confirmed, resend confirmation
    if (!existingProfile.emailConfirmed) {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (resendError) {
        // Handle Supabase rate limit error
        if (
          resendError.message?.toLowerCase().includes("rate limit") ||
          resendError.status === 429
        ) {
          throw new ConflictError(
            "Too many email confirmation requests. Please try again in an hour.",
          );
        }

        // Handle other errors
        throw new InternalServerError(resendError.message || "Failed to resend confirmation email");
      }

      throw new ConflictError(
        "Please check your email to confirm your account. A new confirmation link has been sent.",
      );
    }

    // Profile exists and email is confirmed
    throw new ConflictError("An account with this email already exists");
  }

  // No profile exists - proceed with signup
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?next=/auth/login`,
    },
  });

  // Handle signup errors
  if (error) {
    // Handle Supabase rate limit error
    if (error.message?.toLowerCase().includes("rate limit") || error.status === 429) {
      throw new ConflictError("Too many signup attempts. Please try again in an hour.");
    }

    // Handle other errors
    throw new InternalServerError(error.message || "Failed to create account");
  }

  if (!data.user) {
    throw new InternalServerError("Failed to create account");
  }

  // Return the newly created user's ID and email
  return {
    id: data.user.id,
    email: data.user.email ?? "",
  };
}

/**
 * Logs out the current user.
 *
 * @throws InternalServerError If logout fails
 */
export async function logoutUser(): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new InternalServerError(error.message || "Failed to log out");
  }
}

/**
 * Sends a password reset email to the user.
 *
 * @param input - { email }
 * @throws ConflictError if too many requests
 * @throws InternalServerError if reset email fails
 *
 * @returns void (Email is sent via Supabase)
 */
export async function forgotPassword(input: ForgotPasswordInput): Promise<void> {
  // Destructure email from input
  const { email } = input;
  const supabase = await createClient();

  // Check if profile exists and get confirmation status
  const existingProfile = await prisma.profile.findUnique({
    where: { email },
    select: { id: true, emailConfirmed: true },
  });

  // If profile doesn't exist, silently return
  if (!existingProfile || !existingProfile.emailConfirmed) {
    return;
  }

  // Request password reset from Supabase
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    // Handle rate limiting
    if (error.message?.toLowerCase().includes("rate limit") || error.status === 429) {
      throw new ConflictError(
        "Too many password reset requests. Please try again in a few minutes.",
      );
    }

    // Handle other errors
    throw new InternalServerError(error.message || "Failed to send reset email");
  }
}

/**
 * Updates the user's password using the reset token from the email link.
 *
 * @param input - { password } - The new password
 * @throws UnauthorizedError if no authenticated session exists
 * @throws InternalServerError if password update fails
 *
 * @returns void (Password is updated in Supabase)
 */
export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  // Destructure password from input
  const { password } = input;
  const supabase = await createClient();

  // Get current user session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // If no authenticated user, throw unauthorized error
  if (userError || !user) {
    throw new UnauthorizedError(
      "Invalid or expired reset link. Please request a new password reset.",
    );
  }

  // Update user's password in Supabase
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    throw new InternalServerError(error.message || "Failed to update password");
  }
}
