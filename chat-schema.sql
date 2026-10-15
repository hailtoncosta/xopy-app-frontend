-- Criação das tabelas para o sistema de chat
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de conversas
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  service_provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'service_provider')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_message', 'conversation_started', 'conversation_closed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_service_provider_id ON conversations(service_provider_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Trigger para atualizar updated_at na tabela conversations
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar last_message_at quando uma nova mensagem é criada
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET last_message_at = NEW.created_at,
        updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar last_message_at
DROP TRIGGER IF EXISTS update_conversation_last_message_trigger ON messages;
CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para conversations
DROP POLICY IF EXISTS "Usuários podem ver suas próprias conversas" ON conversations;
CREATE POLICY "Usuários podem ver suas próprias conversas" ON conversations
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT sp.user_id FROM service_providers sp 
            WHERE sp.id = service_provider_id
        )
    );

DROP POLICY IF EXISTS "Usuários podem criar conversas" ON conversations;
CREATE POLICY "Usuários podem criar conversas" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas conversas" ON conversations;
CREATE POLICY "Usuários podem atualizar suas conversas" ON conversations
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT sp.user_id FROM service_providers sp 
            WHERE sp.id = service_provider_id
        )
    );

-- Políticas para messages
DROP POLICY IF EXISTS "Usuários podem ver mensagens de suas conversas" ON messages;
CREATE POLICY "Usuários podem ver mensagens de suas conversas" ON messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT c.id FROM conversations c 
            WHERE c.user_id = auth.uid() OR 
                  c.service_provider_id IN (
                      SELECT sp.id FROM service_providers sp 
                      WHERE sp.user_id = auth.uid()
                  )
        )
    );

DROP POLICY IF EXISTS "Usuários podem enviar mensagens" ON messages;
CREATE POLICY "Usuários podem enviar mensagens" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        conversation_id IN (
            SELECT c.id FROM conversations c 
            WHERE c.user_id = auth.uid() OR 
                  c.service_provider_id IN (
                      SELECT sp.id FROM service_providers sp 
                      WHERE sp.user_id = auth.uid()
                  )
        )
    );

DROP POLICY IF EXISTS "Usuários podem marcar mensagens como lidas" ON messages;
CREATE POLICY "Usuários podem marcar mensagens como lidas" ON messages
    FOR UPDATE USING (
        conversation_id IN (
            SELECT c.id FROM conversations c 
            WHERE c.user_id = auth.uid() OR 
                  c.service_provider_id IN (
                      SELECT sp.id FROM service_providers sp 
                      WHERE sp.user_id = auth.uid()
                  )
        )
    );

-- Políticas para notifications
DROP POLICY IF EXISTS "Usuários podem ver suas próprias notificações" ON notifications;
CREATE POLICY "Usuários podem ver suas próprias notificações" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Sistema pode criar notificações" ON notifications;
CREATE POLICY "Sistema pode criar notificações" ON notifications
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Usuários podem atualizar suas notificações" ON notifications;
CREATE POLICY "Usuários podem atualizar suas notificações" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Função para criar notificação quando uma conversa é iniciada
CREATE OR REPLACE FUNCTION create_conversation_notification()
RETURNS TRIGGER AS $$
DECLARE
    provider_user_id UUID;
    user_name TEXT;
BEGIN
    -- Buscar o user_id do prestador de serviço
    SELECT sp.user_id INTO provider_user_id
    FROM service_providers sp
    WHERE sp.id = NEW.service_provider_id;
    
    -- Buscar o nome do usuário que iniciou a conversa
    SELECT u.full_name INTO user_name
    FROM user_profiles u
    WHERE u.id = NEW.user_id;
    
    -- Criar notificação para o prestador de serviço
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
        provider_user_id,
        'conversation_started',
        'Nova conversa iniciada',
        COALESCE(user_name, 'Um usuário') || ' iniciou uma conversa com você',
        jsonb_build_object(
            'conversation_id', NEW.id,
            'user_id', NEW.user_id
        )
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para criar notificação quando conversa é iniciada
DROP TRIGGER IF EXISTS create_conversation_notification_trigger ON conversations;
CREATE TRIGGER create_conversation_notification_trigger
    AFTER INSERT ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION create_conversation_notification();

-- Função para criar notificação quando uma mensagem é enviada
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
    conversation_record RECORD;
    recipient_user_id UUID;
    sender_name TEXT;
BEGIN
    -- Buscar informações da conversa
    SELECT c.user_id, c.service_provider_id, sp.user_id as provider_user_id
    INTO conversation_record
    FROM conversations c
    LEFT JOIN service_providers sp ON sp.id = c.service_provider_id
    WHERE c.id = NEW.conversation_id;
    
    -- Determinar quem deve receber a notificação
    IF NEW.sender_type = 'user' THEN
        recipient_user_id := conversation_record.provider_user_id;
    ELSE
        recipient_user_id := conversation_record.user_id;
    END IF;
    
    -- Buscar nome do remetente
    SELECT u.full_name INTO sender_name
    FROM user_profiles u
    WHERE u.id = NEW.sender_id;
    
    -- Criar notificação para o destinatário
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
        recipient_user_id,
        'new_message',
        'Nova mensagem',
        COALESCE(sender_name, 'Alguém') || ' enviou uma mensagem',
        jsonb_build_object(
            'conversation_id', NEW.conversation_id,
            'message_id', NEW.id,
            'sender_id', NEW.sender_id
        )
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para criar notificação quando mensagem é enviada
DROP TRIGGER IF EXISTS create_message_notification_trigger ON messages;
CREATE TRIGGER create_message_notification_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION create_message_notification();