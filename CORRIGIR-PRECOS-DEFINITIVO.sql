-- ============================================================================
-- CORREÇÃO DEFINITIVA DE PREÇOS
-- ============================================================================

-- 1. Corrigir preços multiplicados por 100 (dividir por 100)
UPDATE products 
SET price = price / 100
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3'
AND price > 100;

-- 2. Atualizar produtos que ainda estão com 0.01 (valores conhecidos)

-- KIT GALPÃO
UPDATE products SET price = 28990.00 
WHERE title = 'KIT GALPÃO' AND price = 0.01;

-- Telhas colonial
UPDATE products SET price = 224.90 
WHERE title = 'Telhas colonial' AND price = 0.01;

-- Argamassa AC-I 20kg
UPDATE products SET price = 18.50 
WHERE title = 'Argamassa AC-I 20kg' AND price = 0.01;

-- Carrinho De Mão
UPDATE products SET price = 328.97 
WHERE title = 'Carrinho De Mão' AND price = 0.01;

-- Telhas cerâmicas
UPDATE products SET price = 1799.00 
WHERE title = 'Telhas cerâmicas' AND price = 0.01;

-- Argamassa Quartzolit para Pisos
UPDATE products SET price = 53.49 
WHERE title = 'Argamassa Quartzolit para Pisos' AND price = 0.01;

-- Caibro Itaúba
UPDATE products SET price = 110.90 
WHERE title LIKE '%Caibro%' AND price = 0.01;

-- MOTOR A GASOLINA
UPDATE products SET price = 965.00 
WHERE title = 'MOTOR A GASOLINA' AND price = 0.01;

-- Telha Pvc Colonial Ecológica
UPDATE products SET price = 227.66 
WHERE title LIKE '%Telha Pvc Colonial%' AND price = 0.01;

-- Telhas de aluminio (se ainda houver)
UPDATE products SET price = 247.85 
WHERE title LIKE '%Telhas de aluminio%' AND price = 0.01;

-- Telha Colonial
UPDATE products SET price = 224.90 
WHERE title = 'Telha Colonial' AND price = 0.01;

-- Kit Pintura c/ Rolo de Lã Sintética
UPDATE products SET price = 25.11 
WHERE title LIKE '%Kit Pintura%Rolo%' AND price = 0.01;

-- Rolo Pintura + Bandeja
UPDATE products SET price = 28.90 
WHERE title LIKE '%Rolo Pintura%Bandeja%' AND price = 0.01;

-- Tinta Acrílica Fosco
UPDATE products SET price = 104.40 
WHERE title LIKE '%Tinta Acrílica Fosco%' AND price = 0.01;

-- Tinta Esmalte Sintético
UPDATE products SET price = 65.90 
WHERE title LIKE '%Tinta Esmalte Sintético%' AND price = 0.01;

-- Luminária Pendente Moderna
UPDATE products SET price = 189.90 
WHERE title LIKE '%Luminária Pendente%' AND price = 0.01;

-- Espelho Decorativo
UPDATE products SET price = 125.50 
WHERE title LIKE '%Espelho Decorativo%' AND price = 0.01;

-- Quadro Decorativo
UPDATE products SET price = 85.90 
WHERE title LIKE '%Quadro Decorativo%' AND price = 0.01;

-- Vaso Cerâmica
UPDATE products SET price = 45.90 
WHERE title LIKE '%Vaso Cerâmica%' AND price = 0.01;

-- Porta de Madeira
UPDATE products SET price = 245.00 
WHERE title LIKE '%Porta de Madeira%' AND price = 0.01;

-- Porcelanato
UPDATE products SET price = 49.90 
WHERE title LIKE '%Porcelanato%' AND price = 0.01;

-- Revestimento
UPDATE products SET price = 42.29 
WHERE title LIKE '%Revestimento%' AND price = 0.01;

-- Kit Banheiro
UPDATE products SET price = 308.80 
WHERE title LIKE '%Kit Banheiro%' AND price = 0.01;

-- Jogo de Chaves
UPDATE products SET price = 198.00 
WHERE title LIKE '%Jogo de Chaves%' AND price = 0.01;

-- Furadeira de Impacto
UPDATE products SET price = 389.90 
WHERE title LIKE '%Furadeira de Impacto%' AND price = 0.01;

-- Lixadeira Orbital
UPDATE products SET price = 249.90 
WHERE title LIKE '%Lixadeira Orbital%' AND price = 0.01;

-- Motor a Gasolina (outro)
UPDATE products SET price = 965.00 
WHERE title LIKE '%Motor a Gasolina%' AND price = 0.01;

-- Parafuzadeira de impacto
UPDATE products SET price = 359.00 
WHERE title LIKE '%Parafuzadeira de impacto%' AND price = 0.01;

-- Betoneira 44lt
UPDATE products SET price = 4923.00 
WHERE title LIKE '%Betoneira 44lt%' AND price = 0.01;

-- Carrinho de mão (outros)
UPDATE products SET price = 283.85 
WHERE title LIKE '%Carrinho de mão%' AND price = 0.01;

-- Carrinho de mão Tramontina
UPDATE products SET price = 285.78 
WHERE title LIKE '%Carrinho de mão Tramontina%' AND price = 0.01;

-- Kit Pintura (outro)
UPDATE products SET price = 25.11 
WHERE title = 'Kit Pintura' AND price = 0.01;

-- Telhas de barro
UPDATE products SET price = 1650.00 
WHERE title LIKE '%Telhas de barro%' AND price = 0.01;

-- Tijolos
UPDATE products SET price = 619.00 
WHERE title = 'Tijolos' AND price = 0.01;

-- Rolo + Bandeja
UPDATE products SET price = 28.90 
WHERE title = 'Rolo + Bandeja' AND price = 0.01;

-- 3. Verificar resultado
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN price = 0.01 THEN 1 END) as ainda_001,
    COUNT(CASE WHEN price > 0.01 AND price < 10 THEN 1 END) as entre_001_e_10,
    COUNT(CASE WHEN price >= 10 AND price < 100 THEN 1 END) as entre_10_e_100,
    COUNT(CASE WHEN price >= 100 AND price < 1000 THEN 1 END) as entre_100_e_1000,
    COUNT(CASE WHEN price >= 1000 THEN 1 END) as acima_1000,
    MIN(price) as minimo,
    MAX(price) as maximo,
    AVG(price) as media
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3';

-- 4. Ver produtos que ainda precisam correção
SELECT 
    id,
    title,
    price,
    category
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3'
AND price = 0.01
ORDER BY title;

-- 5. Ver alguns produtos corrigidos
SELECT 
    title,
    price,
    category
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3'
AND price > 0.01
ORDER BY price DESC
LIMIT 20;
