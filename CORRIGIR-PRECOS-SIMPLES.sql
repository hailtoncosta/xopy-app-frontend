-- ============================================================================
-- CORREÇÃO SIMPLES DE PREÇOS - Atualização Manual
-- ============================================================================
-- Este script atualiza os preços manualmente baseado nos valores conhecidos
-- ============================================================================

-- Substitua o UUID do admin se necessário
-- UUID atual: 91057d9a-9d8c-4596-9fc6-0b3ba539a5f3

-- Ver produtos atuais com preço 0.01
SELECT 
    p.id,
    p.title,
    p.price as preco_atual,
    dp.price as preco_dynamic,
    dp.id as dynamic_id
FROM products p
LEFT JOIN dynamic_products dp ON dp.source_product_id = p.id
WHERE p.user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3'
AND p.price = 0.01
ORDER BY p.title;

-- Atualizar preços manualmente (baseado nos valores mais comuns)
-- Você pode ajustar os valores conforme necessário

UPDATE products SET price = 49.90 
WHERE title LIKE '%Trincha%' OR title LIKE '%Kit 4%';

UPDATE products SET price = 247.85 
WHERE title LIKE '%Telhas de alumínio%' OR title LIKE '%Telha%alumínio%';

UPDATE products SET price = 4.12 
WHERE title LIKE '%Rolo de Espuma%';

UPDATE products SET price = 239.10 
WHERE title LIKE '%Tinta Acrílica Coral%';

UPDATE products SET price = 221.90 
WHERE title LIKE '%Tinta Econômica%' OR title LIKE '%Kemtone%';

UPDATE products SET price = 213.99 
WHERE title LIKE '%Mangueira%';

UPDATE products SET price = 80.99 
WHERE title LIKE '%Kit pedreiro%';

UPDATE products SET price = 283.87 
WHERE title LIKE '%Kit 14 Ferramentas%';

UPDATE products SET price = 27.34 
WHERE title LIKE '%Treliça%';

UPDATE products SET price = 780.00 
WHERE title LIKE '%Cozinha Compacta%';

UPDATE products SET price = 168.64 
WHERE title LIKE '%Porta De Madeira Frisada%';

UPDATE products SET price = 359.00 
WHERE title LIKE '%Fechadura Digital%';

UPDATE products SET price = 3859.00 
WHERE title LIKE '%Kit Energia Solar%';

UPDATE products SET price = 122.04 
WHERE title LIKE '%Telha Residence%' AND price = 0.01;

UPDATE products SET price = 349.00 
WHERE title LIKE '%Telhas Galvanizada%';

UPDATE products SET price = 1808.98 
WHERE title LIKE '%Isotelha%';

UPDATE products SET price = 145.00 
WHERE title LIKE '%Kit 3 Vasos%';

UPDATE products SET price = 42.00 
WHERE title LIKE '%Kit 3 Pendentes%';

UPDATE products SET price = 128.00 
WHERE title LIKE '%Kit Mesa Apoio%';

UPDATE products SET price = 25.00 
WHERE title LIKE '%Lustre%';

UPDATE products SET price = 480.00 
WHERE title LIKE '%WAP Lavadora%';

UPDATE products SET price = 580.00 
WHERE title LIKE '%Bosch Serra Circular%';

UPDATE products SET price = 284.00 
WHERE title LIKE '%Trena Laser%';

UPDATE products SET price = 229.99 
WHERE title LIKE '%Micrômetro%';

UPDATE products SET price = 409.90 
WHERE title LIKE '%MAKITA SERRA%';

UPDATE products SET price = 119.79 
WHERE title LIKE '%Tramontina%Kit%';

UPDATE products SET price = 331.21 
WHERE title LIKE '%Bosch Furadeira%';

UPDATE products SET price = 134.99 
WHERE title LIKE '%WAP Parafusadeira%';

UPDATE products SET price = 255.98 
WHERE title LIKE '%Serra Mármore Vonder%';

UPDATE products SET price = 494.90 
WHERE title LIKE '%Serra Circular%Mondial%';

UPDATE products SET price = 152.91 
WHERE title LIKE '%Serra Tico Tico%';

-- Verificar quantos produtos foram atualizados
SELECT 
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN price = 0.01 THEN 1 END) as ainda_001,
    COUNT(CASE WHEN price > 0.01 THEN 1 END) as corrigidos,
    MIN(price) as preco_minimo,
    MAX(price) as preco_maximo
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3';

-- Ver produtos que ainda estão com 0.01 (se houver)
SELECT 
    id,
    title,
    price,
    '⚠️ Ainda precisa corrigir' as status
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3'
AND price = 0.01
ORDER BY title;

-- Ver alguns produtos corrigidos
SELECT 
    id,
    title,
    price,
    '✅ Corrigido' as status
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3'
AND price > 0.01
ORDER BY price DESC
LIMIT 20;
