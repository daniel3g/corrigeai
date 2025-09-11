'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RequestResetPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit() {
    setLoading(true)
    setErr(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      // O Supabase vai anexar #type=recovery&access_token=... e voltar para esta rota
      redirectTo: `${location.origin}/auth/callback`,
    })
    setLoading(false)
    if (error) setErr(error.message)
    else setOk(true)
  }

  return (
    <main className="p-6 max-w-sm mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Recuperar acesso</h1>
      <p className="text-sm text-neutral-600">
        Enviaremos um link para você redefinir sua senha.
      </p>

      <input
        type="email"
        className="w-full border rounded px-3 py-2"
        placeholder="seu.email@colegioprogresso.g12.br"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {err && <p className="text-sm text-red-600">{err}</p>}
      {ok && (
        <div className="rounded border border-green-200 bg-green-50 p-2 text-sm text-green-700">
          Verifique seu e-mail. O link expira em alguns minutos.
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading}
        className="w-full rounded bg-black text-white px-4 py-2 text-sm disabled:opacity-60"
      >
        {loading ? 'Enviando…' : 'Enviar link'}
      </button>

      <div className="text-sm">
        <Link href="/login" className="underline">Voltar ao login</Link>
      </div>
    </main>
  )
}
