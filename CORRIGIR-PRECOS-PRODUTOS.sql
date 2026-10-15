-- ============================================================================
-- CORRIGIR PREÇOS DOS PRODUTOS
-- ============================================================================
-- Este script corrige os preços dos produtos que ficaram como 0.01
-- durante a migração
-- ============================================================================

-- 1. Ver produtos com preço incorreto (0.01)
SELECT 
    id,
    title,
    price,
    category,
    '❌ Preço incorreto' as status
FROM products
WHERE price = 0.01
ORDER BY title;

-- 2. Ver produtos em dynamic_products para comparar preços
SELECT 
    dp.id as dynamic_id,
    dp.name,
    dp.price as preco_dynamic,
    p.id as product_id,
    p.title,
    p.price as preco_products,
    CASE 
        WHEN p.price = 0.01 THEN '❌ Precisa corrigir'
        ELSE '✅ OK'
    END as status
FROM dynamic_products dp
LEFT JOIN products p ON dp.source_product_id = p.id
WHERE dp.is_active = true
ORDER BY dp.id;

-- 3. Atualizar preços dos produtos baseado em dynamic_products
DO $$
DECLARE
    dp_record RECORD;
    preco_limpo DECIMAL(10,2);
    produtos_atualizados INTEGER := 0;
BEGIN
    RAISE NOTICE '🔧 Iniciando correção de preços...';
    RAISE NOTICE '';

    FOR dp_record IN 
        SELECT 
            dp.id,
            dp.name,
            dp.price,
            dp.source_product_id,
            p.price as current_price
        FROM dynamic_products dp
        INNER JOIN products p ON dp.source_product_id = p.id
        WHERE dp.is_active = true
        AND p.price = 0.01
    LOOP
        BEGIN
            -- Limpar e converter preço
            preco_limpo := 0.01;
            
            BEGIN
                -- Remover R$, pontos, vírgulas e converter
                preco_limpo := CAST(
                    REGEXP_REPLACE(
                        REGEXP_REPLACE(
                            REGEXP_REPLACE(dp_record.price, 'R\$\s?', '', 'g'),
                            'Por:\s?', '', 'g'
                        ),
                        '[^\d,]', '', 'g'
                    )
                    AS VARCHAR
                );
                
                -- Substituir vírgula por ponto
                preco_limpo := CAST(REPLACE(CAST(preco_limpo AS VARCHAR), ',', '.') AS DECIMAL(10,2));
                
                -- Se preço inválido, manter 0.01
                IF preco_limpo <= 0 OR preco_limpo IS NULL THEN
                    preco_limpo := 0.01;
                END IF;
            EXCEPTION WHEN OTHERS THEN
                preco_limpo := 0.01;
            END;
            
            -- Só atualizar se o preço for diferente de 0.01
            IF preco_limpo > 0.01 THEN
                UPDATE products
                SET price = preco_limpo
                WHERE id = dp_record.source_product_id;
                
                RAISE NOTICE '✅ [%] % → R$ % (era R$ %)', 
                    dp_record.id,
                    dp_record.name,
                    preco_limpo,
                    dp_record.current_price;
                
                produtos_atualizados := produtos_atualizados + 1;
            ELSE
                RAISE NOTICE '⚠️  [%] % → Preço inválido: "%"', 
                    dp_record.id,
                    dp_record.name,
                    dp_record.price;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ [%] Erro: %', dp_record.id, SQLERRM;
        END;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '📊 RESUMO DA CORREÇÃO:';
    RAISE NOTICE '   ✅ Produtos atualizados: %', produtos_atualizados;
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '';
    
    IF produtos_atualizados > 0 THEN
        RAISE NOTICE '🎉 Preços corrigidos com sucesso!';
        RAISE NOTICE '';
    END IF;
END $$;

-- 4. Verificar produtos após correção
SELECT 
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN price = 0.01 THEN 1 END) as com_preco_001,
    COUNT(CASE WHEN price > 0.01 THEN 1 END) as com_preco_correto,
    MIN(price) as preco_minimo,
    MAX(price) as preco_maximo,
    AVG(price) as preco_medio
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3';

-- 5. Ver alguns produtos após correção
SELECT 
    id,
    title,
    price,
    category,
    CASE 
        WHEN price = 0.01 THEN '⚠️ Ainda incorreto'
        ELSE '✅ Corrigido'
    END as status
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3'
ORDER BY price DESC
LIMIT 10;
