'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

function projectRefFromUrl(url: string) {
  const u = new URL(url)
  // ex: https://ztvpeywlwfnwrlmjsdwl.supabase.co → "ztvpeywlwfnwrlmjsdwl"
  return u.hostname.split('.')[0]
}

export default function ResetRequestPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    // força o flow "implicit" no storage do Supabase (além do client.ts)
    const ref = projectRefFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!)
    // chaves típicas usadas pelo supabase-js
    localStorage.setItem(`sb-${ref}-auth-flow`, JSON.stringify({ flow_type: 'implicit' }))
    // limpar qualquer lixo anterior de PKCE
    localStorage.removeItem(`sb-${ref}-code-verifier`)
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(''); setErr('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback`,
    })
    if (error) setErr(error.message)
    else setMsg('Se este e-mail existir, enviaremos um link de redefinição.')
  }

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-2">Redefinir senha</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
               className="w-full border rounded px-3 py-2" placeholder="seu@email.com" />
        {msg && <p className="text-green-700 text-sm">{msg}</p>}
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="w-full border rounded px-3 py-2">Enviar link</button>
      </form>
    </main>
  )
}
