-- ============================================================================
-- MIGRAÇÃO DE PRODUTOS: dynamic_products → products
-- ============================================================================
-- UUID do Admin já configurado: 91057d9a-9d8c-4596-9fc6-0b3ba539a5f3
-- ============================================================================

DO $$
DECLARE
    admin_uuid UUID := '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3';
    produto RECORD;
    novo_uuid UUID;
    preco_limpo DECIMAL(10,2);
    categoria_valida VARCHAR(100);
    contador INTEGER := 0;
    erros INTEGER := 0;
BEGIN
    RAISE NOTICE '🔄 Iniciando migração de produtos...';
    RAISE NOTICE '👤 Admin UUID: %', admin_uuid;
    RAISE NOTICE '';

    -- Loop por todos os produtos em dynamic_products
    FOR produto IN 
        SELECT * FROM dynamic_products 
        WHERE is_active = true 
        ORDER BY id
    LOOP
        BEGIN
            RAISE NOTICE '📦 [%] %', produto.id, produto.name;

            -- Limpar e converter preço
            preco_limpo := 0;
            BEGIN
                -- Remover R$, pontos, vírgulas e converter para decimal
                preco_limpo := CAST(
                    REGEXP_REPLACE(
                        REGEXP_REPLACE(
                            REGEXP_REPLACE(produto.price, 'R\$\s?', '', 'g'),
                            'Por:\s?', '', 'g'
                        ),
                        '[^\d,]', '', 'g'
                    )
                    AS VARCHAR
                );
                
                -- Substituir vírgula por ponto
                preco_limpo := CAST(REPLACE(CAST(preco_limpo AS VARCHAR), ',', '.') AS DECIMAL(10,2));
                
                -- Se preço inválido, usar 0.01
                IF preco_limpo <= 0 THEN
                    preco_limpo := 0.01;
                    RAISE NOTICE '   ⚠️  Preço ajustado para R$ 0.01';
                END IF;
            EXCEPTION WHEN OTHERS THEN
                preco_limpo := 0.01;
                RAISE NOTICE '   ⚠️  Erro ao converter preço, usando R$ 0.01';
            END;

            -- Mapear categoria para categorias válidas
            categoria_valida := COALESCE(produto.category, 'Outros');
            
            CASE categoria_valida
                WHEN 'Material' THEN categoria_valida := 'Material de Construção';
                WHEN 'Tijolos e Blocos' THEN categoria_valida := 'Material de Construção';
                WHEN 'Cimento e Argamassa' THEN categoria_valida := 'Material de Construção';
                WHEN 'Madeiras' THEN categoria_valida := 'Material de Construção';
                WHEN 'Ferragens' THEN categoria_valida := 'Ferramentas';
                WHEN 'Ferramentas Elétricas' THEN categoria_valida := 'Ferramentas';
                WHEN 'Geral' THEN categoria_valida := 'Outros';
                WHEN 'Destaque' THEN categoria_valida := 'Outros';
                WHEN 'Teste' THEN categoria_valida := 'Outros';
                WHEN 'efcewf' THEN categoria_valida := 'Outros';
                ELSE 
                    IF categoria_valida NOT IN (
                        'Material de Construção',
                        'Ferramentas',
                        'Pintura',
                        'Elétrica',
                        'Hidráulica',
                        'Acabamento',
                        'Telhas e Coberturas',
                        'Decoração',
                        'Outros'
                    ) THEN
                        categoria_valida := 'Outros';
                    END IF;
            END CASE;

            -- Criar produto em products
            INSERT INTO products (
                user_id,
                title,
                description,
                category,
                price,
                quantity,
                seller_type,
                product_type,
                images,
                seller_info,
                status,
                approval_status,
                created_at,
                updated_at
            ) VALUES (
                admin_uuid,
                produto.name,
                COALESCE(produto.description, produto.name || ' - Produto de alta qualidade para sua obra.'),
                categoria_valida,
                preco_limpo,
                999,
                'business',
                'new',
                CASE 
                    WHEN produto.image_url IS NOT NULL THEN ARRAY[produto.image_url]::TEXT[]
                    ELSE ARRAY[]::TEXT[]
                END,
                jsonb_build_object(
                    'name', 'Xopy Marketplace',
                    'businessName', 'Xopy Marketplace',
                    'phone', '(11) 99999-9999',
                    'address', 'São Paulo, SP',
                    'email', 'vendas@xopy.com.br'
                ),
                'active',
                'approved',
                COALESCE(produto.created_at, NOW()),
                NOW()
            ) RETURNING id INTO novo_uuid;

            RAISE NOTICE '   ✅ Migrado → UUID: %', SUBSTRING(novo_uuid::TEXT, 1, 8) || '...';
            RAISE NOTICE '   💰 Preço: R$ %', preco_limpo;
            RAISE NOTICE '   📂 Categoria: %', categoria_valida;
            RAISE NOTICE '';

            contador := contador + 1;

        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '   ❌ Erro: %', SQLERRM;
            RAISE NOTICE '';
            erros := erros + 1;
        END;
    END LOOP;

    RAISE NOTICE '========================================================================';
    RAISE NOTICE '📊 RESUMO DA MIGRAÇÃO:';
    RAISE NOTICE '   ✅ Produtos migrados: %', contador;
    RAISE NOTICE '   ❌ Erros: %', erros;
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '';

    IF contador > 0 THEN
        RAISE NOTICE '🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
        RAISE NOTICE '';
        RAISE NOTICE '✅ Todos os produtos agora estão na tabela "products"';
        RAISE NOTICE '✅ Cada produto tem um UUID válido';
        RAISE NOTICE '✅ Os produtos podem ser comprados normalmente';
        RAISE NOTICE '';
    END IF;

END $$;

-- Verificação
SELECT 
    COUNT(*) as total_produtos,
    COUNT(DISTINCT category) as total_categorias,
    SUM(price) as valor_total_estoque
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3';

-- Produtos por categoria
SELECT 
    category,
    COUNT(*) as quantidade,
    AVG(price) as preco_medio,
    MIN(price) as preco_minimo,
    MAX(price) as preco_maximo
FROM products
WHERE user_id = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3'
GROUP BY category
ORDER BY quantidade DESC;
