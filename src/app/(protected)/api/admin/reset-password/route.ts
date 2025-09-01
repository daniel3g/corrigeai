import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs' // garante Node runtime

// Admin client com Service Role (server-only)
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Payload = { email?: string; userId?: string; newPassword: string }

export async function POST(req: Request) {
  try {
    // Proteção simples por token (melhore conforme seu caso)
    const token = req.headers.get('x-admin-token')
    if (token !== process.env.ADMIN_RESET_TOKEN) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as Payload
    const { email, userId, newPassword } = body

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { ok: false, error: 'newPassword deve ter pelo menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Descobrir o usuário (por userId direto ou procurando por e-mail)
    let targetId = userId?.trim()

    if (!targetId && email) {
      // Procura por e-mail varrendo páginas (simples e suficiente para uso interno)
      const needle = email.toLowerCase()
      let page = 1
      const perPage = 1000
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
        if (error) throw error
        const hit = data.users.find(u => (u.email ?? '').toLowerCase() === needle)
        if (hit) {
          targetId = hit.id
          break
        }
        if (data.users.length < perPage) break // acabou
        page++
      }
    }

    if (!targetId) {
      return NextResponse.json(
        { ok: false, error: 'Usuário não encontrado por email/userId' },
        { status: 404 }
      )
    }

    // Atualiza a senha (e, se quiser, marca e-mail como confirmado)
    const { error: updErr } = await admin.auth.admin.updateUserById(targetId, {
      password: newPassword,
      // email_confirm: true, // habilite se fizer sentido para seu fluxo
    })
    if (updErr) throw updErr

    return NextResponse.json({ ok: true, userId: targetId })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Erro inesperado' },
      { status: 400 }
    )
  }
}
