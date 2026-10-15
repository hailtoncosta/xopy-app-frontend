-- Adicionar coluna approval_status à tabela products se não existir
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending' 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Adicionar coluna images à tabela products se não existir (para armazenar URLs das imagens)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS images TEXT[];

-- Atualizar produtos existentes para ter approval_status = 'approved' se status = 'active'
UPDATE public.products 
SET approval_status = 'approved' 
WHERE approval_status IS NULL AND status = 'active';

-- Garantir que a constraint de notificações está atualizada
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

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

-- Recriar a função de notificação de produtos com verificação mais robusta
CREATE OR REPLACE FUNCTION public.notify_admin_new_product()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Buscar todos os admins
  FOR admin_user_id IN 
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    -- Criar notificação para cada admin
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      data
    ) VALUES (
      admin_user_id,
      'new_product_pending',
      'Novo produto aguardando aprovação',
      CASE 
        WHEN NEW.product_type = 'new' AND NEW.description LIKE '[LOCAÇÃO]%' 
        THEN 'Um novo equipamento para locação foi cadastrado e está aguardando sua aprovação.'
        ELSE 'Um novo produto foi cadastrado e está aguardando sua aprovação: ' || NEW.title
      END,
      jsonb_build_object(
        'product_id', NEW.id,
        'product_title', NEW.title,
        'product_type', NEW.product_type,
        'seller_type', NEW.seller_type,
        'price', NEW.price
      )
    );
  END LOOP;
  
  RETURN NEW;
END;
$function$;

-- Recriar o trigger
DROP TRIGGER IF EXISTS trigger_notify_admin_new_product ON public.products;
CREATE TRIGGER trigger_notify_admin_new_product
AFTER INSERT ON public.products
FOR EACH ROW
WHEN (NEW.approval_status = 'pending')
EXECUTE FUNCTION public.notify_admin_new_product();

-- Adicionar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_approval_status ON public.products(approval_status);

-- Comentários para documentação
COMMENT ON COLUMN public.products.approval_status IS 'Status de aprovação do produto: pending (aguardando), approved (aprovado), rejected (rejeitado)';
COMMENT ON COLUMN public.products.images IS 'Array de URLs das imagens do produto';
