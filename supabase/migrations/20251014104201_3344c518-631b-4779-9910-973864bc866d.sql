-- Remove o check constraint antigo
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Adiciona um check constraint atualizado com todos os tipos de notificação necessários
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'new_message',
  'conversation_started',
  'conversation_closed',
  'new_product_pending',
  'new_service_provider',
  'new_rental_inquiry',
  'new_user_registered',
  'product_approved',
  'product_rejected',
  'service_provider_approved',
  'service_provider_rejected'
));