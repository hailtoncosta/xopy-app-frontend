-- ============================================================================
-- VERIFICAR FLAGS DOS PRODUTOS
-- ============================================================================

-- 1. Ver produtos com flags
SELECT 
    id,
    name,
    is_essential,
    is_top_choice,
    is_active,
    created_at
FROM dynamic_products
WHERE is_active = true
ORDER BY id;

-- 2. Contar por flags
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN is_essential = true THEN 1 END) as essenciais,
    COUNT(CASE WHEN is_top_choice = true THEN 1 END) as top_choices,
    COUNT(CASE WHEN is_essential IS NULL THEN 1 END) as sem_is_essential,
    COUNT(CASE WHEN is_top_choice IS NULL THEN 1 END) as sem_is_top_choice
FROM dynamic_products
WHERE is_active = true;

-- 3. Se não houver produtos marcados, marcar agora
-- Marcar os primeiros 8 como essenciais
UPDATE dynamic_products
SET is_essential = true
WHERE id IN (
    SELECT id 
    FROM dynamic_products 
    WHERE is_active = true
    ORDER BY id
    LIMIT 8
);

-- Marcar os próximos 8 como top choices
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

-- 4. Verificar resultado final
SELECT 
    'Essenciais' as tipo,
    COUNT(*) as quantidade
FROM dynamic_products
WHERE is_active = true
AND is_essential = true

UNION ALL

SELECT 
    'Top Choices' as tipo,
    COUNT(*) as quantidade
FROM dynamic_products
WHERE is_active = true
AND is_top_choice = true;

-- 5. Listar produtos marcados
SELECT 
    id,
    name,
    CASE 
        WHEN is_essential = true THEN '🔨 Essencial'
        WHEN is_top_choice = true THEN '⭐ Top Choice'
        ELSE '📦 Normal'
    END as tipo
FROM dynamic_products
WHERE is_active = true
AND (is_essential = true OR is_top_choice = true)
ORDER BY 
    CASE WHEN is_essential = true THEN 1 ELSE 2 END,
    id;
