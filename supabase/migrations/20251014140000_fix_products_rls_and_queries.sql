-- Correção das políticas RLS para produtos
-- Permite que todos vejam produtos aprovados, independente do status

-- Remover todas as políticas antigas de SELECT
DROP POLICY IF EXISTS "Produtos públicos são visíveis para todos" ON public.products;
DROP POLICY IF EXISTS "Admins podem ver todos os produtos" ON public.products;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios produtos" ON public.products;

-- Criar política unificada que cobre todos os casos
CREATE POLICY "Política de visualização de produtos" ON public.products
    FOR SELECT USING (
        -- Produtos aprovados e ativos são visíveis para todos
        (approval_status = 'approved' AND status = 'active')
        OR
        -- Admins podem ver todos os produtos
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
        OR
        -- Usuários podem ver seus próprios produtos
        auth.uid() = user_id
    );

-- Adicionar índice para melhorar performance das queries
CREATE INDEX IF NOT EXISTS idx_products_approval_status_status ON public.products(approval_status, status);

-- Comentários
COMMENT ON POLICY "Política de visualização de produtos" ON public.products IS 
'Política unificada que permite:
1. Todos os usuários vejam produtos aprovados e ativos
2. Administradores vejam todos os produtos (independente do status)
3. Usuários vejam seus próprios produtos (independente do status de aprovação)';
