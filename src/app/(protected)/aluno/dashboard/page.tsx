import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Row = {
  id: string;
  title: string | null;
  status: string | null;
  created_at: string | null;
  score: number | null;
  last_correction_at: string | null;
};

export default async function StudentDashboard() {
  const supabase = createClient();

  // quem está logado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 3 últimas redações do próprio aluno
  const { data: essays, error } = await supabase
    .from("v_student_essays")
    .select("id, title, status, created_at, score, last_correction_at")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    return <p className="text-red-600">Erro ao carregar redações: {error.message}</p>;
  }

  return (
    <section className="rounded-xl border p-4 md:p-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded-md border flex items-center justify-center">📝</div>
        <h2 className="text-lg font-semibold">Redações Recentes</h2>
      </div>
      <p className="text-sm opacity-70 mb-4">Suas últimas submissões</p>

      {!essays || essays.length === 0 ? (
        <div className="text-sm opacity-70">Você ainda não enviou nenhuma redação.</div>
      ) : (
        <ul className="space-y-3">
          {essays.map((e: Row) => (
            <li key={e.id} className="rounded-lg border p-4 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-medium truncate">{e.title ?? "Sem título"}</div>
                <div className="text-xs opacity-70">
                  {e.created_at ? new Date(e.created_at).toISOString().slice(0,10) : "—"}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* nota (se houver) */}
                {typeof e.score === "number" && (
                  <div className="text-right">
                    <div className="text-base font-bold">{e.score.toFixed(1)}/10</div>
                  </div>
                )}

                {/* badge de status */}
                <span
                  className={`text-xs px-2 py-1 rounded-md border ${
                    e.status === "corrected"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : e.status === "processing"
                      ? "bg-amber-50 border-amber-200 text-amber-700"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  {e.status === "corrected"
                    ? "Corrigida"
                    : e.status === "processing"
                    ? "Processando"
                    : "Enviada"}
                </span>

                <Link
                  href={`/aluno/minhas-redacoes/${e.id}`}
                  className="text-sm px-3 py-1 rounded-md border hover:bg-black/5"
                >
                  Abrir
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4">
        <Link href="/aluno/minhas-redacoes" className="text-sm underline">
          Ver todas as redações →
        </Link>
      </div>
    </section>
  );
}
