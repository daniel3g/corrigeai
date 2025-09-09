-- =========================================================
-- 0) DEFINIÇÕES INICIAIS (AJUSTE AQUI)
-- =========================================================

-- Turmas (altere code/name/year conforme seu padrão)
WITH CLASS_DEFS(code, name, year) AS (
  VALUES
    ('9A', '9º Ano A (Manhã)', EXTRACT(YEAR FROM NOW())::int),
    ('9B', '9º Ano B (Tarde)', EXTRACT(YEAR FROM NOW())::int)
),

-- Professor (1 registro)
TEACHER_INPUT(email, full_name) AS (
  VALUES
    ('prof.lucianamoriyama@colegioprogresso.g12.br', 'Prof. Luciana Moriyama')
),

-- Alunos: e-mail, nome completo e código da turma ("9A" ou "9B")
STUDENT_LIST(email, full_name, class_code) AS (
  VALUES
    ('ana.8443@colegioprogresso.g12.br','Ana Clara Paranhos Lopes','9A'),
    ('ana.8649@colegioprogresso.g12.br','Ana Luiza Bueno Campos','9A'),
    ('arthur.8506@colegioprogresso.g12.br','Arthur Gonçalves','9A'),
    ('barbara.8644@colegioprogresso.g12.br','Barbara Flores Gramacho','9A'),
    ('beatriz.8857@colegioprogresso.g12.br','Beatriz Guadanhin Cruz','9A'),
    ('carmen.8600@colegioprogresso.g12.br','Carmen Regina Alves Santana','9A'),
    ('emanuelly.8628@colegioprogresso.g12.br','Emanuelly Tavares Santana','9A'),
    ('enzo.8012@colegioprogresso.g12.br','Enzo Henrique Corrêa De Oliveira','9A'),
    ('enzo.8326@colegioprogresso.g12.br','Enzo Vilar Da Silva Pires','9A'),
    ('gabrielle.8908@colegioprogresso.g12.br','Gabrielle Andrade Cruz','9A'),
    ('giovana.8827@colegioprogresso.g12.br','Giovana Campos','9A'),
    ('guilherme.9073@colegioprogresso.g12.br','Guilherme Martins Champi Araujo Aves','9A'),
    ('guilherme.9096@colegioprogresso.g12.br','Guilherme Santos Porto','9A'),
    ('igor.8053@colegioprogresso.g12.br','Igor Torralvo Gomes','9A'),
    ('isabella.8710@colegioprogresso.g12.br','Isabella Nalu Rodrigues Esteves','9A'),
    ('jullia.9158@colegioprogresso.g12.br','Júllia Trindade Dantas','9A'),
    ('leandro.9130@colegioprogresso.g12.br','Leandro Sanches Ferreira','9A'),
    ('lorenza.7878@colegioprogresso.g12.br','Lorenza Domingues Jacob','9A'),
    ('luis.8478@colegioprogresso.g12.br','Luis Gustavo Martire Dos Santos','9A'),
    ('mariana.7937@colegioprogresso.g12.br','Mariana Calil De Jesus','9A'),
    ('mateus.8457@colegioprogresso.g12.br','Mateus Tunú Nascimento','9A'),
    ('miguel.8917@colegioprogresso.g12.br','Miguel Batistela','9A'),
    ('miguel.9238@colegioprogresso.g12.br','Miguel Marcelino Dantas Da Silva','9A'),
    ('pedro.7751@colegioprogresso.g12.br','Pedro Valentino Lopez Rufino','9A'),
    ('rafael.8451@colegioprogresso.g12.br','Rafael Oliveira Sobreira','9A'),
    ('sophia.8038@colegioprogresso.g12.br','Sophia Rolo Couto','9A'),
    ('pedro.8844@colegioprogresso.g12.br','Pedro André Brichucka','9A'),
    ('leonardo.9126@colegioprogresso.g12.br','Leonardo Miguel Machado Pereira','9A'),
    ('thiago.7881@colegioprogresso.g12.br','Thiago S Ruy','9A'),
    ('ana.9272@colegioprogresso.g12.br','Ana Sophia Gabriceli','9B'),
    ('arthur.9270@colegioprogresso.g12.br','Arthur Gabriell De Souza Da Silva','9B'),
    ('arthur.9166@colegioprogresso.g12.br','Arthur Motta Pinto','9B'),
    ('felipe.8947@colegioprogresso.g12.br','Felipe Alexandre Longobardi Ribeiro','9B'),
    ('giovana.8479@colegioprogresso.g12.br','Giovana Ciriaco Lemos','9B'),
    ('isadora.7791@colegioprogresso.g12.br','Isadora Pereira Paixão','9B'),
    ('leonardo.8714@colegioprogresso.g12.br','Leonardo Hideki Akaike Carvalho','9B'),
    ('luisa.9044@colegioprogresso.g12.br','Luisa Silva De Oliveira','9B'),
    ('marcia.7986@colegioprogresso.g12.br','Marcia Laura Jacinto Alarcon','9B'),
    ('matheus.9243@colegioprogresso.g12.br','Matheus Silva Macedo','9B'),
    ('miguel.8692@colegioprogresso.g12.br','Miguel De Carvalho Fernandes','9B'),
    ('pedro.8693@colegioprogresso.g12.br','Pedro Henrique Cardoso Mateus','9B'),
    ('ryan.8362@colegioprogresso.g12.br','Ryan Marques Bueno De Mello','9B'),
    ('samuel.8452@colegioprogresso.g12.br','Samuel Mariotto Neto','9B'),
    ('julia.8820@colegioprogresso.g12.br','Julia Ayumi Nishimura','9B'),
    ('mirella.8745@colegioprogresso.g12.br','Mirella Eduarda','9B'),
    ('nina.8949@colegioprogresso.g12.br','Nina Cardoso Carneiro','9B')

),

