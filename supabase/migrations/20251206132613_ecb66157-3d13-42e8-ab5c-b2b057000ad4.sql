-- Remover trigger duplicado que causa notificações duplicadas
-- Existem dois triggers que chamam a mesma função create_message_notification()
-- Vamos manter apenas um deles

DROP TRIGGER IF EXISTS trigger_message_notification ON public.messages;

-- Também remover o trigger duplicado de atualização de timestamp
DROP TRIGGER IF EXISTS update_conversation_last_message_trigger ON public.messages;