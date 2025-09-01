// app/professor/turmas/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type ClassRow = {
  id: string;
  code: string | null;
  name: string | null;
  year: number | null;
  metadata: any | null;
  created_at: string | null;
  updated_at: string | null;
};

export default async function TurmasPage() {
  const supabase = createClient();

  const { data: classes, error } = await supabase
    .from("v_teacher_classes")
    .select("*")
    .order("year", { ascending: false });

  if (error) {
    return <p className="text-red-600">Erro ao carregar turmas: {error.message}</p>;
  }

  if (!classes || classes.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-medium mb-3">Minhas Turmas</h2>
        <p>Nenhuma turma vinculada a este professor.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-medium mb-3">Minhas Turmas</h2>
      <ul className="divide-y rounded-lg border">
        {classes.map((c: ClassRow) => (
          <li key={c.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{c.name ?? "Turma sem nome"}</div>
              <div className="text-sm opacity-70">
                {c.code ? `Código: ${c.code} · ` : ""}Ano {c.year ?? "—"}
              </div>
            </div>
            <Link
              href={`/professor/turmas/${c.id}`}
              className="text-sm px-3 py-1 rounded-md border hover:bg-black/5"
            >
              Ver alunos
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
