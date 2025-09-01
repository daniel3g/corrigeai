'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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
      // mensagens mais amigáveis
      if (error.message?.toLowerCase().includes('invalid login')) {
        setErr('E-mail ou senha inválidos.');
      } else if (error.message?.toLowerCase().includes('email not confirmed')) {
        setErr('E-mail não confirmado. Fale com o administrador.');
      } else {
        setErr(error.message || 'Falha ao entrar.');
      }
      return;
    }

    // sucesso
    router.replace('/dashboard');
  }

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold">Entrar</h1>

      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-sm text-slate-600">E-mail</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="seu@email.com"
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
          />
        </div>

        <button
          onClick={signIn}
          disabled={loading}
          className="w-full rounded bg-black px-3 py-2 text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>

        {err && <p className="text-red-600 text-sm">{err}</p>}
      </div>
    </main>
  );
}
