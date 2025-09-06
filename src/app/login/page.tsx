'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

import Logo from '@/public/images/logo.webp';
import BgLogin from '@/public/images/bg-login-caption.png';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setErr(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      if (error.message?.toLowerCase().includes('invalid login')) {
        setErr('E-mail ou senha inválidos.');
      } else if (error.message?.toLowerCase().includes('email not confirmed')) {
        setErr('E-mail não confirmado. Fale com o administrador.');
      } else {
        setErr(error.message || 'Falha ao entrar.');
      }
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return router.replace('/login');

    const { data: me, error: roleErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (roleErr || !me?.role) {
      return router.replace('/dashboard');
    }

    if (me.role === 'teacher') return router.replace('/professor/dashboard');
    if (me.role === 'student') return router.replace('/aluno/dashboard');

    return router.replace('/dashboard');
  }

  return (
    <main className="flex h-screen w-full flex-col md:flex-row">
      {/* imagem só aparece do md para cima */}
      <div className="hidden md:block md:w-2/3 h-64 md:h-screen relative">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={BgLogin}
            alt="Astronauta do Futuro Estudai"
            fill
            className="-z-10 brightness-50 object-cover"
            priority
          />
        </div>
      </div>

      {/* formulário ocupa 100% no mobile e 1/3 no desktop */}
      <div className="flex px-6 sm:px-10 flex-col justify-center w-full md:w-1/3 py-8 md:py-0">
        <Link href={'/'}>
          <Image
            src={Logo}
            alt="logo estudai"
            width={160}
            height={42}
            className="h-10 w-auto"
            priority
          />
        </Link>
        <h1 className="text-lg sm:text-base pt-4 font-semibold">
          Acesse sua conta
        </h1>

        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm text-slate-600">E-mail</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              placeholder="Digite seu email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600">Senha</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              placeholder="Digite sua senha..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </div>

          <button
            onClick={signIn}
            disabled={loading}
            className="w-full rounded bg-customBlue px-3 py-2 text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
          <p className="mt-2 text-sm">
            <a href="/reset-request" className="underline">
              Esqueci minha senha
            </a>
          </p>

          {err && <p className="text-red-600 text-sm">{err}</p>}
        </div>
      </div>
    </main>
  );
}
