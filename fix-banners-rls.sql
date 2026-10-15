-- Script para corrigir políticas RLS da tabela dynamic_banners
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name = 'dynamic_banners';

-- 2. Verificar políticas RLS existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'dynamic_banners';

-- 3. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Allow public read access" ON dynamic_banners;
DROP POLICY IF EXISTS "Allow admin full access" ON dynamic_banners;
DROP POLICY IF EXISTS "Enable read access for all users" ON dynamic_banners;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON dynamic_banners;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON dynamic_banners;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON dynamic_banners;

-- 4. Criar políticas RLS corretas

-- Política de leitura pública (qualquer um pode ler banners ativos)
CREATE POLICY "public_read_banners" 
ON dynamic_banners
FOR SELECT
USING (true);

-- Política de inserção para usuários autenticados
CREATE POLICY "authenticated_insert_banners" 
ON dynamic_banners
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política de atualização para usuários autenticados
CREATE POLICY "authenticated_update_banners" 
ON dynamic_banners
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política de exclusão para usuários autenticados
CREATE POLICY "authenticated_delete_banners" 
ON dynamic_banners
FOR DELETE
TO authenticated
USING (true);

-- 5. Garantir que RLS está habilitado
ALTER TABLE dynamic_banners ENABLE ROW LEVEL SECURITY;

-- 6. Verificar as novas políticas
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'dynamic_banners';

-- 7. Testar acesso
SELECT COUNT(*) as total_banners FROM dynamic_banners;
SELECT id, title, is_active FROM dynamic_banners LIMIT 3;
