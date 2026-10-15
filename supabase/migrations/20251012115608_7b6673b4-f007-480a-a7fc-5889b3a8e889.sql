-- Criar trigger para notificar admins sobre novos produtos pendentes
CREATE OR REPLACE FUNCTION notify_admin_new_product()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
        ELSE 'Um novo produto foi cadastrado e está aguardando sua aprovação.'
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
$$;

-- Criar trigger que chama a função quando um produto é inserido com status pending
DROP TRIGGER IF EXISTS trigger_notify_admin_new_product ON public.products;
CREATE TRIGGER trigger_notify_admin_new_product
AFTER INSERT ON public.products
FOR EACH ROW
WHEN (NEW.approval_status = 'pending')
EXECUTE FUNCTION notify_admin_new_product();