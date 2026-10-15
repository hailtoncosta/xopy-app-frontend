-- Script para inserir dados de teste no banco de dados
-- Execute este script no SQL Editor do Supabase

-- Desabilitar RLS temporariamente para inserir dados de teste
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Inserir usuários de teste na tabela auth.users primeiro
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'cliente1@teste.com',
  crypt('senha123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Cliente Teste 1", "user_type": "customer"}'
),
(
  '22222222-2222-2222-2222-222222222222',
  'cliente2@teste.com',
  crypt('senha123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Cliente Teste 2", "user_type": "customer"}'
)
ON CONFLICT (id) DO NOTHING;

-- Inserir perfis de usuário (serão criados automaticamente pelo trigger, mas vamos garantir)
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  user_type,
  phone,
  is_verified
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'cliente1@teste.com',
  'Cliente Teste 1',
  'customer',
  '(11) 99999-1111',
  true
),
(
  '22222222-2222-2222-2222-222222222222',
  'cliente2@teste.com',
  'Cliente Teste 2',
  'customer',
  '(11) 99999-2222',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Atualizar prestadores de serviços existentes com user_id válidos
-- Primeiro, vamos verificar se existem prestadores e criar usuários para eles
DO $$
DECLARE
    provider_record RECORD;
    new_user_id UUID;
BEGIN
    FOR provider_record IN SELECT id, name, email FROM service_providers WHERE user_id IS NULL LIMIT 3
    LOOP
        new_user_id := gen_random_uuid();
        
        -- Inserir usuário na auth.users
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data
        ) VALUES (
            new_user_id,
            provider_record.email,
            crypt('senha123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            json_build_object('full_name', provider_record.name, 'user_type', 'service_provider')
        ) ON CONFLICT (email) DO NOTHING;
        
        -- Inserir perfil do usuário
        INSERT INTO user_profiles (
            id,
            email,
            full_name,
            user_type,
            is_verified
        ) VALUES (
            new_user_id,
            provider_record.email,
            provider_record.name,
            'service_provider',
            true
        ) ON CONFLICT (id) DO NOTHING;
        
        -- Atualizar o prestador com o user_id
        UPDATE service_providers 
        SET user_id = new_user_id 
        WHERE id = provider_record.id;
    END LOOP;
END $$;

-- Criar conversas de teste
INSERT INTO conversations (
  id,
  user_id,
  service_provider_id,
  status,
  last_message_at
) VALUES 
(
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM service_providers WHERE user_id IS NOT NULL LIMIT 1),
  'active',
  NOW()
),
(
  '44444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  (SELECT id FROM service_providers WHERE user_id IS NOT NULL LIMIT 1 OFFSET 1),
  'active',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Inserir mensagens de teste
INSERT INTO messages (
  conversation_id,
  sender_id,
  sender_type,
  content,
  message_type,
  is_read
) VALUES 
(
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'user',
  'Olá! Preciso de ajuda com um serviço.',
  'text',
  false
),
(
  '33333333-3333-3333-3333-333333333333',
  (SELECT user_id FROM service_providers WHERE user_id IS NOT NULL LIMIT 1),
  'service_provider',
  'Olá! Claro, posso te ajudar. Qual serviço você precisa?',
  'text',
  false
),
(
  '44444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  'user',
  'Boa tarde! Gostaria de saber mais sobre seus serviços.',
  'text',
  false
);

-- Reabilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Verificar se os dados foram inseridos
SELECT 'Usuários inseridos:' as info, COUNT(*) as count FROM user_profiles;
SELECT 'Prestadores com user_id:' as info, COUNT(*) as count FROM service_providers WHERE user_id IS NOT NULL;
SELECT 'Conversas criadas:' as info, COUNT(*) as count FROM conversations;
SELECT 'Mensagens inseridas:' as info, COUNT(*) as count FROM messages;
SELECT 'Notificações criadas:' as info, COUNT(*) as count FROM notifications;