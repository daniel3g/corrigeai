'use client'
import { useState } from 'react'

export default function NewEssayPage() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setMsg('')
    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/essays', { method: 'POST', body: fd })
    const json = await res.json()
    setLoading(false)
    setMsg(res.ok ? 'Enviado! Aguarde a correção.' : `Erro: ${json.error}`)
    if (res.ok) (e.currentTarget as HTMLFormElement).reset()
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-3 max-w-lg">
      <input
        name="title"
        className="w-full border rounded px-3 py-2"
        placeholder="Tema da redação (opcional)"
      />
      <textarea
        name="content"
        required
        className="w-full border rounded px-3 py-2"
        rows={8}
        placeholder="Cole o texto da redação aqui"
      />
      <button disabled={loading} className="rounded bg-black text-white px-4 py-2">
        {loading ? 'Enviando…' : 'Enviar'}
      </button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  )
}
