'use client'


import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'


export default function LoginPage() {
const supabase = createClient()
const [email, setEmail] = useState('')
const [loading, setLoading] = useState(false)
const [ok, setOk] = useState('')
const [err, setErr] = useState('')


async function signIn() {
setLoading(true)
setOk('')
setErr('')
const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/auth/callback` } })
setLoading(false)
if (error) setErr(error.message)
else setOk('Enviamos um link mágico para seu e-mail.')
}


return (
<main className="p-6 max-w-sm mx-auto">
<h1 className="text-xl font-semibold">Entrar</h1>
<input
className="mt-4 w-full rounded border px-3 py-2"
placeholder="seu@email.com"
value={email}
onChange={(e) => setEmail(e.target.value)}
/>
<button
onClick={signIn}
disabled={loading}
className="mt-3 w-full rounded bg-black px-3 py-2 text-white"
>
{loading ? 'Enviando…' : 'Receber link mágico'}
</button>
{ok && <p className="mt-3 text-green-600 text-sm">{ok}</p>}
{err && <p className="mt-3 text-red-600 text-sm">{err}</p>}
</main>
)
}