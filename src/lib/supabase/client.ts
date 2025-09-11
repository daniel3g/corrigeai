// lib/supabase/client.ts
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function createClient() {
  if (_client) return _client

  _client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        // ⚠️ Ativar auto-detecção para o SDK processar o code/state da URL
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        // Dica: se quiser isolar de outros apps, defina uma storageKey fixa (use a MESMA em todo o app)
        // storageKey: 'sb-corrigeai-auth',
      },
    }
  )

  return _client
}
