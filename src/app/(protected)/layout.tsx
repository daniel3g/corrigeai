import { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'



async function Header() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <></>
  )
}

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
     
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  )
}
