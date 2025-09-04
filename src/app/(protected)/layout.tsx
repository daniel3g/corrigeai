import { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Logo from '@/public/images/logo.webp'
import Image from 'next/image'

async function Header() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <header className="border-b px-6 py-3 flex items-center justify-between">
      <Link href="/dashboard" className="font-semibold">
        <Image 
        src={Logo}
        alt='logo estudai'
        />
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/minhas-redacoes" className="text-sm">Minhas Redações</Link>
        {session?.user?.email && <span className="text-sm text-gray-600">{session.user.email}</span>}
        <form action="/auth/signout" method="post">
          <button className="rounded bg-black px-3 py-2 text-white text-sm">Sair</button>
        </form>
      </div>
    </header>
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
