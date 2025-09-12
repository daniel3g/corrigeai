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
        detectSessionInUrl: true,
        autoRefreshToken: true, // ✅ garante renovação automática
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'corrigeai-auth', // ✅ evita conflito com outros apps/domínios
      },
    }
  )

  return _client
}
