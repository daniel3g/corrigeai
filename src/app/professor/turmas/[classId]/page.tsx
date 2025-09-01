// app/professor/turmas/[classId]/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type StudentRow = {
  class_id: string;
  student_id: string;
  full_name: string | null;
  avatar_url: string | null;
  status: string | null;
  enrolled_at: string | null;
};

export default async function TurmaAlunosPage({ params }: { params: { classId: string } }) {
  const supabase = createClient();

  // (Opcional) validar se professor tem acesso à turma
  const { data: turmaOk, error: turmaErr } = await supabase
    .from("v_teacher_classes")
    .select("id")
    .eq("id", params.classId)
    .maybeSingle();

  if (turmaErr) return <p className="text-red-600">Erro: {turmaErr.message}</p>;
  if (!turmaOk) notFound();

  const { data: students, error } = await supabase
    .from("v_class_students")
    .select("*")
    .eq("class_id", params.classId)
    .order("full_name", { ascending: true });

  if (error) {
    return <p className="text-red-600">Erro ao carregar alunos: {error.message}</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-medium">Alunos da Turma</h2>
        <Link href="/professor/turmas" className="text-sm underline">← Minhas turmas</Link>
      </div>

      {(!students || students.length === 0) ? (
        <p>Nenhum aluno matriculado nesta turma.</p>
      ) : (
        <ul className="grid md:grid-cols-2 gap-3">
          {students.map((s: StudentRow) => (
            <li key={s.student_id} className="p-4 rounded-lg border flex items-center justify-between">
              <div className="flex items-center gap-3">
                {s.avatar_url ? (
                  <img src={s.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-black/10" />
                )}
                <div>
                  <div className="font-medium">{s.full_name ?? "Sem nome"}</div>
                  <div className="text-xs opacity-70">Status: {s.status ?? "—"}</div>
                </div>
              </div>
              <Link
                href={`/professor/alunos/${s.student_id}`}
                className="text-sm px-3 py-1 rounded-md border hover:bg-black/5"
              >
                Ver redações
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
