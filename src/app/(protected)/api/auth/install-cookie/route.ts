import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: NextRequest) {
  const { access_token, refresh_token } = await req.json().catch(() => ({}))

  if (!access_token || !refresh_token) {
    return NextResponse.json({ ok: false, reason: 'missing-tokens' }, { status: 400 })
  }

  // Resposta que usaremos para setar cookies
  const res = NextResponse.json({ ok: true })

  // Cria um server client com adaptador de cookies (lê do req, escreve no res)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          res.cookies.set({ name, value, ...options })
        },
        remove: (name: string, options: any) => {
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Instala a sessão no lado do servidor (isso vai escrever os cookies no `res`)
  const { error } = await supabase.auth.setSession({ access_token, refresh_token })
  if (error) {
    return NextResponse.json({ ok: false, reason: 'set-session-failed', detail: error.message }, { status: 400 })
  }

  return res
}
