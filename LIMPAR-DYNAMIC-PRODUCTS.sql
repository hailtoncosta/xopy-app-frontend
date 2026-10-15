-- ============================================================================
-- LIMPEZA: Remover tabela dynamic_products
-- ============================================================================
-- ⚠️ ATENÇÃO: Execute este script APENAS DEPOIS de confirmar que:
--    1. A migração funcionou (70 produtos em products)
--    2. Você testou comprar alguns produtos
--    3. O checkout está funcionando normalmente
-- ============================================================================
-- ⚠️ Esta ação é IRREVERSÍVEL!
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🗑️  Iniciando limpeza da tabela dynamic_products...';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  ATENÇÃO: Esta ação é IRREVERSÍVEL!';
    RAISE NOTICE '';

    -- Remover tabela dynamic_products
    DROP TABLE IF EXISTS dynamic_products CASCADE;
    
    RAISE NOTICE '✅ Tabela dynamic_products removida com sucesso';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 LIMPEZA CONCLUÍDA!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Agora existe apenas a tabela "products"';
    RAISE NOTICE '✅ Arquitetura simplificada';
    RAISE NOTICE '✅ Sem duplicação de dados';
    RAISE NOTICE '';
END $$;

-- Verificar que apenas products existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%product%'
ORDER BY table_name;
