'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

const DEBUG = false

function parseHash() {
  if (typeof window === 'undefined') return { type: null, access_token: null, refresh_token: null }
  const raw = window.location.hash?.slice(1) || ''
  const qs = new URLSearchParams(raw)
  return {
    type: qs.get('type'),
    access_token: qs.get('access_token'),
    refresh_token: qs.get('refresh_token'),
  }
}

function lsDump() {
  if (typeof window === 'undefined') return []
  const ks = Object.keys(localStorage)
  const interesting = ks.filter(
    (k) => k.startsWith('sb-') || k.toLowerCase().includes('pkce') || k.toLowerCase().includes('supabase')
  )
  return interesting.map((k) => ({ key: k, size: (localStorage.getItem(k) ?? '').length }))
}

function CallbackInner() {
  const supabase = createClient()
  const router = useRouter()
  const params = useSearchParams()

  const code = params.get('code')
  const typeQuery = params.get('type')
  const { type: typeHash, access_token, refresh_token } = parseHash()
  const type = typeQuery || typeHash

  const isRecovery = useMemo(() => {
    return type === 'recovery' || (!!access_token && !!refresh_token && !code)
  }, [type, access_token, refresh_token, code])

  const [bootMsg, setBootMsg] = useState('Validando link…')
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [dbg, setDbg] = useState<any>(null)
  const bootOnce = useRef(false)

  useEffect(() => {
    if (bootOnce.current) return
    bootOnce.current = true

    const run = async () => {
      try {
        setBootMsg('Processando retorno do provedor…')

        // 1) Se vier com ?code=, troca por sessão (PKCE)
        const codeFromQS = params.get('code')
        if (codeFromQS) {
          try {
            await supabase.auth.exchangeCodeForSession(codeFromQS)
          } catch (err) {
            if (DEBUG) setDbg((d: any) => ({ ...d, exchangeErr: String(err) }))
          }

          // Se também vier type=recovery, já mostra o formulário
          const t = params.get('type')
          if (t === 'recovery') {
            setReady(true)
            setError(null)
            setBootMsg('')
            return
          }
        }

        // 2) Se vier com tokens no hash (#access_token/#refresh_token), instala sessão manualmente
        const { access_token: at, refresh_token: rt } = parseHash()
        if (!codeFromQS && at && rt) {
          try {
            await supabase.auth.setSession({ access_token: at, refresh_token: rt })
          } catch (err) {
            if (DEBUG) setDbg((d: any) => ({ ...d, setSessionErr: String(err) }))
          }
          // Fluxo de recuperação: abre a UI de redefinição
          setReady(true)
          setError(null)
          setBootMsg('')
          return
        }

        // 3) Espera a sessão ficar disponível (detectSessionInUrl true cobre o resto)
        let tries = 0
        let session = null as any
        while (tries < 12) {
          const { data } = await supabase.auth.getSession()
          session = data.session
          if (session) break
          await new Promise((r) => setTimeout(r, 150))
          tries++
        }
        if (!session) throw new Error('Sessão ausente após processar o retorno.')

        // 4) Se for recovery (via ?type= ou via hash), mostra formulário
        const { access_token: at2, refresh_token: rt2 } = parseHash()
        const typeQuery2 = params.get('type')
        const isRecoveryNow = typeQuery2 === 'recovery' || (!!at2 && !!rt2)
        if (isRecoveryNow) {
          setReady(true)
          setError(null)
          setBootMsg('')
          return
        }

        // 5) Fluxo normal de login: instala cookies no server e pós-login
        const { data: { session: s } } = await supabase.auth.getSession()
        if (!s?.access_token || !s?.refresh_token) throw new Error('Sessão sem tokens.')

        await fetch('/api/auth/install-cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: s.access_token, refresh_token: s.refresh_token }),
        })

        setBootMsg('Validando domínio e papel…')

        const accessToken = s.access_token
        const resp = await fetch('/api/auth/post-login', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (resp.status === 403) {
          await supabase.auth.signOut()
          router.replace('/login?err=domain')
          return
        }
        if (!resp.ok) {
          let reason = 'Falha no pós-login.'
          try {
            const j = await resp.json()
            reason = j?.reason ? `Falha no pós-login: ${j.reason}` : reason
          } catch {}
          throw new Error(reason)
        }

        const data = await resp.json()
        router.replace(data?.redirectTo || '/dashboard')
      } catch (e: any) {
        setError(e?.message ?? 'Falha ao validar link.')
        setReady(false)
        setBootMsg('')
      } finally {
        if (DEBUG) {
          setDbg((d: any) => ({
            ...d,
            ls: lsDump(),
            url: typeof window !== 'undefined' ? window.location.href : null,
          }))
        }
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) return setError('A nova senha precisa ter pelo menos 8 caracteres.')
    if (password !== confirm) return setError('As senhas não conferem.')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return setError('Sessão ausente. Abra novamente o link de redefinição.')

    const { error } = await supabase.auth.updateUser({ password })
    if (error) return setError(error.message)

    router.replace('/login')
  }

  if (!ready && isRecovery) {
    return (
      <main className="p-6 max-w-md mx-auto space-y-2">
        <h1 className="text-xl font-semibold">Carregando…</h1>
        {bootMsg && <p className="text-sm text-gray-600">{bootMsg}</p>}
        {(error || dbg) && (
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify({ error, dbg }, null, 2)}
          </pre>
        )}
      </main>
    )
  }

  if (!isRecovery) {
    return (
      <main className="p-6 max-w-md mx-auto">
        <h1 className="text-xl font-semibold mb-2">Carregando…</h1>
        {bootMsg && <p className="text-sm text-gray-600">{bootMsg}</p>}
        {(error || dbg) && (
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify({ error, dbg }, null, 2)}
          </pre>
        )}
      </main>
    )
  }

  // UI de redefinição de senha (recovery)
  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Defina sua nova senha</h1>
      <form onSubmit={handleSetPassword} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Nova senha</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Confirmar senha</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="w-full rounded px-3 py-2 border">
          Salvar nova senha
        </button>
      </form>
      {dbg && (
        <details className="mt-4 text-xs text-neutral-600">
          <summary>Debug info</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(dbg, null, 2)}
          </pre>
        </details>
      )}
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<main className="p-6">Carregando…</main>}>
      <CallbackInner />
    </Suspense>
  )
}
