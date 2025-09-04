import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Row = {
  id: string;
  title: string | null;
  status: string | null;
  created_at: string | null;
  // da view v_student_essays
  score: number | null;
  last_correction_at: string | null;
};

function fmtDateISO(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toISOString().slice(0, 10); // AAAA-MM-DD (igual ao mock)
}

export default async function MinhasRedacoesPage() {
  const supabase = createClient();

  // auth
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // pega tudo do próprio aluno, ordenado por mais recente
  // usando a VIEW para já vir score/last_correction
  const { data: essays, error } = await supabase
    .from("v_student_essays")
    .select("id, title, status, created_at, score, last_correction_at")
    .eq("student_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <section className="p-6">
        <h1 className="text-2xl font-bold mb-2">Minhas Redações</h1>
        <p className="text-red-600">Erro ao carregar: {error.message}</p>
      </section>
    );
  }

  return (
    <section className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Minhas Redações</h1>
        <Link
          href="/aluno/minhas-redacoes/new"
          className="rounded bg-black text-white px-3 py-2 text-sm"
        >
          Nova redação
        </Link>
      </div>

      {/* Card-container em estilo da referência */}
      <div className="rounded-2xl border p-4 md:p-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-md border flex items-center justify-center">📝</div>
          <h2 className="text-lg font-semibold">Redações Recentes</h2>
        </div>
        <p className="text-sm opacity-70 mb-4">Suas últimas submissões</p>

        {(!essays || essays.length === 0) ? (
          <div className="text-sm opacity-70">Você ainda não enviou nenhuma redação.</div>
        ) : (
          <ul className="space-y-3">
            {essays!.map((e: Row) => (
              <li
                key={e.id}
                className="rounded-xl border p-4 flex items-center justify-between"
              >
                <div className="min-w-0 flex items-start gap-3">
                  <span className="mt-1">✅</span>
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      <Link
                        href={`/aluno/minhas-redacoes/${e.id}`}
                        className="hover:underline"
                      >
                        {e.title ?? "Sem título"}
                      </Link>
                    </div>
                    <div className="text-xs opacity-70">
                      {fmtDateISO(e.created_at)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* nota, quando houver */}
                  {typeof e.score === "number" ? (
                    <div className="text-right">
                      <div className="text-base font-extrabold">
                        {e.score.toFixed(1)}/10
                      </div>
                    </div>
                  ) : (
                    <div className="w-[52px]" />
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Link para ver todas – aqui já é a própria página, mas mantive o CTA */}
      <div>
        <Link href="/aluno/minhas-redacoes" className="text-sm underline">
          Atualizar lista →
        </Link>
      </div>
    </section>
  );
}