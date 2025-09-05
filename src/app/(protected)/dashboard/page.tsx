import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function LegacyDashboardRedirect() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (me?.role === "teacher") redirect("/professor/dashboard");
  if (me?.role === "student") redirect("/aluno/dashboard");
  redirect("/login?err=role");
}
