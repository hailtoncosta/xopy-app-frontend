-- Migration para corrigir falhas no envio de mensagens
-- Motivo: O trigger update_conversation_last_message falhava se o usuário não tivesse permissão de UPDATE na conversa,
-- cancelando a inserção da mensagem.
-- Solução: Transformar a função em SECURITY DEFINER para que o sistema possa atualizar o timestamp independente do RLS do usuário.

CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER 
SECURITY DEFINER -- Permite que a função execute com privilégios de admin/owner
SET search_path = public
AS $$
BEGIN
    UPDATE conversations 
    SET last_message_at = NEW.created_at,
        updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Garantir que o trigger está aplicado corretamente
DROP TRIGGER IF EXISTS update_conversation_last_message_trigger ON messages;
CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- Reforçar políticas RLS para garantir que Prestadores possam ver suas conversas
-- (Caso a política anterior esteja restritiva demais)

-- Política para permitir que Prestadores vejam conversas onde são o service_provider
DROP POLICY IF EXISTS "Prestadores podem ver suas conversas" ON conversations;
CREATE POLICY "Prestadores podem ver suas conversas" ON conversations
    FOR SELECT USING (
        auth.uid() IN (
            SELECT sp.user_id FROM service_providers sp 
            WHERE sp.id = service_provider_id
        )
    );
