-- ============================================================================
-- MARCAR PRODUTOS DEFINITIVO - Forçar Atualização
-- ============================================================================

-- 1. LIMPAR TODAS AS FLAGS PRIMEIRO
UPDATE dynamic_products
SET 
    is_essential = false,
    is_top_choice = false
WHERE is_active = true;

-- 2. MARCAR OS PRIMEIROS 8 PRODUTOS COMO ESSENCIAIS
UPDATE dynamic_products
SET is_essential = true
WHERE id IN (
    SELECT id 
    FROM dynamic_products 
    WHERE is_active = true
    ORDER BY created_at DESC
    LIMIT 8
);

-- 3. MARCAR OS PRÓXIMOS 8 PRODUTOS COMO TOP CHOICES
UPDATE dynamic_products
SET is_top_choice = true
WHERE id IN (
    SELECT id 
    FROM dynamic_products 
    WHERE is_active = true
    AND is_essential = false
    ORDER BY created_at DESC
    LIMIT 8
);

-- 4. VERIFICAR RESULTADO
SELECT 
    '✅ RESULTADO' as status,
    COUNT(CASE WHEN is_essential = true THEN 1 END) as essenciais,
    COUNT(CASE WHEN is_top_choice = true THEN 1 END) as top_choices,
    COUNT(*) as total
FROM dynamic_products
WHERE is_active = true;

-- 5. LISTAR PRODUTOS MARCADOS COMO ESSENCIAIS
SELECT 
    '🔨 ESSENCIAIS' as tipo,
    id,
    name,
    is_essential,
    created_at
FROM dynamic_products
WHERE is_active = true
AND is_essential = true
ORDER BY created_at DESC;

-- 6. LISTAR PRODUTOS MARCADOS COMO TOP CHOICES
SELECT 
    '⭐ TOP CHOICES' as tipo,
    id,
    name,
    is_top_choice,
    created_at
FROM dynamic_products
WHERE is_active = true
AND is_top_choice = true
ORDER BY created_at DESC;

-- 7. FORÇAR NOTIFICAÇÃO (atualizar updated_at para disparar realtime)
UPDATE dynamic_products
SET updated_at = NOW()
WHERE is_active = true
AND (is_essential = true OR is_top_choice = true);
