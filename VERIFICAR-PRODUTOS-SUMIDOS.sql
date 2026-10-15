-- ============================================================================
-- VERIFICAR PRODUTOS QUE SUMIRAM
-- ============================================================================

-- 1. Ver TODOS os produtos (incluindo inativos)
SELECT 
    id,
    title,
    price,
    category,
    status,
    approval_status,
    created_at
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3'
ORDER BY created_at DESC;

-- 2. Contar produtos por status
SELECT 
    status,
    COUNT(*) as quantidade
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3'
GROUP BY status;

-- 3. Contar produtos por approval_status
SELECT 
    approval_status,
    COUNT(*) as quantidade
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3'
GROUP BY approval_status;

-- 4. Ver produtos que podem ter sido desativados
SELECT 
    id,
    title,
    price,
    status,
    approval_status,
    '⚠️ Inativo' as alerta
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3'
AND (status != 'active' OR approval_status != 'approved');

-- 5. Reativar TODOS os produtos se necessário
UPDATE products
SET 
    status = 'active',
    approval_status = 'approved'
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3';

-- 6. Verificar total após reativação
SELECT 
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as ativos,
    COUNT(CASE WHEN approval_status = 'approved' THEN 1 END) as aprovados
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3';

-- 7. Ver produtos por categoria
SELECT 
    category,
    COUNT(*) as quantidade,
    MIN(price) as preco_min,
    MAX(price) as preco_max
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3'
AND status = 'active'
AND approval_status = 'approved'
GROUP BY category
ORDER BY quantidade DESC;

-- 8. Ver alguns produtos de cada categoria
SELECT 
    category,
    title,
    price,
    status,
    approval_status
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3'
ORDER BY category, title
LIMIT 50;
