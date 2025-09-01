// src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
// import { headers } from "next/headers";  // ❌ remova esta linha

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Em Server Components: leitura OK, escrita bloqueada → no-op
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(_name: string, _value: string, _options?: CookieOptions) {
          /* no-op em RSC */
        },
        remove(_name: string, _options?: CookieOptions) {
          /* no-op em RSC */
        },
      },
      // ❌ Remova este bloco — 'headers' não é aceito pelo createServerClient
      // headers: {
      //   get(name: string) {
      //     return headers().get(name) ?? undefined;
      //   },
      // },
    }
  );
}
