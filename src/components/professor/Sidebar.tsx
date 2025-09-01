"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = {
  href: string;
  label: string;
  match?: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/professor/turmas", label: "Minhas turmas", match: (p) => p.startsWith("/professor/turmas") },
  { href: "/professor/alunos/placeholder", label: "Alunos (atalho)", match: (p) => p.startsWith("/professor/alunos") },
  { href: "/professor/redacoes/placeholder", label: "Redações (atalho)", match: (p) => p.startsWith("/professor/redacoes") },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(item: NavItem) {
    if (item.match) return item.match(pathname);
    return pathname === item.href;
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b bg-background/80 backdrop-blur px-4 py-2">
        <span className="font-semibold">Painel do Professor</span>
        <button
          onClick={() => setOpen((o) => !o)}
          className="px-3 py-1 rounded-md border text-sm"
          aria-expanded={open}
          aria-label="Abrir navegação"
        >
          Menu
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`md:sticky md:top-0 md:h-[calc(100dvh)] md:w-64 md:shrink-0 md:border-r bg-background
        ${open ? "block" : "hidden"} md:block`}
      >
        <div className="p-4 border-b hidden md:block">
          <div className="text-lg font-semibold">Painel do Professor</div>
          <div className="text-xs opacity-70">Navegação</div>
        </div>

        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-sm border
                  ${active ? "bg-black/5 border-black/20 font-medium" : "hover:bg-black/5"}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 mt-4 text-xs opacity-60">
          <div className="mb-1 font-medium">Dicas</div>
          <ul className="list-disc ml-4 space-y-1">
            <li>Use “Minhas turmas” para começar.</li>
            <li>Dentro da turma, clique em um aluno.</li>
            <li>Depois escolha uma redação para detalhar.</li>
          </ul>
        </div>
      </aside>
    </>
  );
}
