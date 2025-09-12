'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [ok, setOk] = useState<string|null>(null)
  const [err, setErr] = useState<string|null>(null)
  const [loading, setLoading] = useState(false)

  const sendReset = async () => {
    try {
      setLoading(true); setOk(null); setErr(null)
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/auth/callback?type=recovery`
      })
      if (error) throw error
      setOk('Enviamos um link de recuperação para o seu e-mail.')
    } catch (e:any) {
      setErr(e?.message ?? 'Erro ao solicitar recuperação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-sm mx-auto p-6">
      <h1 className="text-xl font-semibold mb-3">Recuperar senha</h1>
      <p className="text-sm text-gray-500 mb-4">Informe seu e-mail para receber o link.</p>
      <input
        type="email"
        className="w-full border rounded p-2 mb-3"
        placeholder="seu@email.com"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
      />
      <button
        onClick={sendReset}
        disabled={loading || !email}
        className="w-full rounded p-2 bg-black text-white disabled:opacity-50"
      >
        {loading ? 'Enviando...' : 'Enviar link'}
      </button>
      {ok && <p className="text-green-600 mt-3">{ok}</p>}
      {err && <p className="text-red-600 mt-3">{err}</p>}
    </main>
  )
}
