-- ============================================================================
-- CORRIGIR VISUALIZAÇÃO DE PEDIDOS
-- ============================================================================

-- 1. Verificar se há pedidos na tabela
SELECT 
    COUNT(*) as total_pedidos,
    COUNT(DISTINCT buyer_id) as total_compradores,
    COUNT(DISTINCT seller_id) as total_vendedores
FROM orders;

-- 2. Ver alguns pedidos (últimos 5)
SELECT 
    id,
    buyer_id,
    seller_id,
    product_id,
    total_amount,
    status,
    payment_method,
    created_at
FROM orders
ORDER BY created_at DESC
LIMIT 5;

-- 3. Verificar políticas RLS para SELECT
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'orders'
AND cmd = 'SELECT';

-- 4. Criar/Atualizar política de SELECT se necessário
DROP POLICY IF EXISTS "Usuários podem ver seus pedidos" ON orders;

CREATE POLICY "Usuários podem ver seus pedidos"
ON orders
FOR SELECT
TO authenticated
USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- 5. Verificar se a política foi criada
SELECT 
    policyname,
    cmd as operacao,
    'Permite ver pedidos onde é comprador ou vendedor' as descricao
FROM pg_policies
WHERE tablename = 'orders'
AND policyname = 'Usuários podem ver seus pedidos';

-- 6. Testar consulta como usuário específico
-- Substitua pelo seu UUID
DO $$
DECLARE
    test_user_id UUID := '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3';
    pedidos_count INTEGER;
BEGIN
    -- Contar pedidos do usuário
    SELECT COUNT(*) INTO pedidos_count
    FROM orders
    WHERE buyer_id = test_user_id OR seller_id = test_user_id;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '📊 TESTE DE CONSULTA DE PEDIDOS';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '👤 User ID: %', test_user_id;
    RAISE NOTICE '📦 Total de pedidos: %', pedidos_count;
    RAISE NOTICE '';
    
    IF pedidos_count > 0 THEN
        RAISE NOTICE '✅ Usuário tem % pedido(s)', pedidos_count;
        RAISE NOTICE '✅ A consulta deve funcionar no app';
    ELSE
        RAISE NOTICE '⚠️  Usuário não tem pedidos ainda';
        RAISE NOTICE '   Faça uma compra para testar';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '';
END $$;

-- 7. Ver detalhes dos pedidos do usuário
-- Substitua pelo seu UUID
SELECT 
    o.id,
    o.buyer_id,
    o.seller_id,
    o.product_id,
    o.total_amount,
    o.status,
    o.payment_method,
    o.created_at,
    p.title as produto_nome,
    p.price as produto_preco
FROM orders o
LEFT JOIN products p ON o.product_id = p.id
WHERE o.buyer_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3'
   OR o.seller_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3'
ORDER BY o.created_at DESC;
