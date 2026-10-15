-- Corrigir o trigger para NÃO enviar notificação de "aguardando aprovação" para o usuário vendedor
-- Apenas admins devem receber essa notificação

CREATE OR REPLACE FUNCTION public.notify_admin_new_product()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Buscar todos os admins (excluindo o próprio usuário que criou o produto)
  FOR admin_user_id IN 
    SELECT user_id 
    FROM public.user_roles 
    WHERE role = 'admin' 
    AND user_id != NEW.user_id  -- NÃO enviar para o próprio vendedor
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

-- Criar função para notificar o vendedor quando produto for aprovado
CREATE OR REPLACE FUNCTION public.notify_seller_product_approved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se o status mudou de 'pending' para 'approved'
  IF OLD.approval_status = 'pending' AND NEW.approval_status = 'approved' THEN
    -- Criar notificação para o vendedor
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      data
    ) VALUES (
      NEW.user_id,
      'product_approved',
      '✅ Produto aprovado!',
      'Seu produto "' || NEW.title || '" foi aprovado e já está disponível para venda!',
      jsonb_build_object(
        'product_id', NEW.id,
        'product_title', NEW.title,
        'product_type', NEW.product_type,
        'price', NEW.price
      )
    );
  END IF;
  
  -- Verificar se o status mudou de 'pending' para 'rejected'
  IF OLD.approval_status = 'pending' AND NEW.approval_status = 'rejected' THEN
    -- Criar notificação para o vendedor
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      data
    ) VALUES (
      NEW.user_id,
      'product_rejected',
      '❌ Produto não aprovado',
      'Seu produto "' || NEW.title || '" não foi aprovado. Entre em contato com o suporte para mais informações.',
      jsonb_build_object(
        'product_id', NEW.id,
        'product_title', NEW.title,
        'product_type', NEW.product_type
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recriar o trigger de inserção (apenas para admins)
DROP TRIGGER IF EXISTS trigger_notify_admin_new_product ON public.products;
CREATE TRIGGER trigger_notify_admin_new_product
AFTER INSERT ON public.products
FOR EACH ROW
WHEN (NEW.approval_status = 'pending')
EXECUTE FUNCTION public.notify_admin_new_product();

-- Criar trigger de atualização (para notificar vendedor quando aprovado/rejeitado)
DROP TRIGGER IF EXISTS trigger_notify_seller_product_status ON public.products;
CREATE TRIGGER trigger_notify_seller_product_status
AFTER UPDATE ON public.products
FOR EACH ROW
WHEN (OLD.approval_status IS DISTINCT FROM NEW.approval_status)
EXECUTE FUNCTION public.notify_seller_product_approved();
