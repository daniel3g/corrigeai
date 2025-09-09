import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// aproveita as que já estão no .env.local
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE) {
  throw new Error('Faltando SUPABASE_URL ou SERVICE_ROLE. Confira seu .env.local')
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)


const teacher = { email: 'prof.lucianamoriyama@colegioprogresso.g12.br', full_name: 'Prof. Luciana Moriyama', password: 'Lu@2025' }

const students = [
  // email, nome, turma
  ['ana.8443@colegioprogresso.g12.br','Ana Clara Paranhos Lopes','9A'],
  ['ana.8649@colegioprogresso.g12.br','Ana Luiza Bueno Campos','9A'],
  ['arthur.8506@colegioprogresso.g12.br','Arthur Gonçalves','9A'],
  ['barbara.8644@colegioprogresso.g12.br','Barbara Flores Gramacho','9A'],
  ['beatriz.8857@colegioprogresso.g12.br','Beatriz Guadanhin Cruz','9A'],
  ['carmen.8600@colegioprogresso.g12.br','Carmen Regina Alves Santana','9A'],
  ['emanuelly.8628@colegioprogresso.g12.br','Emanuelly Tavares Santana','9A'],
  ['enzo.8012@colegioprogresso.g12.br','Enzo Henrique Corrêa De Oliveira','9A'],
  ['enzo.8326@colegioprogresso.g12.br','Enzo Vilar Da Silva Pires','9A'],
  ['gabrielle.8908@colegioprogresso.g12.br','Gabrielle Andrade Cruz','9A'],
  ['giovana.8827@colegioprogresso.g12.br','Giovana Campos','9A'],
  ['guilherme.9073@colegioprogresso.g12.br','Guilherme Martins Champi Araujo Aves','9A'],
  ['guilherme.9096@colegioprogresso.g12.br','Guilherme Santos Porto','9A'],
  ['igor.8053@colegioprogresso.g12.br','Igor Torralvo Gomes','9A'],
  ['isabella.8710@colegioprogresso.g12.br','Isabella Nalu Rodrigues Esteves','9A'],
  ['jullia.9158@colegioprogresso.g12.br','Júllia Trindade Dantas','9A'],
  ['leandro.9130@colegioprogresso.g12.br','Leandro Sanches Ferreira','9A'],
  ['lorenza.7878@colegioprogresso.g12.br','Lorenza Domingues Jacob','9A'],
  ['luis.8478@colegioprogresso.g12.br','Luis Gustavo Martire Dos Santos','9A'],
  ['mariana.7937@colegioprogresso.g12.br','Mariana Calil De Jesus','9A'],
  ['mateus.8457@colegioprogresso.g12.br','Mateus Tunú Nascimento','9A'],
  ['miguel.8917@colegioprogresso.g12.br','Miguel Batistela','9A'],
  ['miguel.9238@colegioprogresso.g12.br','Miguel Marcelino Dantas Da Silva','9A'],
  ['pedro.7751@colegioprogresso.g12.br','Pedro Valentino Lopez Rufino','9A'],
  ['rafael.8451@colegioprogresso.g12.br','Rafael Oliveira Sobreira','9A'],
  ['sophia.8038@colegioprogresso.g12.br','Sophia Rolo Couto','9A'],
  ['pedro.8844@colegioprogresso.g12.br','Pedro André Brichucka','9A'],
  ['leonardo.9126@colegioprogresso.g12.br','Leonardo Miguel Machado Pereira','9A'],
  ['thiago.7881@colegioprogresso.g12.br','Thiago S Ruy','9A'],
  ['ana.9272@colegioprogresso.g12.br','Ana Sophia Gabriceli','9B'],
  ['arthur.9270@colegioprogresso.g12.br','Arthur Gabriell De Souza Da Silva','9B'],
  ['arthur.9166@colegioprogresso.g12.br','Arthur Motta Pinto','9B'],
  ['felipe.8947@colegioprogresso.g12.br','Felipe Alexandre Longobardi Ribeiro','9B'],
  ['giovana.8479@colegioprogresso.g12.br','Giovana Ciriaco Lemos','9B'],
  ['isadora.7791@colegioprogresso.g12.br','Isadora Pereira Paixão','9B'],
  ['leonardo.8714@colegioprogresso.g12.br','Leonardo Hideki Akaike Carvalho','9B'],
  ['luisa.9044@colegioprogresso.g12.br','Luisa Silva De Oliveira','9B'],
  ['marcia.7986@colegioprogresso.g12.br','Marcia Laura Jacinto Alarcon','9B'],
  ['matheus.9243@colegioprogresso.g12.br','Matheus Silva Macedo','9B'],
  ['miguel.8692@colegioprogresso.g12.br','Miguel De Carvalho Fernandes','9B'],
  ['pedro.8693@colegioprogresso.g12.br','Pedro Henrique Cardoso Mateus','9B'],
  ['ryan.8362@colegioprogresso.g12.br','Ryan Marques Bueno De Mello','9B'],
  ['samuel.8452@colegioprogresso.g12.br','Samuel Mariotto Neto','9B'],
  ['julia.8820@colegioprogresso.g12.br','Julia Ayumi Nishimura','9B'],
  ['mirella.8745@colegioprogresso.g12.br','Mirella Eduarda','9B'],
  ['nina.8949@colegioprogresso.g12.br','Nina Cardoso Carneiro','9B'],
]

const pwdFromEmail = (email) => {
  const local = email.split('@')[0]
  const m = local.match(/\.([0-9]{4})$/)
  return (m ? m[1] : 'Temp') + '#2025'
}

async function ensureUser(email, password, full_name, class_code) {
  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name, class_code }
  })
  if (error) {
    if (error.message?.includes('already registered')) {
      console.log('Já existe:', email)
      return null
    }
    throw error
  }
  console.log('Criado:', email)
  return data?.user?.id ?? null
}

async function main() {
  // professor
  await ensureUser(teacher.email, teacher.password, teacher.full_name, 'ALL')

  // alunos
  for (const [email, full_name, class_code] of students) {
    await ensureUser(email, pwdFromEmail(email), full_name, class_code)
  }
  console.log('Concluído.')
}

main().catch((e) => { console.error(e); process.exit(1) })
