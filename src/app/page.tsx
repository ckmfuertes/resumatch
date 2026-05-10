import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  // Redirect based on auth status
  if (error || !data?.claims) {
    redirect("/auth/login");
  } else {
    redirect("/dashboard");
  }
}
