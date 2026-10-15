-- SINCRONIZAÇÃO FORÇADA DE USUÁRIOS
-- Este script desabilita temporariamente o RLS para garantir a inserção
-- Execute este script no SQL Editor do Supabase

-- PASSO 1: Desabilitar RLS temporariamente
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Verificar quantos usuários existem
SELECT 'Antes da sincronização:' as status;
SELECT 'auth.users' as tabela, COUNT(*) as total FROM auth.users;
SELECT 'user_profiles' as tabela, COUNT(*) as total FROM user_profiles;

-- PASSO 3: Limpar user_profiles (opcional, apenas se quiser recomeçar)
-- DESCOMENTE a linha abaixo se quiser limpar e recomeçar
-- DELETE FROM user_profiles;

-- PASSO 4: Inserir TODOS os usuários de auth.users
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  phone,
  user_type,
  avatar_url,
  is_verified,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'name',
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'given_name',
    SPLIT_PART(au.email, '@', 1),
    'Usuário'
  ) as full_name,
  au.raw_user_meta_data->>'phone' as phone,
  COALESCE(
    au.raw_user_meta_data->>'type',
    au.raw_user_meta_data->>'user_type',
    'customer'
  ) as user_type,
  COALESCE(
    au.raw_user_meta_data->>'avatar_url',
    au.raw_user_meta_data->>'picture',
    au.raw_user_meta_data->>'avatar',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  ) as avatar_url,
  CASE WHEN au.email_confirmed_at IS NOT NULL THEN true ELSE false END as is_verified,
  au.created_at,
  COALESCE(au.updated_at, au.created_at) as updated_at
FROM auth.users au
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
  avatar_url = COALESCE(EXCLUDED.avatar_url, user_profiles.avatar_url),
  is_verified = EXCLUDED.is_verified,
  updated_at = NOW();

-- PASSO 5: Verificar resultado
SELECT 'Após sincronização:' as status;
SELECT 'user_profiles' as tabela, COUNT(*) as total FROM user_profiles;

-- PASSO 6: Listar usuários inseridos
SELECT 
  email,
  full_name,
  user_type,
  is_verified,
  created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 25;

-- PASSO 7: REABILITAR RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- PASSO 8: Adicionar política para permitir leitura pública (para o admin)
-- Remover políticas antigas que podem estar bloqueando
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON user_profiles;

-- Criar política que permite ao admin ler todos os usuários
CREATE POLICY "Admin can read all user profiles"
  ON user_profiles
  FOR SELECT
  USING (true);

-- Política para usuários lerem seu próprio perfil
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Política para usuários atualizarem seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Política para inserção (via trigger)
CREATE POLICY "Enable insert for authenticated users"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- PASSO 9: Verificação final
SELECT '✅ SINCRONIZAÇÃO CONCLUÍDA!' as resultado;
SELECT 
  'Total de usuários sincronizados:' as info,
  COUNT(*) as total
FROM user_profiles;
