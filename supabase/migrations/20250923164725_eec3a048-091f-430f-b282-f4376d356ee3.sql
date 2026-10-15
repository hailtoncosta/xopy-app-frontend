-- Criar política para admins poderem aprovar produtos de qualquer usuário
CREATE POLICY "Admins podem atualizar produtos para aprovação" 
ON public.products 
FOR UPDATE 
USING (
  -- Admin pode aprovar qualquer produto
  (auth.jwt() ->> 'role')::text = 'admin' OR
  -- Ou o usuário pode atualizar seu próprio produto
  auth.uid() = user_id
);

-- Remover a política anterior que só permitia usuários atualizarem seus próprios produtos
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios produtos" ON public.products;