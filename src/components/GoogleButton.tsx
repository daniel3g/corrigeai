'use client'
import { createClient } from '@/lib/supabase/client'

export function GoogleButton() {
  const supabase = createClient()
  async function signInGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: { hd: 'colegioprogresso.g12.br', prompt: 'select_account' }, // hint (não obriga)
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }
  return (
    <button onClick={signInGoogle} className="w-full rounded-md border px-4 py-2">
      Entrar com Google
    </button>
  )
}
