-- Migration to fix RLS policies for Chat (Conversations/Messages) and Notifications

-- 1. Ensure RLS is enabled
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 2. Clean up existing policies (Drop them to avoid conflicts)
DROP POLICY IF EXISTS "Usuários podem ver suas próprias conversas" ON conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Usuários podem criar conversas" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Usuários podem atualizar suas conversas" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;

DROP POLICY IF EXISTS "Usuários podem ver mensagens de suas conversas" ON messages;
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON messages;
DROP POLICY IF EXISTS "Usuários podem enviar mensagens" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Usuários podem marcar mensagens como lidas" ON messages;
DROP POLICY IF EXISTS "Users can update messages" ON messages;

DROP POLICY IF EXISTS "Usuários podem ver suas próprias notificações" ON notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Sistema pode criar notificações" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Usuários podem atualizar suas notificações" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

-- 3. Re-create Robust Policies

-- CONVERSATIONS
-- Users can view if they are the user_id OR if they own the service_provider_id
CREATE POLICY "conversations_select_policy" ON conversations
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM service_providers sp 
            WHERE sp.id = service_provider_id AND sp.user_id = auth.uid()
        )
    );

-- Users can insert if they match the user_id (Clients starting chat)
CREATE POLICY "conversations_insert_policy" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update (e.g. read status) if they are involved
CREATE POLICY "conversations_update_policy" ON conversations
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM service_providers sp 
            WHERE sp.id = service_provider_id AND sp.user_id = auth.uid()
        )
    );

-- MESSAGES
-- Users can view messages if they have access to the conversation
CREATE POLICY "messages_select_policy" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (
                c.user_id = auth.uid() 
                OR 
                EXISTS (
                    SELECT 1 FROM service_providers sp 
                    WHERE sp.id = c.service_provider_id AND sp.user_id = auth.uid()
                )
            )
        )
    );

-- Users can insert messages if they match the sender_id
CREATE POLICY "messages_insert_policy" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update (mark read) if they have access to conversation
CREATE POLICY "messages_update_policy" ON messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (
                c.user_id = auth.uid() 
                OR 
                EXISTS (
                    SELECT 1 FROM service_providers sp 
                    WHERE sp.id = c.service_provider_id AND sp.user_id = auth.uid()
                )
            )
        )
    );

-- NOTIFICATIONS
-- Simple: User can see/update their own; System (or triggers) can insert for anyone
-- Triggers usually bypass RLS if they are SECURITY DEFINER, but if INSERTS come from Edge Functions (service role), they bypass.
-- If Edge Function uses user auth, we need permissive insert.

CREATE POLICY "notifications_select_policy" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_policy" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow inserting if the user is authenticated (broad, but safe as auth.uid logic handles content)
-- Ideally, we'd check if auth.uid() is the sender, but for system notifications, sometimes logic is complex.
-- For now, let's allow authenticated users to insert, but maybe restrict?
-- Actually, the Edge Function uses Service Role usually? 
-- The `push-notify` usually uses `supabaseClient` (which might be anon or service role).
-- If `push-notify` edge function uses SERVICE_ROLE_KEY, it bypasses RLS.
-- But the Trigger `create_message_notification` runs as the user who inserted the message!
-- So we need to allow INSERT into notifications if the user triggered it.
-- Or just allow ALL authenticated to insert (low risk for this table) OR rely on the Trigger explicitly.
-- The trigger runs with the privileges of the function owner usually if SECURITY DEFINER, or the user if not.
-- The functions `create_message_notification` and `create_conversation_notification` should ideally be SECURITY DEFINER to avoid RLS issues.

-- Let's update the Trigger Functions to be SECURITY DEFINER to guarantee they can write notifications
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
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
    
    -- Se não achou destinatário, aborta
    IF recipient_user_id IS NULL THEN
        RETURN NEW;
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

-- Same for conversation started
CREATE OR REPLACE FUNCTION create_conversation_notification()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    provider_user_id UUID;
    user_name TEXT;
BEGIN
    SELECT sp.user_id INTO provider_user_id
    FROM service_providers sp
    WHERE sp.id = NEW.service_provider_id;
    
    -- Se não achou, aborta
    IF provider_user_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT u.full_name INTO user_name
    FROM user_profiles u
    WHERE u.id = NEW.user_id;
    
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
