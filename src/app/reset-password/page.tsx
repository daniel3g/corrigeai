'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState<string|null>(null);
  const [ok, setOk] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Opcional: garantir que existe uma sessão (vinda do link de recuperação)
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setErr('Link inválido ou expirado. Solicite novamente.');
      }
    })();
  }, [supabase]);

  const updatePassword = async () => {
    try {
      setErr(null); setOk(null);
      if (password.length < 8) throw new Error('A senha deve ter pelo menos 8 caracteres.');
      if (password !== confirm) throw new Error('As senhas não coincidem.');
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setOk('Senha atualizada com sucesso! Redirecionando...');
      setTimeout(() => router.push('/login'), 1200);
    } catch (e:any) {
      setErr(e?.message ?? 'Erro ao definir nova senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-sm mx-auto p-6">
      <h1 className="text-xl font-semibold mb-3">Definir nova senha</h1>
      <input
        type="password"
        className="w-full border rounded p-2 mb-3"
        placeholder="Nova senha"
        value={password}
        onChange={e=>setPassword(e.target.value)}
      />
      <input
        type="password"
        className="w-full border rounded p-2 mb-3"
        placeholder="Confirmar senha"
        value={confirm}
        onChange={e=>setConfirm(e.target.value)}
      />
      <button
        onClick={updatePassword}
        disabled={loading}
        className="w-full rounded p-2 bg-black text-white disabled:opacity-50"
      >
        {loading ? 'Salvando...' : 'Salvar nova senha'}
      </button>
      {ok && <p className="text-green-600 mt-3">{ok}</p>}
      {err && <p className="text-red-600 mt-3">{err}</p>}
    </main>
  );
}
