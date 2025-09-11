import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED = ['colegioprogresso.g12.br'] // adicione outros domínios se precisar
const DEFAULT_ROLE: 'student' | 'teacher' | 'admin' = 'student'

export async function POST() {
  const supabase = createClient()

  // precisa ter sessão já instalada pelo cliente (callback page)
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ ok: false, reason: 'no-session' }, { status: 401 })
  }

  const email = user.email ?? ''
  const domain = email.split('@')[1] ?? ''

  if (!ALLOWED.includes(domain)) {
    // encerra sessão e bloqueia
    await supabase.auth.signOut()
    return NextResponse.json({ ok: false, reason: 'domain' }, { status: 403 })
  }

  // 1) tentar obter papel de alguma tabela (profiles ou user_roles)
  // ajuste conforme seu schema atual. Vou tentar em 'profiles.role' primeiro.
  let role: 'student' | 'teacher' | 'admin' | null = null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role) {
    role = profile.role as any
  } else {
    // 2) se não existir, provisiona com role padrão (e opcionalmente cria o profile)
    // tente atualizar se já existir linha; se não, insere.
    await supabase
      .from('profiles')
      .upsert({ id: user.id, role: DEFAULT_ROLE, email: email }, { onConflict: 'id' })

    role = DEFAULT_ROLE
  }

  return NextResponse.json({
    ok: true,
    role,
    redirectTo:
      role === 'admin' ? '/admin'
      : role === 'teacher' ? '/professor/dashboard'
      : '/aluno/dashboard',
  })
}
