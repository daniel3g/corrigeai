'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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

export default function AuthCallbackPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useSearchParams()

  const code = params.get('code')
  const typeQuery = params.get('type')
  const { type: typeHash, access_token, refresh_token } = parseHash()
  const type = typeQuery || typeHash

  // Modo recuperação se (a) type=recovery OU (b) vieram tokens no hash e não há code
  const isRecovery = useMemo(() => {
    return type === 'recovery' || (!!access_token && !!refresh_token && !code)
  }, [type, access_token, refresh_token, code])

  const [bootMsg, setBootMsg] = useState('Validando link…')
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)     // pronto para exibir o form
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [dbg, setDbg] = useState<any>(null)     // debug opcional
  const bootOnce = useRef(false)

  useEffect(() => {
    if (bootOnce.current) return
    bootOnce.current = true

    const installAndWaitSession = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        // (debug) confere o projeto do cliente vs link recebido
        setDbg({
          clientUrl: url,
          hasCode: !!code,
          hasHashTokens: !!access_token && !!refresh_token,
          type,
        })

        // 1) Fluxo PKCE (?code=...)
        if (code) {
  setBootMsg('Trocando código por sessão…')
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    // log detalhado para depurar PKCE
    console.error('[PKCE] exchangeCodeForSession error:', error)
    throw new Error(`PKCE falhou: ${error.message}`)
  }
}

        // 2) Fluxo por hash (#access_token & #refresh_token)
        if (!code && access_token && refresh_token) {
          setBootMsg('Instalando sessão a partir do link…')
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) throw error

          // limpa o hash para não poluir a URL
          if (typeof window !== 'undefined') {
            history.replaceState(null, '', window.location.pathname + window.location.search)
          }
        }

        // 3) Aguarda a sessão ficar disponível (alguns ms)
        setBootMsg('Confirmando sessão…')
        let tries = 0
        let session = null
        while (tries < 5) {
          const { data } = await supabase.auth.getSession()
          session = data.session
          if (session) break
          await new Promise(r => setTimeout(r, 150))
          tries++
        }
        if (!session) throw new Error('Sessão ausente após instalar. Verifique NEXT_PUBLIC_SUPABASE_URL/ANON_KEY.')

          if (!isRecovery) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data: me } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .maybeSingle();

              if (me?.role === "teacher") {
                router.replace("/professor/dashboard");
                return; // interrompe o efeito
              }
              if (me?.role === "student") {
                router.replace("/aluno/dashboard");
                return;
              }
            }
            // fallback
            router.replace("/dashboard");
            return;
          }

        setReady(true)
        setError(null)
        setBootMsg('')
      } catch (e: any) {
        setError(e?.message ?? 'Falha ao validar link.')
        setReady(false)
        setBootMsg('')
      }
    }

    installAndWaitSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, access_token, refresh_token])

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) return setError('A nova senha precisa ter pelo menos 8 caracteres.')
    if (password !== confirm) return setError('As senhas não conferem.')

    // Garante sessão antes de atualizar
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return setError('Sessão ausente. Abra novamente o link de redefinição.')

    const { error } = await supabase.auth.updateUser({ password })
    if (error) return setError(error.message)

    router.replace('/minhas-redacoes') // sua dashboard
  }

  // Estado de boot / erro
  if (!ready) {
    return (
      <main className="p-6 max-w-md mx-auto space-y-2">
        <h1 className="text-xl font-semibold">Carregando…</h1>
        {bootMsg && <p className="text-sm text-gray-600">{bootMsg}</p>}
        {error && (
          <div className="mt-2 text-sm text-red-600">
            <p>{error}</p>
            {/* Debug opcional: comente isto em produção */}
            {dbg && (
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(dbg, null, 2)}
              </pre>
            )}
          </div>
        )}
      </main>
    )
  }

  // Se não for recovery, não redireciona; mostra mensagem neutra
  if (!isRecovery) {
    return (
      <main className="p-6 max-w-md mx-auto">
        <h1 className="text-xl font-semibold mb-2">Link não é de recuperação</h1>
        <p className="text-sm text-gray-600">
          Este link não parece ser de redefinição de senha. Abra o link mais recente enviado ao seu e-mail.
        </p>
      </main>
    )
  }

  // Formulário (já com sessão instalada)
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
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Confirmar senha</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
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
