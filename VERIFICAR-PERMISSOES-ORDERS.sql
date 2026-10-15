-- ============================================================================
-- VERIFICAR E AJUSTAR PERMISSÕES DA TABELA ORDERS
-- ============================================================================

-- 1. Verificar se RLS está habilitado
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'orders';

-- 2. Ver políticas existentes
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
WHERE tablename = 'orders';

-- 3. Desabilitar RLS temporariamente para testes (CUIDADO!)
-- Descomente apenas se quiser testar sem RLS
/*
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
*/

-- 4. Ou criar política permissiva para usuários autenticados
-- Permite que usuários autenticados criem pedidos
DROP POLICY IF EXISTS "Usuários podem criar seus próprios pedidos" ON orders;

CREATE POLICY "Usuários podem criar seus próprios pedidos"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (buyer_id = auth.uid());

-- Permite que usuários vejam seus próprios pedidos (como comprador ou vendedor)
DROP POLICY IF EXISTS "Usuários podem ver seus pedidos" ON orders;

CREATE POLICY "Usuários podem ver seus pedidos"
ON orders
FOR SELECT
TO authenticated
USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Permite que vendedores atualizem status dos pedidos
DROP POLICY IF EXISTS "Vendedores podem atualizar pedidos" ON orders;

CREATE POLICY "Vendedores podem atualizar pedidos"
ON orders
FOR UPDATE
TO authenticated
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());

-- 5. Verificar políticas criadas
SELECT 
    policyname,
    cmd as operacao,
    CASE 
        WHEN cmd = 'INSERT' THEN 'Criar pedidos'
        WHEN cmd = 'SELECT' THEN 'Ver pedidos'
        WHEN cmd = 'UPDATE' THEN 'Atualizar pedidos'
        WHEN cmd = 'DELETE' THEN 'Deletar pedidos'
    END as descricao
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY cmd;

-- 6. Testar se o usuário atual pode inserir
-- Substitua o UUID pelo seu UUID de usuário
DO $$
DECLARE
    test_user_id UUID := '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3';
    test_product_id UUID;
BEGIN
    -- Pegar um produto qualquer para teste
    SELECT id INTO test_product_id
    FROM products
    WHERE user_id = test_user_id
    LIMIT 1;
    
    IF test_product_id IS NULL THEN
        RAISE NOTICE '⚠️  Nenhum produto encontrado para teste';
        RETURN;
    END IF;
    
    RAISE NOTICE '🧪 Testando inserção de pedido...';
    RAISE NOTICE '   User ID: %', test_user_id;
    RAISE NOTICE '   Product ID: %', test_product_id;
    
    -- Tentar inserir um pedido de teste
    BEGIN
        INSERT INTO orders (
            buyer_id,
            seller_id,
            product_id,
            total_amount,
            marketplace_fee,
            seller_amount,
            shipping_cost,
            payment_method,
            status
        ) VALUES (
            test_user_id,
            test_user_id,
            test_product_id,
            100.00,
            10.00,
            90.00,
            0,
            'credit_card',
            'pending'
        );
        
        RAISE NOTICE '✅ Inserção bem-sucedida!';
        RAISE NOTICE '   As políticas RLS estão funcionando corretamente';
        
        -- Remover o pedido de teste
        DELETE FROM orders 
        WHERE buyer_id = test_user_id 
        AND product_id = test_product_id 
        AND status = 'pending'
        AND total_amount = 100.00;
        
        RAISE NOTICE '🧹 Pedido de teste removido';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro ao inserir: %', SQLERRM;
        RAISE NOTICE '   Verifique as políticas RLS';
    END;
END $$;
