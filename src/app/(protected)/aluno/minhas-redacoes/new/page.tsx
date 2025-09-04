'use client'
import { useState } from 'react'

export default function NewEssayPage() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setMsg('')
    const form = e.currentTarget
    const fd = new FormData(form)
    const res = await fetch('/api/essays', { method: 'POST', body: fd })
    const json = await res.json()
    setLoading(false)
    setMsg(res.ok ? 'Enviado! Aguarde a correção.' : `Erro: ${json.error}`)
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-3 max-w-lg">
      <input name="title" className="w-full border rounded px-3 py-2" placeholder="Título (opcional)" />
      <input name="class_id" className="w-full border rounded px-3 py-2" placeholder="ID da turma" required />
      <textarea name="content" className="w-full border rounded px-3 py-2" rows={6} placeholder="Cole o texto (ou anexe arquivo abaixo)"></textarea>
      <input name="file" type="file" className="block" />
      <button disabled={loading} className="rounded bg-black text-white px-4 py-2">
        {loading ? 'Enviando…' : 'Enviar'}
      </button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  )
}
