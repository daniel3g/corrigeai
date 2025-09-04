import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StudentSidebar from "@/components/aluno/Sidebar";

export default async function AlunoLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (error || !me) redirect("/login");
  if (me.role !== "student") redirect("/");

  return (
    <div className="md:flex">
      <StudentSidebar />
      <main className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full">
        <header className="hidden md:flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-3">
            {me.avatar_url && <img src={me.avatar_url} alt="" className="w-8 h-8 rounded-full" />}
            <span className="text-sm opacity-80">{me.full_name}</span>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
