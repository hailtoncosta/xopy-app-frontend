-- ============================================================================
-- DIAGNÓSTICO COMPLETO - Produtos que Sumiram
-- ============================================================================

-- 1. Ver estrutura da tabela dynamic_products
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dynamic_products'
ORDER BY ordinal_position;

-- 2. Ver produtos em dynamic_products
SELECT 
    id,
    name,
    price,
    category,
    is_active,
    is_essential,
    is_top_choice,
    is_offer,
    source_product_id
FROM dynamic_products
WHERE is_active = true
ORDER BY id;

-- 3. Contar produtos por flags
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN is_essential = true THEN 1 END) as essenciais,
    COUNT(CASE WHEN is_top_choice = true THEN 1 END) as top_choices,
    COUNT(CASE WHEN is_offer = true THEN 1 END) as ofertas,
    COUNT(CASE WHEN is_essential IS NULL THEN 1 END) as sem_is_essential,
    COUNT(CASE WHEN is_top_choice IS NULL THEN 1 END) as sem_is_top_choice
FROM dynamic_products
WHERE is_active = true;

-- 4. Ver produtos que deveriam aparecer mas não têm as flags
SELECT 
    id,
    name,
    price,
    category,
    is_essential,
    is_top_choice,
    '⚠️ Sem flags' as problema
FROM dynamic_products
WHERE is_active = true
AND (is_essential IS NULL OR is_essential = false)
AND (is_top_choice IS NULL OR is_top_choice = false)
ORDER BY id;

-- 5. SOLUÇÃO: Marcar produtos como essenciais e top choices
-- Marcar os primeiros 8 produtos como essenciais
UPDATE dynamic_products
SET is_essential = true
WHERE id IN (
    SELECT id 
    FROM dynamic_products 
    WHERE is_active = true
    ORDER BY id
    LIMIT 8
);

-- Marcar os próximos 8 produtos como top choices
UPDATE dynamic_products
SET is_top_choice = true
WHERE id IN (
    SELECT id 
    FROM dynamic_products 
    WHERE is_active = true
    AND (is_essential IS NULL OR is_essential = false)
    ORDER BY id
    LIMIT 8
);

-- 6. Verificar resultado
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN is_essential = true THEN 1 END) as essenciais,
    COUNT(CASE WHEN is_top_choice = true THEN 1 END) as top_choices
FROM dynamic_products
WHERE is_active = true;

-- 7. Ver produtos marcados como essenciais
SELECT 
    id,
    name,
    price,
    '✅ Essencial' as tipo
FROM dynamic_products
WHERE is_active = true
AND is_essential = true
ORDER BY id;

-- 8. Ver produtos marcados como top choices
SELECT 
    id,
    name,
    price,
    '⭐ Top Choice' as tipo
FROM dynamic_products
WHERE is_active = true
AND is_top_choice = true
ORDER BY id;
