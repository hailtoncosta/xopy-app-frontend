-- Adicionar search_path às funções de notificação que estão faltando

-- Corrigir função create_message_notification
CREATE OR REPLACE FUNCTION public.create_message_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    conversation_record RECORD;
    recipient_user_id UUID;
    sender_name TEXT;
BEGIN
    SELECT c.user_id, c.service_provider_id, sp.user_id as provider_user_id
    INTO conversation_record
    FROM public.conversations c
    LEFT JOIN public.service_providers sp ON sp.id = c.service_provider_id
    WHERE c.id = NEW.conversation_id;
    
    IF NEW.sender_type = 'user' THEN
        recipient_user_id := conversation_record.provider_user_id;
    ELSE
        recipient_user_id := conversation_record.user_id;
    END IF;
    
    SELECT u.full_name INTO sender_name
    FROM public.user_profiles u
    WHERE u.id = NEW.sender_id;
    
    INSERT INTO public.notifications (user_id, type, title, message, data)
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
$function$;

-- Corrigir função create_conversation_notification
CREATE OR REPLACE FUNCTION public.create_conversation_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    provider_user_id UUID;
    user_name TEXT;
BEGIN
    SELECT sp.user_id INTO provider_user_id
    FROM public.service_providers sp
    WHERE sp.id = NEW.service_provider_id;
    
    SELECT u.full_name INTO user_name
    FROM public.user_profiles u
    WHERE u.id = NEW.user_id;
    
    INSERT INTO public.notifications (user_id, type, title, message, data)
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
$function$;