-- ============================================================================
-- DIAGNÓSTICO RÁPIDO - Verificar estado atual
-- ============================================================================

-- 1. Verificar produtos em products
SELECT 
    '1. PRODUTOS EM PRODUCTS' as secao,
    COUNT(*) as total,
    COUNT(DISTINCT category) as categorias
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3';

-- 2. Verificar produtos em dynamic_products
SELECT 
    '2. PRODUTOS EM DYNAMIC_PRODUCTS' as secao,
    COUNT(*) as total,
    COUNT(source_product_id) as com_vinculo,
    COUNT(*) - COUNT(source_product_id) as sem_vinculo
FROM dynamic_products
WHERE is_active = true;

-- 3. Ver produtos sem vínculo (causam erro no checkout)
SELECT 
    '3. PRODUTOS SEM VÍNCULO (CAUSAM ERRO)' as secao,
    id,
    name,
    price,
    '❌ Não pode ser comprado' as status
FROM dynamic_products
WHERE is_active = true
AND source_product_id IS NULL
ORDER BY id
LIMIT 10;

-- 4. Ver produtos com vínculo (funcionam no checkout)
SELECT 
    '4. PRODUTOS COM VÍNCULO (FUNCIONAM)' as secao,
    dp.id,
    dp.name,
    SUBSTRING(dp.source_product_id::TEXT, 1, 8) || '...' as uuid,
    '✅ Pode ser comprado' as status
FROM dynamic_products dp
WHERE is_active = true
AND source_product_id IS NOT NULL
ORDER BY dp.id
LIMIT 10;

-- 5. Resumo geral
SELECT 
    '5. RESUMO GERAL' as secao,
    (SELECT COUNT(*) FROM products WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3') as produtos_em_products,
    (SELECT COUNT(*) FROM dynamic_products WHERE is_active = true) as produtos_em_dynamic,
    (SELECT COUNT(*) FROM dynamic_products WHERE is_active = true AND source_product_id IS NOT NULL) as produtos_vinculados,
    (SELECT COUNT(*) FROM dynamic_products WHERE is_active = true AND source_product_id IS NULL) as produtos_sem_vinculo;
