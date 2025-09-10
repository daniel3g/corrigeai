import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED = ['colegioprogresso.g12.br'] // adicione outros domínios, se houver

export async function GET(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email ?? ''
  const domain = email.split('@')[1] ?? ''

  if (!user || !ALLOWED.includes(domain)) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login?err=domain', process.env.NEXT_PUBLIC_SITE_URL))
  }

  // (Opcional) crie/atualize user_roles aqui (RPC ou SQL) com papel padrão
  // await supabase.from('user_roles').upsert({ user_id: user.id, role: 'student', email_domain: domain })

  // redirecione por papel, se quiser
  const to = new URL('/aluno/dashboard', process.env.NEXT_PUBLIC_SITE_URL)
  return NextResponse.redirect(to)
}
