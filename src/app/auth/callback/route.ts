import { NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase/server'


export async function GET(request: Request) {
const { searchParams, origin } = new URL(request.url)
const code = searchParams.get('code')


if (!code) {
return NextResponse.redirect(`${origin}/login`)
}


const supabase = createServer()
const { error } = await supabase.auth.exchangeCodeForSession(code)


// Redireciona para dashboard (ou página anterior)
return NextResponse.redirect(`${origin}${error ? '/login?error=1' : '/dashboard'}`)
}