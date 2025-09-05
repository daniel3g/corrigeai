import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const title = (formData.get('title') as string | null) ?? 'Redação'
  const content = (formData.get('content') as string | null)?.trim() ?? ''
  if (!content) return NextResponse.json({ error: 'content required' }, { status: 400 })

  // 🔎 Busca a turma do aluno em class_enrollments
  let query = supabase
    .from('class_enrollments')
    .select('class_id, status')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  // Se você usar um enum com valor "active" ou "enrolled", descomente UMA das linhas:
  // query = query.eq('status', 'active')
  // query = query.eq('status', 'enrolled')

  const { data: enroll, error: enErr } = await query.maybeSingle()
  if (enErr || !enroll?.class_id) {
    return NextResponse.json({ error: 'student not enrolled in a class' }, { status: 400 })
  }
  const class_id = enroll.class_id as string

  // 📝 Cria a redação (apenas texto)
  const { data: essay, error: e1 } = await supabase
    .from('essays')
    .insert({
      student_id: user.id,
      class_id,
      title,
      content,
      source_type: 'typed',
      status: 'queued',
    })
    .select('id, student_id')
    .single()

  if (e1 || !essay) {
    return NextResponse.json({ error: e1?.message || 'insert failed' }, { status: 400 })
  }

  // 🚀 Dispara n8n
  const payload = {
    essay_id: essay.id,
    student_id: essay.student_id,
    class_id,
    title,
    source_type: 'typed',
    raw_file_path: null,
    content,
  }

  try {
    const url = process.env.N8N_INBOUND_URL!
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`n8n returned ${res.status}`)
    await supabase.from('essays').update({ status: 'processing' }).eq('id', essay.id)
  } catch {
    await supabase.from('essays').update({ status: 'failed' }).eq('id', essay.id)
    return NextResponse.json({ error: 'n8n dispatch failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, essay_id: essay.id })
}
