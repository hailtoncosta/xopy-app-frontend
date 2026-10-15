-- Habilitar RLS nas tabelas que não têm
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Criar política para admin_settings - apenas admins podem acessar
CREATE POLICY "Apenas admins podem acessar configurações" 
ON public.admin_settings 
FOR ALL 
USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE email IN (
    'admin@pedreiro.com',  -- substitua pelo email do admin principal
    'admin@example.com'     -- adicione outros emails de admin conforme necessário
  )
));

-- Atualizar política de produtos para usar verificação de email admin ao invés de JWT role
DROP POLICY IF EXISTS "Admins podem atualizar produtos para aprovação" ON public.products;

CREATE POLICY "Admins podem atualizar produtos para aprovação" 
ON public.products 
FOR UPDATE 
USING (
  -- Admin pode aprovar qualquer produto (usando email)
  auth.uid() IN (
    SELECT id FROM auth.users WHERE email IN (
      'admin@pedreiro.com',
      'admin@example.com'
    )
  ) OR
  -- Ou o usuário pode atualizar seu próprio produto
  auth.uid() = user_id
);

-- Política para admins visualizarem todos os produtos
CREATE POLICY "Admins podem visualizar todos os produtos" 
ON public.products 
FOR SELECT 
USING (
  -- Produtos ativos são visíveis para todos
  (status)::text = 'active' OR
  -- Admin pode ver todos os produtos
  auth.uid() IN (
    SELECT id FROM auth.users WHERE email IN (
      'admin@pedreiro.com',
      'admin@example.com'
    )
  ) OR
  -- Usuário pode ver seus próprios produtos
  auth.uid() = user_id
);