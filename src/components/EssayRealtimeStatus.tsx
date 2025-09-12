"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  essayId: string;
  initialStatus: string;
};

const STATUS_LABEL: Record<string, string> = {
  queued: "Na fila",
  processing: "Processando",
  corrected: "Corrigida",
  failed: "Falhou",
  draft: "Rascunho",
};

export default function EssayRealtimeStatus({ essayId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    const supabase = createClient();

    // UPDATE no status da própria redação (fonte autoritativa)
    const chEssay = supabase
      .channel(`essays-status-${essayId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "essays", filter: `id=eq.${essayId}` },
        (payload) => {
          const newStatus = (payload.new as any)?.status;
          if (typeof newStatus === "string") setStatus(newStatus);
        }
      )
      .subscribe();

    // Opcional/otimista: ao inserir uma correção, já marcar como corrected
    const chCorr = supabase
      .channel(`essay-corrections-${essayId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "essay_corrections", filter: `essay_id=eq.${essayId}` },
        () => setStatus((s) => (s === "corrected" ? s : "corrected"))
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chEssay);
      supabase.removeChannel(chCorr);
    };
  }, [essayId]); // <- sem 'supabase' nas deps

  const label = STATUS_LABEL[status] ?? status;

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
        status === "corrected" && "bg-green-100 text-green-700",
        status === "processing" && "bg-yellow-100 text-yellow-700",
        status === "queued" && "bg-slate-100 text-slate-700",
        status === "failed" && "bg-red-100 text-red-700",
      ].join(" ")}
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}
