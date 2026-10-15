
-- ============================================================================
-- CORREÇÃO DE PREÇOS - Produtos do Admin
-- ============================================================================

-- 1. Dividir por 100 os preços que estão multiplicados (acima de 1000)
UPDATE products 
SET price = ROUND(price / 100, 2)
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3'
AND price >= 1000;

-- 2. Ver resultado
SELECT 
    title,
    price,
    CASE 
        WHEN price = 0.01 THEN '❌ Precisa corrigir'
        WHEN price > 1000 THEN '⚠️ Ainda alto'
        ELSE '✅ Corrigido'
    END as status
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3'
ORDER BY price DESC
LIMIT 15;
