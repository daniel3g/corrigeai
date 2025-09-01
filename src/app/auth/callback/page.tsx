'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function getHashParam(name: string) {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash?.slice(1) || ''
  const qs = new URLSearchParams(hash)
  return qs.get(name)
}

export default function AuthCallbackPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useSearchParams()

  const typeQuery = params.get('type')
  const code = params.get('code')
  const typeHash = typeof window !== 'undefined' ? getHashParam('type') : null
  const type = typeQuery || typeHash
  const isRecovery = useMemo(() => type === 'recovery', [type])

  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const sessionSettled = useRef(false)

  useEffect(() => {
    const run = async () => {
      try {
        // Se veio via PKCE (?code=...), troque por sessão
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          sessionSettled.current = true
          setReady(true)
          return
        }
      } catch (e: any) {
        setError(e?.message ?? 'Falha ao validar link.')
        setReady(true)
        return
      }

      // Se veio via hash (#access_token...), deixe o supabase-js processar
      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
        if (!sessionSettled.current) {
          sessionSettled.current = true
          setReady(true)
        }
      })
      // Força leitura para disparar o parse do hash
      supabase.auth.getSession().finally(() => {
        setTimeout(() => { if (!sessionSettled.current) setReady(true) }, 300)
      })
      return () => subscription.unsubscribe()
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) return setError('A nova senha precisa ter pelo menos 8 caracteres.')
    if (password !== confirm) return setError('As senhas não conferem.')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return setError(error.message)
    router.replace('/minhas-redacoes') // sua dashboard
  }

  if (!ready) return <main className="p-6">Validando link…</main>

  // Só redireciona ao login depois que estiver PRONTO e não for recovery
  if (ready && !isRecovery) {
    if (!ready) return <main className="p-6">Validando link…</main>

// Só redireciona se NÃO for recovery
if (ready && !isRecovery) {
  // opcional: vá para dashboard se a sessão existir
  router.replace('/login')
  return null
}

    return null
  }

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Defina sua nova senha</h1>
      <form onSubmit={handleSetPassword} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Nova senha</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password} onChange={e => setPassword(e.target.value)} autoFocus
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Confirmar senha</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={confirm} onChange={e => setConfirm(e.target.value)}
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="w-full rounded px-3 py-2 border">
          Salvar nova senha
        </button>
      </form>
    </main>
  )
}
