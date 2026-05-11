"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

import { loginUserAction } from "@/app/actions/authAction";
import { toast } from "sonner";

export default function LoginPage() {
  // Declare states and hooks
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Handle form submission
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        // Call action
        toast.loading("Logging in...");
        const result = await loginUserAction(formData);
        toast.dismiss();

        // If action failed, show error toast
        if (!result.success) {
          toast.error(result.error || "Login failed", {
            description: "Please check your credentials and try again.",
          });
          return;
        }

        // If action succeeded, show success toast
        toast.success("Welcome back!", {
          description: "You have successfully logged in.",
        });

        // Refresh router to update server state, then redirect
        router.push("/dashboard");
      } catch (err: unknown) {
        toast.dismiss();
        const errorMsg =
          err instanceof Error ? err.message : "Login failed due to an unexpected error.";
        toast.error(errorMsg);
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 sm:px-6">
      <div className="w-full max-w-md sm:max-w-lg">
        <Card className="w-full shadow-none border-none ring-0 bg-background">
          <CardHeader className="mb-6 text-center lg:text-start">
            <div className="flex justify-center mb-6 lg:hidden">
              <Image src="/resumatch-logo-ball.svg" alt="Resumatch Logo" width={48} height={48} />
            </div>

            <CardTitle className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
              Welcome back!
            </CardTitle>

            <CardDescription className="text-sm text-muted-foreground sm:text-base">
              Please enter your credentials to access your account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup className="space-y-2">
                {/* Email */}
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    size="lg"
                    name="email"
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    disabled={isPending}
                    required
                  />
                </Field>

                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>

                    {/* Forgot Password */}
                    <a
                      href="/auth/forgot-password"
                      className="ml-auto inline-block text-sm text-primary underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <Input
                      size="lg"
                      name="password"
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={isPending}
                      className="pr-10"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-lg"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </Field>

                {/* Login Button */}
                <Field>
                  <Button type="submit" size="lg" className="mt-4" disabled={isPending}>
                    {isPending ? "Logging in..." : "Log In"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>

            {/* Sign Up Navigation */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don’t have an account yet?{" "}
              <a
                href="/auth/sign-up"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign Up
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
