-- ============================================================================
-- REVERTER E CORRIGIR PREÇOS CORRETAMENTE
-- ============================================================================

-- 1. Ver estado atual dos preços
SELECT 
    title,
    price,
    CASE 
        WHEN price = 0.01 THEN '❌ Muito baixo'
        WHEN price > 10000 THEN '❌ Muito alto'
        WHEN price > 1000 THEN '⚠️ Alto (verificar)'
        ELSE '✅ OK'
    END as status
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3'
ORDER BY price DESC;

-- 2. Corrigir apenas preços obviamente errados (muito altos)
-- Dividir por 100 apenas se > 1000 e não for um produto caro de verdade

-- Tintas: R$ 7540 → R$ 75.40
UPDATE products 
SET price = 75.40
WHERE title = 'Tintas' 
AND user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3';

-- Betoneira: R$ 4923 está correto (produto caro)
-- KIT GALPÃO: R$ 28990 está correto (produto muito caro)
-- Kit Energia Solar: R$ 3859 está correto (produto caro)

-- 3. Corrigir produtos com 0.01 manualmente (valores conhecidos)
UPDATE products SET price = 224.90 WHERE title = 'Telhas colonial' AND price = 0.01;
UPDATE products SET price = 18.50 WHERE title = 'Argamassa AC-I 20kg' AND price = 0.01;
UPDATE products SET price = 328.97 WHERE title = 'Carrinho De Mão' AND price = 0.01;
UPDATE products SET price = 1799.00 WHERE title = 'Telhas cerâmicas' AND price = 0.01;
UPDATE products SET price = 53.49 WHERE title = 'Argamassa Quartzolit para Pisos' AND price = 0.01;
UPDATE products SET price = 110.90 WHERE title LIKE '%Caibro%' AND price = 0.01;
UPDATE products SET price = 965.00 WHERE title = 'MOTOR A GASOLINA' AND price = 0.01;
UPDATE products SET price = 227.66 WHERE title LIKE '%Telha Pvc Colonial%' AND price = 0.01;
UPDATE products SET price = 224.90 WHERE title = 'Telha Colonial' AND price = 0.01;
UPDATE products SET price = 25.11 WHERE title LIKE '%Kit Pintura%Rolo%' AND price = 0.01;
UPDATE products SET price = 28.90 WHERE title LIKE '%Rolo Pintura%Bandeja%' AND price = 0.01;
UPDATE products SET price = 104.40 WHERE title LIKE '%Tinta Acrílica Fosco%' AND price = 0.01;
UPDATE products SET price = 65.90 WHERE title LIKE '%Tinta Esmalte Sintético%' AND price = 0.01;
UPDATE products SET price = 189.90 WHERE title LIKE '%Luminária Pendente%' AND price = 0.01;
UPDATE products SET price = 125.50 WHERE title LIKE '%Espelho Decorativo%' AND price = 0.01;
UPDATE products SET price = 85.90 WHERE title LIKE '%Quadro Decorativo%' AND price = 0.01;
UPDATE products SET price = 45.90 WHERE title LIKE '%Vaso Cerâmica%' AND price = 0.01;
UPDATE products SET price = 245.00 WHERE title LIKE '%Porta de Madeira%' AND price = 0.01;
UPDATE products SET price = 49.90 WHERE title LIKE '%Porcelanato%' AND price = 0.01;
UPDATE products SET price = 42.29 WHERE title LIKE '%Revestimento%' AND price = 0.01;
UPDATE products SET price = 308.80 WHERE title LIKE '%Kit Banheiro%' AND price = 0.01;

-- 4. Ver resultado final
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN price = 0.01 THEN 1 END) as com_001,
    MIN(price) as minimo,
    MAX(price) as maximo,
    AVG(price) as media
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3';

-- 5. Listar produtos que ainda precisam correção
SELECT 
    title,
    price,
    '⚠️ Precisa corrigir' as status
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3'
AND price = 0.01
ORDER BY title;
