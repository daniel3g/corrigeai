"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

import Logo from '@/public/images/logo.webp'
import Image from 'next/image'

const NAV = [
  { href: "/aluno/dashboard", label: "Dashboard", starts: "/aluno/dashboard" },
  { href: "/aluno/minhas-redacoes", label: "Minhas Redações", starts: "/aluno/minhas-redacoes" },
  { href: "/aluno/minhas-redacoes/new", label: "Nova Redação", starts: "/aluno/nova-redacao" },
  { href: "/reset-password", label: "Alterar Senha", starts: "/reset-password" },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) setSession(data.session ?? null);
    };
    fetchSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (mounted) setSession(sess);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <>
      {/* Top bar (mobile) */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b bg-background/80 backdrop-blur px-4 py-2">
        <span className="font-semibold">Painel do Aluno</span>
        <button
          onClick={() => setOpen((o) => !o)}
          className="px-3 py-1 rounded-md border text-sm"
        >
          Menu
        </button>
      </div>

      <aside
        className={`md:sticky md:top-0 md:h-[100dvh] md:w-64 md:shrink-0 md:border-r bg-background ${
          open ? "block" : "hidden"
        } md:block`}
      >
        <div className="p-4 border-b hidden md:block">
          <Link href="/dashboard" className="font-semibold">
            <Image 
            src={Logo}
            alt='logo estudai'
            />
          </Link>
          <div className="text-lg font-semibold">Painel do Aluno</div>
          <div className="text-xs opacity-70">Navegação</div>
        </div>

        <nav className="p-3 space-y-1">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.starts);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-sm border ${
                  active
                    ? "bg-black/5 border-black/20 font-medium"
                    : "hover:bg-black/5"
                }`}
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
            <li>Use “Dashboard” para ver suas últimas redações.</li>
            <li>Acesse “Minhas Redações” para ver todas.</li>
            <li>Clique em “Nova Redação” para enviar outra.</li>
          </ul>
        </div>

        <div className="p-3 border-t space-y-2">
          {session?.user?.email && (
            <div className="text-sm text-gray-600 truncate">
              {session.user.email}
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="rounded bg-black px-3 py-2 text-white text-sm w-full"
          >
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
