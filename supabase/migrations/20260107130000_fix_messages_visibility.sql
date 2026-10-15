-- Função auxiliar segura para verificar acesso à conversa
-- Esta função encapsula a lógica complexa de permissão:
-- 1. Usuário é o cliente (user_id da conversa)
-- 2. Usuário é o prestador (dono do service_provider_id da conversa)
CREATE OR REPLACE FUNCTION check_user_access_to_conversation(target_conversation_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER -- Roda com privilégios de sistema para ler conversations/service_providers sem travas
SET search_path = public -- Segurança: sempre definir o search_path
AS $$
BEGIN
    -- Se o ID for nulo, nega acesso
    IF target_conversation_id IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1 
        FROM conversations c
        LEFT JOIN service_providers sp ON c.service_provider_id = sp.id
        WHERE c.id = target_conversation_id
        AND (
            c.user_id = auth.uid() -- Usuário é o cliente
            OR 
            sp.user_id = auth.uid() -- Usuário é o prestador
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Remover políticas antigas de SELECT que podem estar conflitantes ou quebradas
DROP POLICY IF EXISTS "Usuários podem ver mensagens de suas conversas" ON messages;
DROP POLICY IF EXISTS "messages_select_policy" ON messages;
DROP POLICY IF EXISTS "ver mensagens" ON messages;
DROP POLICY IF EXISTS "policy_users_view_messages" ON messages;

-- Criar nova política unificada e simplificada usando a função auxiliar
CREATE POLICY "policy_users_view_messages" ON messages
    FOR SELECT
    USING (
        check_user_access_to_conversation(conversation_id)
    );

-- Garantir índice para performance da função
CREATE INDEX IF NOT EXISTS idx_conversations_service_provider_composite 
ON conversations(id, service_provider_id, user_id);

-- Reforçar política de SELECT em conversations também, para garantir consistência
DROP POLICY IF EXISTS "Usuários podem ver suas próprias conversas" ON conversations;
CREATE POLICY "Usuários podem ver suas próprias conversas" ON conversations
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT sp.user_id FROM service_providers sp 
            WHERE sp.id = service_provider_id
        )
    );
