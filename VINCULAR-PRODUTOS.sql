-- ============================================================================
-- VINCULAR PRODUTOS: Atualizar dynamic_products com source_product_id
-- ============================================================================
-- Este script vincula os produtos em dynamic_products aos produtos reais
-- em products através do campo source_product_id
-- ============================================================================

DO $$
DECLARE
    dp_record RECORD;
    produto_real RECORD;
    vinculados INTEGER := 0;
    nao_encontrados INTEGER := 0;
BEGIN
    RAISE NOTICE '🔗 Iniciando vinculação de produtos...';
    RAISE NOTICE '';

    -- Para cada produto em dynamic_products
    FOR dp_record IN 
        SELECT * FROM dynamic_products 
        WHERE is_active = true
        ORDER BY id
    LOOP
        -- Buscar produto correspondente em products pelo nome
        SELECT * INTO produto_real
        FROM products
        WHERE title = dp_record.name
        AND user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3'
        LIMIT 1;

        IF FOUND THEN
            -- Atualizar source_product_id
            UPDATE dynamic_products
            SET source_product_id = produto_real.id
            WHERE id = dp_record.id;

            RAISE NOTICE '✅ [%] % → UUID: %', 
                dp_record.id, 
                dp_record.name, 
                SUBSTRING(produto_real.id::TEXT, 1, 8) || '...';
            
            vinculados := vinculados + 1;
        ELSE
            RAISE NOTICE '⚠️  [%] % → Produto não encontrado em products', 
                dp_record.id, 
                dp_record.name;
            
            nao_encontrados := nao_encontrados + 1;
        END IF;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '📊 RESUMO DA VINCULAÇÃO:';
    RAISE NOTICE '   ✅ Produtos vinculados: %', vinculados;
    RAISE NOTICE '   ⚠️  Não encontrados: %', nao_encontrados;
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '';

    IF vinculados > 0 THEN
        RAISE NOTICE '🎉 VINCULAÇÃO CONCLUÍDA!';
        RAISE NOTICE '';
        RAISE NOTICE '✅ Produtos em dynamic_products agora apontam para products';
        RAISE NOTICE '✅ O checkout deve funcionar normalmente';
        RAISE NOTICE '';
    END IF;

END $$;

-- Verificar vinculações
SELECT 
    dp.id as dynamic_id,
    dp.name,
    dp.source_product_id,
    p.id as product_id,
    p.title,
    CASE 
        WHEN dp.source_product_id IS NOT NULL THEN '✅ Vinculado'
        ELSE '❌ Não vinculado'
    END as status
FROM dynamic_products dp
LEFT JOIN products p ON dp.source_product_id = p.id
WHERE dp.is_active = true
ORDER BY dp.id
LIMIT 20;

-- Contar vinculações
SELECT 
    COUNT(*) as total,
    COUNT(source_product_id) as vinculados,
    COUNT(*) - COUNT(source_product_id) as nao_vinculados
FROM dynamic_products
WHERE is_active = true;
