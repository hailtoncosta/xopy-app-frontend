-- Remover políticas antigas que consultam auth.users diretamente
DROP POLICY IF EXISTS "Admins podem atualizar produtos para aprovação" ON public.products;
DROP POLICY IF EXISTS "Admins podem visualizar todos os produtos" ON public.products;

-- Remover políticas duplicadas/antigas do admin_settings que consultam auth.users
DROP POLICY IF EXISTS "Apenas admins podem acessar configurações" ON public.admin_settings;

-- As políticas products_select, products_update, products_insert, products_delete já usam is_admin() corretamente
-- Vamos apenas garantir que não há conflitos

-- Verificar e recriar política de leitura pública para produtos aprovados
DROP POLICY IF EXISTS "products_select" ON public.products;
CREATE POLICY "products_select" ON public.products
FOR SELECT
USING (
  (approval_status = 'approved' AND status = 'active')
  OR (auth.uid() = user_id)
  OR is_admin()
);

-- Verificar política de inserção
DROP POLICY IF EXISTS "products_insert" ON public.products;
CREATE POLICY "products_insert" ON public.products
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Verificar política de atualização
DROP POLICY IF EXISTS "products_update" ON public.products;
CREATE POLICY "products_update" ON public.products
FOR UPDATE
USING ((auth.uid() = user_id) OR is_admin());

-- Verificar política de deleção
DROP POLICY IF EXISTS "products_delete" ON public.products;
CREATE POLICY "products_delete" ON public.products
FOR DELETE
USING ((auth.uid() = user_id) OR is_admin());