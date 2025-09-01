"use client";

import { useEffect, useState } from "react";
import createClient from "@/lib/supabase/client";

type Correction = {
  id: string;
  created_at: string;
  score: number | null;
  feedback: string | null;
  rubric: any | null;
  essay_id?: string; // opcional
};

export default function EssayCorrections({
  essayId,
  initialCorrections,
}: {
  essayId: string;
  initialCorrections: Correction[];
}) {
  const [corrections, setCorrections] = useState<Correction[]>(
    initialCorrections ?? []
  );

  useEffect(() => {
    const supabase = createClient();

    // Quando inserir uma nova correção, buscamos a linha completa e atualizamos o estado.
    const ch = supabase
      .channel(`corr-feed-${essayId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "essay_corrections", filter: `essay_id=eq.${essayId}` },
        async (payload) => {
          const insertedId = (payload.new as any)?.id;
          if (!insertedId) return;

          const { data, error } = await supabase
            .from("essay_corrections")
            .select("id, created_at, score, feedback, rubric")
            .eq("id", insertedId)
            .single();

          if (!error && data) {
            setCorrections((prev) => {
              // evita duplicar se o evento chegar duas vezes
              if (prev.some((c) => c.id === data.id)) return prev;
              // coloca no topo (ordem desc por created_at)
              return [data as Correction, ...prev];
            });
          }
        }
      )
      // (Opcional) se sua pipeline primeiro insere sem feedback e depois faz UPDATE com o texto:
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "essay_corrections", filter: `essay_id=eq.${essayId}` },
        (payload) => {
          const updated = payload.new as Correction;
          setCorrections((prev) =>
            prev.map((c) => (c.id === updated.id ? { ...c, feedback: updated.feedback, score: updated.score, rubric: updated.rubric } : c))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [essayId]);

  if (!corrections?.length) {
    return <p className="text-slate-500">Ainda não há correção para esta redação. Assim que chegar, aparece aqui automaticamente.</p>;
  }

  return (
    <div className="space-y-6">
      {corrections.map((c) => (
        <div key={c.id} className="rounded-xl border p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Recebida em {new Date(c.created_at).toLocaleString("pt-BR")}
            </p>
            {typeof c.score === "number" && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
                Nota: {c.score}
              </span>
            )}
          </div>

          {c.feedback && (
            <div className="prose max-w-none whitespace-pre-wrap">
              {c.feedback}
            </div>
          )}

          {c.rubric && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-slate-600">
                Ver rubrica/detalhes
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-slate-50 p-3 text-xs">
{JSON.stringify(c.rubric, null, 2)}
              </pre>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}
