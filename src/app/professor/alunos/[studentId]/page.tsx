// app/professor/alunos/[studentId]/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type EssayRow = {
  id: string;
  student_id: string;
  class_id: string | null;
  title: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_correction_id: string | null;
  corrected_by: string | null;
  method: string | null;
  score: number | null;
  feedback: string | null;
  last_correction_at: string | null;
};

export default async function AlunoRedacoesPage({ params }: { params: { studentId: string } }) {
  const supabase = createClient();

  // (Opcional) dados do aluno para cabeçalho
  const { data: studentProfile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", params.studentId)
    .maybeSingle();

  // Lista das redações (respeita RLS: professor só vê se o aluno pertence às suas turmas)
  const { data: essays, error } = await supabase
    .from("v_student_essays")
    .select("*")
    .eq("student_id", params.studentId)
    .order("created_at", { ascending: false });

  if (error) return <p className="text-red-600">Erro: {error.message}</p>;
  if (!essays) notFound();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {studentProfile?.avatar_url ? (
            <img src={studentProfile.avatar_url} alt="" className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-black/10" />
          )}
          <div>
            <h2 className="text-xl font-medium">{studentProfile?.full_name ?? "Aluno"}</h2>
            <div className="text-xs opacity-70">ID: {params.studentId}</div>
          </div>
        </div>
        <Link href="/professor/turmas" className="text-sm underline">← Minhas turmas</Link>
      </div>

      {essays.length === 0 ? (
        <p>Este aluno ainda não possui redações.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {essays.map((e: EssayRow) => (
            <li key={e.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{e.title ?? "Sem título"}</div>
                <div className="text-xs opacity-70">
                  Status: {e.status ?? "—"}
                  {typeof e.score === "number" && (
                    <> · Última nota: {e.score}</>
                  )}
                  {e.last_correction_at && (
                    <> · Corrigida em {new Date(e.last_correction_at).toLocaleString()}</>
                  )}
                </div>
              </div>
              <Link
                href={`/professor/redacoes/${e.id}`}
                className="text-sm px-3 py-1 rounded-md border hover:bg-black/5"
              >
                Abrir
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
