import { NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase/server'
import crypto from 'crypto'

export const runtime = 'nodejs' // precisa de Node p/ multipart

export async function POST(req: Request) {
  const supabase = createServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const class_id = formData.get('class_id') as string | null
  const title = (formData.get('title') as string | null) ?? 'Redação'
  const typed = formData.get('content') as string | null
  const file = formData.get('file') as File | null

  if (!class_id) return NextResponse.json({ error: 'class_id required' }, { status: 400 })
  if (!typed && !file) return NextResponse.json({ error: 'content or file required' }, { status: 400 })

  // cria essay
  const source_type = typed ? 'typed' : (file?.type?.startsWith('image/') ? 'image' : 'file')
  const { data: essay, error: e1 } = await supabase
    .from('essays')
    .insert({
      student_id: user.id,
      class_id,
      title,
      content: typed ?? null,
      source_type,
      status: 'queued',
    })
    .select('id, student_id')
    .single()

  if (e1 || !essay) return NextResponse.json({ error: e1?.message || 'insert failed' }, { status: 400 })

  let uploadedPath: string | null = null

  if (file) {
    // upload pro Storage
    const ext = file.name.split('.').pop() || 'bin'
    const path = `essays/${essay.student_id}/${essay.id}/original.${ext}`
    const arrayBuffer = await file.arrayBuffer()
    const { error: eUp } = await supabase.storage
      .from('essays')
      .upload(path, Buffer.from(arrayBuffer), { upsert: true, contentType: file.type || 'application/octet-stream' })
    if (eUp) return NextResponse.json({ error: eUp.message }, { status: 400 })
    uploadedPath = path

    // salva caminho bruto na tabela (opcional)
    await supabase.from('essays').update({ raw_file_path: path }).eq('id', essay.id)
  }

  // dispara n8n
  const payload = {
    essay_id: essay.id,
    student_id: essay.student_id,
    class_id,
    source_type,
    raw_file_path: uploadedPath,
    content: typed, // pode ser null
  }

  try {
    const url = process.env.N8N_INBOUND_URL!
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`n8n returned ${res.status}`)
    // marca como processing
    await supabase.from('essays').update({ status: 'processing' }).eq('id', essay.id)
  } catch (err) {
    await supabase.from('essays').update({ status: 'failed' }).eq('id', essay.id)
    return NextResponse.json({ error: 'n8n dispatch failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, essay_id: essay.id })
}
