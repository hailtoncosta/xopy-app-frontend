-- ============================================================================
-- PREPARAÇÃO DA TABELA PRODUCTS PARA MIGRAÇÃO
-- ============================================================================
-- Execute este script ANTES da migração para garantir que a tabela
-- products está pronta para receber os produtos de dynamic_products
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '🔧 Preparando tabela products...';
    RAISE NOTICE '';
END $$;

-- Adicionar coluna images se não existir
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Adicionar coluna approval_status se não existir
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending';

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_approval_status ON products(approval_status);
CREATE INDEX IF NOT EXISTS idx_products_user_category ON products(user_id, category);

-- Verificar se a tabela está pronta
DO $$
DECLARE
    has_images BOOLEAN;
    has_approval BOOLEAN;
BEGIN
    -- Verificar coluna images
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'images'
    ) INTO has_images;
    
    -- Verificar coluna approval_status
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'approval_status'
    ) INTO has_approval;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '📋 VERIFICAÇÃO DA TABELA PRODUCTS';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '';
    
    IF has_images THEN
        RAISE NOTICE '✅ Coluna "images" existe';
    ELSE
        RAISE NOTICE '❌ Coluna "images" NÃO existe';
    END IF;
    
    IF has_approval THEN
        RAISE NOTICE '✅ Coluna "approval_status" existe';
    ELSE
        RAISE NOTICE '❌ Coluna "approval_status" NÃO existe';
    END IF;
    
    RAISE NOTICE '';
    
    IF has_images AND has_approval THEN
        RAISE NOTICE '🎉 Tabela "products" está pronta para migração!';
        RAISE NOTICE '';
        RAISE NOTICE '📋 PRÓXIMO PASSO:';
        RAISE NOTICE '   Execute o script: migrate-products.sql';
    ELSE
        RAISE NOTICE '⚠️  Tabela "products" precisa de ajustes';
        RAISE NOTICE '   Execute este script novamente';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '';
END $$;
