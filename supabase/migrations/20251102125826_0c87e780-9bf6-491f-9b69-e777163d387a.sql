-- Função para notificar vendedor sobre nova compra/locação
CREATE OR REPLACE FUNCTION public.notify_seller_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  product_title TEXT;
  buyer_name TEXT;
  order_type_text TEXT;
BEGIN
  -- Buscar informações do produto (se houver)
  IF NEW.product_id IS NOT NULL THEN
    SELECT title INTO product_title
    FROM public.products
    WHERE id = NEW.product_id;
  END IF;

  -- Buscar nome do comprador
  SELECT full_name INTO buyer_name
  FROM public.user_profiles
  WHERE id = NEW.buyer_id;

  -- Definir texto baseado no tipo de pedido
  IF NEW.order_type = 'rental' THEN
    order_type_text := 'locação';
  ELSE
    order_type_text := 'compra';
  END IF;

  -- Criar notificação para o vendedor
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    NEW.seller_id,
    'new_order',
    '🛒 Nova ' || order_type_text || '!',
    COALESCE(buyer_name, 'Um cliente') || ' fez uma ' || order_type_text || 
    CASE 
      WHEN product_title IS NOT NULL THEN ' de "' || product_title || '"'
      ELSE ''
    END || 
    ' no valor de R$ ' || NEW.total_amount::TEXT,
    jsonb_build_object(
      'order_id', NEW.id,
      'order_type', NEW.order_type,
      'product_id', NEW.product_id,
      'product_title', product_title,
      'buyer_id', NEW.buyer_id,
      'buyer_name', buyer_name,
      'total_amount', NEW.total_amount,
      'status', NEW.status
    )
  );

  RETURN NEW;
END;
$function$;

-- Criar trigger para notificar vendedor quando novo pedido é criado
DROP TRIGGER IF EXISTS notify_seller_on_new_order ON public.orders;
CREATE TRIGGER notify_seller_on_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_seller_new_order();

-- Função para notificar vendedor sobre mudança de status do pedido
CREATE OR REPLACE FUNCTION public.notify_seller_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  product_title TEXT;
  buyer_name TEXT;
  status_message TEXT;
BEGIN
  -- Só notificar se o status mudou
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Buscar informações do produto (se houver)
  IF NEW.product_id IS NOT NULL THEN
    SELECT title INTO product_title
    FROM public.products
    WHERE id = NEW.product_id;
  END IF;

  -- Buscar nome do comprador
  SELECT full_name INTO buyer_name
  FROM public.user_profiles
  WHERE id = NEW.buyer_id;

  -- Definir mensagem baseada no novo status
  CASE NEW.status
    WHEN 'paid' THEN
      status_message := '✅ Pedido confirmado! Pagamento aprovado.';
    WHEN 'shipped' THEN
      status_message := '📦 Pedido enviado!';
    WHEN 'delivered' THEN
      status_message := '🎉 Pedido entregue com sucesso!';
    WHEN 'cancelled' THEN
      status_message := '❌ Pedido cancelado.';
    ELSE
      status_message := '📋 Status do pedido atualizado: ' || NEW.status;
  END CASE;

  -- Criar notificação para o vendedor
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    NEW.seller_id,
    'order_status_changed',
    'Atualização de Pedido',
    status_message || ' Pedido ' || 
    CASE 
      WHEN product_title IS NOT NULL THEN 'de "' || product_title || '"'
      ELSE '#' || NEW.id::TEXT
    END,
    jsonb_build_object(
      'order_id', NEW.id,
      'order_type', NEW.order_type,
      'product_id', NEW.product_id,
      'product_title', product_title,
      'buyer_id', NEW.buyer_id,
      'buyer_name', buyer_name,
      'old_status', OLD.status,
      'new_status', NEW.status,
      'total_amount', NEW.total_amount
    )
  );

  -- Também notificar o comprador
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    NEW.buyer_id,
    'order_status_changed',
    'Atualização do seu Pedido',
    status_message,
    jsonb_build_object(
      'order_id', NEW.id,
      'order_type', NEW.order_type,
      'product_id', NEW.product_id,
      'product_title', product_title,
      'seller_id', NEW.seller_id,
      'old_status', OLD.status,
      'new_status', NEW.status,
      'total_amount', NEW.total_amount
    )
  );

  RETURN NEW;
END;
$function$;

-- Criar trigger para notificar sobre mudanças de status
DROP TRIGGER IF EXISTS notify_on_order_status_change ON public.orders;
CREATE TRIGGER notify_on_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_seller_order_status_change();