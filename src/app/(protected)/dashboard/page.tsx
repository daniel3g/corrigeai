import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, updated_at')
    .eq('id', session.user.id)
    .single()

  return (
    <section className="p-6 space-y-2">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-700">
        Bem-vindo{profile?.full_name ? `, ${profile.full_name}` : ''}!
      </p>
      <div className="text-sm text-gray-500">
        Última atualização do perfil: {profile?.updated_at ?? '—'}
      </div>
    </section>
  )
}
