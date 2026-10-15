-- Script para corrigir user_profiles e sincronizar com service_providers
-- Execute este script no SQL Editor do Supabase

-- Temporariamente desabilitar RLS para permitir inserção
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Inserir user_profiles para prestadores de serviços existentes
INSERT INTO user_profiles (id, email, full_name, phone, user_type, is_verified)
SELECT 
    sp.user_id as id,
    sp.email,
    sp.name as full_name,
    sp.phone,
    'service_provider' as user_type,
    (sp.status = 'approved') as is_verified
FROM service_providers sp
WHERE sp.user_id NOT IN (
    SELECT id FROM user_profiles WHERE id IS NOT NULL
);

-- Reabilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Verificar resultado
SELECT 
    up.id,
    up.full_name,
    up.email,
    up.user_type,
    up.is_verified,
    sp.category,
    sp.status
FROM user_profiles up
LEFT JOIN service_providers sp ON sp.user_id = up.id
WHERE up.user_type = 'service_provider';

-- Verificar se as tabelas de chat estão funcionando
SELECT 'conversations' as table_name, COUNT(*) as count FROM conversations
UNION ALL
SELECT 'messages' as table_name, COUNT(*) as count FROM messages
UNION ALL
SELECT 'notifications' as table_name, COUNT(*) as count FROM notifications
UNION ALL
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL
SELECT 'service_providers' as table_name, COUNT(*) as count FROM service_providers;