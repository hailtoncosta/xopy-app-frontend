-- Correção segura das políticas RLS para produtos
-- Esta versão evita erros 500 ao verificar se a tabela user_roles existe

-- Desabilitar RLS temporariamente para limpar políticas
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "Produtos públicos são visíveis para todos" ON public.products;
DROP POLICY IF EXISTS "Admins podem ver todos os produtos" ON public.products;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios produtos" ON public.products;
DROP POLICY IF EXISTS "Política de visualização de produtos" ON public.products;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios produtos" ON public.products;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios produtos" ON public.products;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios produtos" ON public.products;

-- Reabilitar RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Criar política simples e segura para SELECT
CREATE POLICY "select_products_policy" ON public.products
    FOR SELECT
    USING (
        -- Caso 1: Produto aprovado e ativo (público)
        (approval_status = 'approved' AND status = 'active')
        OR
        -- Caso 2: Usuário é dono do produto
        (auth.uid() = user_id)
        OR
        -- Caso 3: Usuário é admin (verificação segura)
        (
            auth.uid() IN (
                SELECT user_id 
                FROM public.user_roles 
                WHERE role = 'admin'
            )
        )
    );

-- Política para INSERT (usuários podem criar seus produtos)
CREATE POLICY "insert_products_policy" ON public.products
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE (usuários podem atualizar seus produtos, admins podem atualizar qualquer um)
CREATE POLICY "update_products_policy" ON public.products
    FOR UPDATE
    USING (
        auth.uid() = user_id
        OR
        auth.uid() IN (
            SELECT user_id 
            FROM public.user_roles 
            WHERE role = 'admin'
        )
    );

-- Política para DELETE (usuários podem deletar seus produtos, admins podem deletar qualquer um)
CREATE POLICY "delete_products_policy" ON public.products
    FOR DELETE
    USING (
        auth.uid() = user_id
        OR
        auth.uid() IN (
            SELECT user_id 
            FROM public.user_roles 
            WHERE role = 'admin'
        )
    );

-- Adicionar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_products_approval_status_status ON public.products(approval_status, status);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);

-- Comentários
COMMENT ON POLICY "select_products_policy" ON public.products IS 
'Permite visualização de produtos aprovados (público), próprios produtos (usuário), ou todos produtos (admin)';

COMMENT ON POLICY "insert_products_policy" ON public.products IS 
'Permite que usuários criem seus próprios produtos';

COMMENT ON POLICY "update_products_policy" ON public.products IS 
'Permite que usuários atualizem seus próprios produtos, ou admins atualizem qualquer produto';

COMMENT ON POLICY "delete_products_policy" ON public.products IS 
'Permite que usuários deletem seus próprios produtos, ou admins deletem qualquer produto';
