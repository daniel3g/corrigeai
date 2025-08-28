import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'


export async function middleware(req: NextRequest) {
const res = NextResponse.next()


// Somente roda para caminhos protegidos
const isProtected = req.nextUrl.pathname.startsWith('/(protected)')
if (!isProtected) return res


const supabase = createServerClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
{
cookies: {
get(name: string) {
return req.cookies.get(name)?.value
},
set(name: string, value: string, options: any) {
res.cookies.set({ name, value, ...options })
},
remove(name: string, options: any) {
res.cookies.set({ name, value: '', ...options })
},
},
}
)


const {
data: { session },
} = await supabase.auth.getSession()


if (!session) {
const url = req.nextUrl.clone()
url.pathname = '/login'
url.searchParams.set('redirectedFrom', req.nextUrl.pathname)
return NextResponse.redirect(url)
}


return res
}


export const config = {
matcher: [
// Protege tudo dentro do grupo (protected)
'/(protected)/(.*)'
],
}