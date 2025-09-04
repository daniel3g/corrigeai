"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/aluno/dashboard", label: "Dashboard", starts: "/aluno/dashboard" },
  { href: "/aluno/minhas-redacoes", label: "Minhas Redações", starts: "/aluno/minhas-redacoes" },
  { href: "/aluno/minhas-redacoes/new", label: "Nova Redação", starts: "/aluno/nova-redacao" }, // opcional
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top bar (mobile) */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b bg-background/80 backdrop-blur px-4 py-2">
        <span className="font-semibold">Painel do Aluno</span>
        <button onClick={() => setOpen(o => !o)} className="px-3 py-1 rounded-md border text-sm">
          Menu
        </button>
      </div>

      <aside className={`md:sticky md:top-0 md:h-[100dvh] md:w-64 md:shrink-0 md:border-r bg-background ${open ? "block" : "hidden"} md:block`}>
        <div className="p-4 border-b hidden md:block">
          <div className="text-lg font-semibold">Painel do Aluno</div>
          <div className="text-xs opacity-70">Navegação</div>
        </div>
        <nav className="p-3 space-y-1">
          {NAV.map(item => {
            const active = pathname.startsWith(item.starts);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-sm border ${active ? "bg-black/5 border-black/20 font-medium" : "hover:bg-black/5"}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
