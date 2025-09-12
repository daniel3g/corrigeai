import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const ALLOWED = ['colegioprogresso.g12.br'] as const
const DEFAULT_ROLE: 'student' | 'teacher' | 'admin' = 'student'

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization') || ''
    const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : null
    if (!token) {
      return NextResponse.json({ ok: false, reason: 'no-bearer' }, { status: 401 })
    }

    // Client autenticado com o Bearer do usuário (todas as queries passam na RLS)
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false },
      }
    )

    // Identifica usuário
    const { data: userData, error: getUserErr } = await supabase.auth.getUser()
    if (getUserErr || !userData?.user) {
      return NextResponse.json({ ok: false, reason: 'invalid-token', detail: getUserErr?.message }, { status: 401 })
    }
    const user = userData.user

    // Checagem de domínio
    const email = user.email ?? ''
    const domain = email.split('@')[1] ?? ''
    if (!ALLOWED.includes(domain as any)) {
      // não dá pra “signOut” no server (sessão é do client). Só informe 403 e o client faz signOut().
      return NextResponse.json({ ok: false, reason: 'domain' }, { status: 403 })
    }

    // Perfil/papel sob RLS
    let role: 'student' | 'teacher' | 'admin' = DEFAULT_ROLE

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profileErr && profileErr.code !== 'PGRST116') {
      console.warn('[post-login] select profile error:', profileErr)
    }

    if (profile?.role) {
      role = profile.role as any
    } else {
      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert({ id: user.id, role: DEFAULT_ROLE, email }, { onConflict: 'id' })

      if (upsertErr) {
        console.error('[post-login] upsert profile error:', upsertErr)
        return NextResponse.json({ ok: false, reason: 'upsert-failed', detail: upsertErr.message }, { status: 500 })
      }
    }

    const redirectTo =
      role === 'admin' ? '/admin' :
      role === 'teacher' ? '/professor/dashboard' :
      '/aluno/dashboard'

    return NextResponse.json({ ok: true, role, redirectTo })
  } catch (e: any) {
    console.error('[post-login] server error:', e)
    return NextResponse.json({ ok: false, reason: 'server-error', detail: e?.message }, { status: 500 })
  }
}
