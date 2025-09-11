'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const DEBUG = true
const GOOGLE_DOMAIN_HINT = 'colegioprogresso.g12.br'

function useLocalStorageDebug() {
  const [keys, setKeys] = useState<string[]>([])
  useEffect(() => {
    if (typeof window === 'undefined') return
    const ks = Object.keys(localStorage)
    const interesting = ks.filter(k => k.startsWith('sb-') || k.toLowerCase().includes('pkce') || k.toLowerCase().includes('supabase'))
    setKeys(interesting)
    console.debug('[LOGIN] ls keys:', interesting)
  }, [])
  return keys
}

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const qp = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(qp.get('err') === 'domain' ? 'Use seu e-mail institucional.' : null)
  const okMsg = qp.get('msg')

  const lsKeys = useLocalStorageDebug()

  async function signInWithEmail() {
    setLoading(true); setErr(null)
    if (DEBUG) console.debug('[LOGIN] signInWithPassword', { email })
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) {
      console.debug('[LOGIN] signInWithPassword error', error)
      setErr(/invalid login/i.test(error.message) ? 'E-mail ou senha inválidos.' : error.message)
      return
    }
    router.replace('/auth/callback')
  }

  async function signInWithGoogle() {
    setLoading(true); setErr(null)
    try {
      localStorage.setItem('oauth_started', '1')
      localStorage.setItem('oauth_started_ts', String(Date.now()))
      console.debug('[LOGIN] oauth_started set')
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: { hd: GOOGLE_DOMAIN_HINT, prompt: 'select_account' },
          redirectTo: `${location.origin}/auth/callback`,
        },
      })
      // redireciona fora do app
    } catch (e: any) {
      console.debug('[LOGIN] signInWithOAuth error', e)
      setErr(e?.message ?? 'Falha ao iniciar login com Google.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen grid md:grid-cols-2">
      <section className="relative hidden md:flex items-center justify-center bg-neutral-100">
        <div className="max-w-md p-10">
          <h1 className="text-2xl font-semibold">Bem-vindo ao Estudai</h1>
          <p className="mt-2 text-sm text-neutral-600">Entre com Google ou com e-mail e senha.</p>
        </div>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-5">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Entrar</h2>
            <p className="text-sm text-neutral-600">Use sua conta institucional ou seu acesso com senha.</p>
          </div>

          {okMsg && <div className="rounded border border-green-200 bg-green-50 p-2 text-sm text-green-700">
            {okMsg === 'senha_atualizada' ? 'Senha atualizada com sucesso.' : okMsg}
          </div>}
          {err && <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{err}</div>}

          <button onClick={signInWithGoogle} disabled={loading} className="w-full rounded-md border px-4 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60">
            {loading ? 'Redirecionando…' : 'Entrar com Google'}
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-neutral-500">ou</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">E-mail</label>
              <input type="email" autoComplete="email" className="w-full border rounded px-3 py-2"
                     value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@colegioprogresso.g12.br" />
            </div>
            <div>
              <label className="block text-sm mb-1">Senha</label>
              <div className="flex gap-2">
                <input type={showPwd ? 'text' : 'password'} autoComplete="current-password" className="w-full border rounded px-3 py-2"
                       value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && signInWithEmail()} />
                <button type="button" onClick={() => setShowPwd(v => !v)} className="shrink-0 rounded border px-3 text-sm">
                  {showPwd ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>
            <button onClick={signInWithEmail} disabled={loading} className="w-full rounded bg-black text-white px-4 py-2 text-sm disabled:opacity-60">
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link href="/auth/request-reset" className="underline">Esqueci minha senha</Link>
            <Link href="/" className="text-neutral-500 hover:underline">Voltar ao site</Link>
          </div>

          {DEBUG && (
            <details className="text-xs text-neutral-600">
              <summary>Debug</summary>
              <div className="mt-2 space-y-1">
                <div>origin: {typeof window !== 'undefined' ? location.origin : 'ssr'}</div>
                <div>oauth_started: {typeof window !== 'undefined' ? localStorage.getItem('oauth_started') : '-'}</div>
                <div>oauth_started_ts: {typeof window !== 'undefined' ? localStorage.getItem('oauth_started_ts') : '-'}</div>
                <div>lsKeys: {lsKeys.join(', ') || '—'}</div>
              </div>
            </details>
          )}
        </div>
      </section>
    </main>
  )
}
