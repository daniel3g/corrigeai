"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Correction = {
  id: string;
  created_at: string;
  score: number | null;
  feedback: string | null;
  rubric: Record<string, any> | null;
  meta: Record<string, any> | null;
};


type Props = {
  essayId: string;
  initial: Correction[];
};

export default function CorrectionsRealtimeList({ essayId, initial }: Props) {
  const supabase = createClient();
  const [items, setItems] = useState<Correction[]>(initial);

    useEffect(() => {
    const channel = supabase
        .channel(`essay-corrections-${essayId}`)
        .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "essay_corrections", filter: `essay_id=eq.${essayId}` },
        (payload) => {
            const c = payload.new as Correction & { essay_id: string };
            setItems((prev) => [c, ...prev]);
            try { document.getElementById("correcoes")?.scrollIntoView({ behavior: "smooth" }); } catch {}
        }
        );

    channel.subscribe(); // ✅

    return () => {
        void supabase.removeChannel(channel); // ✅ sem async
        // ou: channel.unsubscribe();
    };
    }, [essayId, supabase]);


  if (!items.length) {
    return <p className="text-slate-500">Ainda não há correção para esta redação. Assim que chegar, aparece aqui automaticamente.</p>;
  }

  return (
    <div id="correcoes" className="space-y-6">
      {items.map((c) => (
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
            <div className="prose max-w-none whitespace-pre-wrap">{c.feedback}</div>
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
