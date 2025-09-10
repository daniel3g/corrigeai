import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const { data, error } = await supabase.auth.admin.createUser({
  email: 'prof.danielsilva@colegioprogresso.g12.br',
  password: 'G_midia@88',
  email_confirm: true,
  user_metadata: { full_name: 'Prof. Daniel Silva' }
})
if (error) throw error
console.log('Professor criado:', data.user.id)
