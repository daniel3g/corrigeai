import Link from "next/link"

export default function Home() {
return (
<main className="p-6">
<h1 className="text-2xl font-semibold">CorrigeAI</h1>
<p className="mt-2 text-sm text-gray-600">Bem-vindo! Faça login para acessar seu painel.</p>
<Link href="/login" className="text-sm">Fazer Login</Link>
</main>
)
}