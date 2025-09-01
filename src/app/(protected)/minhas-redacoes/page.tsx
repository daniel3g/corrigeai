import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function MinhasRedacoesPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: essays } = await supabase
    .from('essays')
    .select('id,title,status,created_at,updated_at')
    .eq('student_id', session.user.id)
    .order('created_at', { ascending: false })

  return (
    <section className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Minhas Redações</h1>
        <Link href="/minhas-redacoes/new" className="rounded bg-black text-white px-3 py-2 text-sm">Nova redação</Link>
      </div>
      <ul className="divide-y">
        {(essays ?? []).map(e => (
          <li key={e.id} className="py-3">
            <Link href={`/minhas-redacoes/${e.id}`} className="font-medium">{e.title}</Link>
            <div className="text-sm text-gray-600">Status: {e.status} • {new Date(e.created_at!).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </section>
  )
}
