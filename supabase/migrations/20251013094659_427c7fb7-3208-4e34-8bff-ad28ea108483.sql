-- Criar triggers para notificar admins sobre novos registros importantes

-- Função para notificar admins sobre novo usuário registrado
CREATE OR REPLACE FUNCTION public.notify_admin_new_user()
RETURNS trigger
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
      'new_user_registered',
      'Novo usuário registrado',
      'Um novo usuário se registrou na plataforma: ' || COALESCE(NEW.full_name, NEW.email),
      jsonb_build_object(
        'user_id', NEW.id,
        'user_name', NEW.full_name,
        'user_email', NEW.email,
        'user_type', NEW.user_type
      )
    );
  END LOOP;
  
  RETURN NEW;
END;
$function$;

-- Trigger para novo usuário
DROP TRIGGER IF EXISTS notify_admin_on_new_user ON public.user_profiles;
CREATE TRIGGER notify_admin_on_new_user
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_user();

-- Função para notificar admins sobre novo prestador de serviço
CREATE OR REPLACE FUNCTION public.notify_admin_new_service_provider()
RETURNS trigger
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
      'new_service_provider',
      'Novo prestador de serviço aguardando aprovação',
      NEW.name || ' se cadastrou como ' || NEW.category || ' e está aguardando aprovação.',
      jsonb_build_object(
        'provider_id', NEW.id,
        'provider_name', NEW.name,
        'category', NEW.category,
        'city', NEW.city
      )
    );
  END LOOP;
  
  RETURN NEW;
END;
$function$;

-- Trigger para novo prestador de serviço
DROP TRIGGER IF EXISTS notify_admin_on_new_service_provider ON public.service_providers;
CREATE TRIGGER notify_admin_on_new_service_provider
  AFTER INSERT ON public.service_providers
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_admin_new_service_provider();

-- Função para notificar admins sobre nova solicitação de aluguel
CREATE OR REPLACE FUNCTION public.notify_admin_new_rental_inquiry()
RETURNS trigger
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
      'new_rental_inquiry',
      'Nova solicitação de aluguel',
      NEW.name || ' solicitou aluguel de ' || NEW.equipment_type || ' por ' || NEW.rental_days || ' dia(s).',
      jsonb_build_object(
        'inquiry_id', NEW.id,
        'customer_name', NEW.name,
        'equipment_type', NEW.equipment_type,
        'rental_days', NEW.rental_days,
        'total_amount', NEW.total_amount
      )
    );
  END LOOP;
  
  RETURN NEW;
END;
$function$;

-- Trigger para nova solicitação de aluguel
DROP TRIGGER IF EXISTS notify_admin_on_new_rental_inquiry ON public.rental_inquiries;
CREATE TRIGGER notify_admin_on_new_rental_inquiry
  AFTER INSERT ON public.rental_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_rental_inquiry();