-- =========================================================
-- 1) CRIA OU REAPROVEITA AS TURMAS
-- =========================================================
UPSERT_CLASSES AS (
  INSERT INTO public.classes (id, code, name, year, metadata, created_at, updated_at)
  SELECT gen_random_uuid(), cd.code, cd.name, cd.year, '{}'::jsonb, NOW(), NOW()
  FROM CLASS_DEFS cd
  ON CONFLICT (code) DO UPDATE
    SET name = EXCLUDED.name,
        year = EXCLUDED.year,
        updated_at = NOW()
  RETURNING id, code
),

-- Mapa (code -> id), incluindo turmas pré-existentes com mesmo code
CLASS_MAP AS (
  SELECT code, id FROM UPSERT_CLASSES
  UNION ALL
  SELECT c.code, c.id
  FROM public.classes c
  WHERE c.code IN (SELECT code FROM CLASS_DEFS)
),

-- =========================================================
-- 2) CRIA O PROFESSOR EM auth E profiles
--    (usa função admin, não requer página do app)
--    *Senha inicial pode ser alterada abaixo; email_confirm=true
-- =========================================================
TEACHER_USER AS (
  SELECT
    (auth.admin.create_user(
      auth.admin.create_user_params(
        email         := t.email,
        password      := 'Lu@2025',
        email_confirm := true
      )
    )).id AS id,
    t.full_name
  FROM TEACHER_INPUT t
  -- opcional: evitar recriar se já existir
  WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.email = t.email)
),
UPSERT_TEACHER_PROFILE AS (
  INSERT INTO public.profiles (id, role, full_name, created_at, updated_at)
  SELECT id, 'teacher'::user_role, full_name, NOW(), NOW()
  FROM TEACHER_USER
  ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        updated_at = NOW()
  RETURNING id
),


-- =========================================================
-- 3) CRIA OS ALUNOS EM auth E profiles
--    *Troque 'Aluno@2025' se quiser outra senha inicial padrão
-- =========================================================
STUDENT_USERS AS (
  SELECT
    (auth.admin.create_user(
      auth.admin.create_user_params(
        email         := s.email,
        password      := COALESCE(
                           (regexp_match(split_part(s.email,'@',1), '\.(\d{4})$'))[1] || '#2025',
                           'Temp#2025'
                         ),
        email_confirm := true
      )
    )).id AS id,
    s.full_name,
    s.class_code
  FROM STUDENT_LIST s
  -- opcional: evita erro se já existir o e-mail no auth
  WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.email = s.email)
),
UPSERT_STUDENT_PROFILES AS (
  INSERT INTO public.profiles (id, role, full_name, created_at, updated_at)
  SELECT id, 'student'::user_role, full_name, NOW(), NOW()
  FROM STUDENT_USERS
  ON CONFLICT (id) DO UPDATE
    SET role = 'student'::user_role,
        full_name = EXCLUDED.full_name,
        updated_at = NOW()
  RETURNING id
),


-- =========================================================
-- 5) MATRICULA OS ALUNOS NAS RESPECTIVAS TURMAS
-- =========================================================
ENROLLMENTS AS (
  INSERT INTO public.class_enrollments (class_id, student_id, status, created_at)
  SELECT cm.id, su.id, 'active'::enrollment_status, NOW()
  FROM STUDENT_USERS su
  JOIN CLASS_MAP cm ON cm.code = su.class_code
  ON CONFLICT DO NOTHING
  RETURNING class_id, student_id
)

-- Resultado “amigável” ao final
SELECT
  (SELECT COUNT(*) FROM TEACHER_USER)   AS teachers_created,
  (SELECT COUNT(*) FROM STUDENT_USERS)  AS students_created,
  (SELECT COUNT(*) FROM SET_TEACHER_CLASSES) AS teacher_class_links,
  (SELECT COUNT(*) FROM ENROLLMENTS)    AS enrollments_created;
