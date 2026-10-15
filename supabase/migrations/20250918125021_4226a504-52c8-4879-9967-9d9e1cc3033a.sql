-- Criar triggers para gerar notificações automaticamente

-- Trigger para criar notificação quando uma nova conversa é iniciada
DROP TRIGGER IF EXISTS trigger_conversation_notification ON public.conversations;
CREATE TRIGGER trigger_conversation_notification
    AFTER INSERT ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.create_conversation_notification();

-- Trigger para criar notificação quando uma nova mensagem é enviada
DROP TRIGGER IF EXISTS trigger_message_notification ON public.messages;
CREATE TRIGGER trigger_message_notification
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.create_message_notification();

-- Trigger para atualizar timestamp da conversa quando nova mensagem é criada
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON public.messages;
CREATE TRIGGER trigger_update_conversation_timestamp
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_conversation_last_message();