// app/professor/redacoes/[essayId]/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Essay = {
  id: string;
  student_id: string;
  class_id: string | null;
  title: string | null;
  content: string | null;
  source_type: string | null;
  raw_file_path: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  essay_corrections: Correction[];
};

type Correction = {
  id: string;
  essay_id: string;
  corrected_by: string | null;
  method: string | null;
  score: number | null;
  rubric: any | null;
  feedback: string | null;
  export_file_path: string | null;
  created_at: string | null;
};

export default async function RedacaoPage({ params }: { params: { essayId: string } }) {
  const supabase = createClient();

  // Busca redação + correções (RLS garante escopo do professor)
  const { data: essay, error } = await supabase
    .from("essays")
    .select("*, essay_corrections(*)")
    .eq("id", params.essayId)
    .single();

  if (error) return <p className="text-red-600">Erro: {error.message}</p>;
  if (!essay) notFound();

  // (Opcional) pegar info do aluno
  const { data: student } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", essay.student_id)
    .maybeSingle();

  const corrections = (essay.essay_corrections ?? []).sort(
    (a: Correction, b: Correction) =>
      new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{essay.title ?? "Redação"}</h2>
          <div className="text-xs opacity-70">
            {student?.full_name ? <>Aluno: {student.full_name} · </> : null}
            Status: {essay.status ?? "—"} · Enviada em{" "}
            {essay.created_at ? new Date(essay.created_at).toLocaleString() : "—"}
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/professor/alunos/${essay.student_id}`} className="text-sm underline">
            ← Redações do aluno
          </Link>
          <Link href="/professor/turmas" className="text-sm underline">
            Minhas turmas
          </Link>
        </div>
      </div>

      {/* Texto da redação */}
      <section className="p-4 rounded-lg border">
        <h3 className="font-medium mb-2">Texto</h3>
        {essay.content ? (
          <article className="whitespace-pre-wrap leading-relaxed">{essay.content}</article>
        ) : (
          <p className="opacity-70">Sem conteúdo textual. {essay.raw_file_path ? "Foi enviado arquivo/imagem." : ""}</p>
        )}
        {essay.raw_file_path && (
          <div className="mt-3 text-sm">
            Arquivo original: <code className="px-1 py-0.5 bg-black/5 rounded">{essay.raw_file_path}</code>
          </div>
        )}
      </section>

      {/* Correções */}
      <section className="p-4 rounded-lg border">
        <h3 className="font-medium mb-3">Correções ({corrections.length})</h3>
        {corrections.length === 0 ? (
          <p className="opacity-70">Ainda não há correções.</p>
        ) : (
          <ul className="space-y-3">
            {corrections.map((c: Correction) => (   // 👈 tipado aqui
                <li key={c.id} className="p-3 rounded-md border">
                <div className="text-sm opacity-70 mb-1">
                    {c.created_at ? new Date(c.created_at).toLocaleString() : "—"} ·
                    {typeof c.score === "number" ? <> Nota: {c.score}</> : null}
                    {c.method ? <> · Método: {c.method}</> : null}
                </div>
                {c.feedback && <p className="whitespace-pre-wrap">{c.feedback}</p>}
                {c.export_file_path && (
                    <div className="text-xs mt-2">
                    Arquivo exportado:{" "}
                    <code className="px-1 py-0.5 bg-black/5 rounded">{c.export_file_path}</code>
                    </div>
                )}
                </li>
            ))}
            </ul>

        )}
      </section>
    </div>
  );
}
