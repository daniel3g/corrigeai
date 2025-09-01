// app/minhas-redacoes/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServer as createServerClient } from "@/lib/supabase/server";
import EssayRealtimeStatus from "@/components/EssayRealtimeStatus";
import EssayCorrections from "@/components/EssayCorrections";

type SignedFile = { name: string; url: string };

async function getEssayData(id: string) {
  const supabase = createServerClient();

  // 1) Redação (RLS garante que só o dono vê)
  const { data: essay, error: essayErr } = await supabase
    .from("essays")
    .select("id, title, content, status, created_at, student_id")
    .eq("id", id)
    .single();

  if (essayErr || !essay) return { essay: null as any, files: [] as { name: string }[], corrections: [] as any[] };

  // 2) Arquivos no bucket essays/<id>/
  const { data: filesList } = await supabase.storage
    .from("essays")
    .list(`${essay.id}`, { limit: 50, sortBy: { column: "name", order: "asc" } });

  const files = filesList ?? [];

  // 3) Correções
  const { data: corrections } = await supabase
    .from("essay_corrections")
    .select("id, created_at, score, feedback, rubric")
    .eq("essay_id", essay.id)
    .order("created_at", { ascending: false });

  return { essay, files, corrections: corrections ?? [] };
}

async function getSignedUrls(id: string, names: string[]): Promise<SignedFile[]> {
  const supabase = createServerClient();
  if (names.length === 0) return [];

  const { data } = await supabase.storage
    .from("essays")
    .createSignedUrls(
      names.map((n) => `${id}/${n}`),
      60 * 30 // 30 min
    );

  // d.path pode ser null na tipagem; tratamos com fallback seguro
  return (data ?? []).map((d) => ({
    name: (d.path ?? "").split("/").pop() || "arquivo",
    url: d.signedUrl,
  }));
}

export default async function Page({ params }: { params: { id: string } }) {
  const { essay, files, corrections } = await getEssayData(params.id);
  if (!essay) notFound();

  const signed = await getSignedUrls(essay.id, files.map((f) => f.name));

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{essay.title ?? "Redação"}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enviada em {new Date(essay.created_at).toLocaleString("pt-BR")}
          </p>
        </div>

        {/* Status em tempo real */}
        <EssayRealtimeStatus essayId={essay.id} initialStatus={essay.status} />
      </div>

      {/* Conteúdo enviado */}
      <section className="mb-8 rounded-2xl border p-4">
        <h2 className="mb-3 text-lg font-medium">Conteúdo enviado</h2>
        {essay.content ? (
          <article className="whitespace-pre-wrap text-slate-800">{essay.content}</article>
        ) : (
          <p className="text-slate-500">Sem texto (apenas arquivo).</p>
        )}
      </section>

      {/* Arquivos anexados */}
      <section className="mb-8 rounded-2xl border p-4">
        <h2 className="mb-3 text-lg font-medium">Arquivos</h2>
        {signed.length > 0 ? (
          <ul className="space-y-2">
            {signed.map((f) => (
              <li key={f.url}>
                <Link
                  href={f.url}
                  target="_blank"
                  className="underline underline-offset-4 hover:opacity-80"
                >
                  {f.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">Nenhum arquivo.</p>
        )}
      </section>

      {/* Correção (quando existir) */}
      <section className="mb-8 rounded-2xl border p-4">
        <h2 className="mb-3 text-lg font-medium">Correção</h2>
        <EssayCorrections essayId={essay.id} initialCorrections={corrections} />
      </section>
    </div>
  );
}
