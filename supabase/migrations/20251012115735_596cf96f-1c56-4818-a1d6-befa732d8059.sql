-- Corrigir search_path para todas as funções relacionadas a produtos
-- Já foi definido na função notify_admin_new_product, mas vamos garantir que outras funções também tenham

-- Função update_updated_at_column já tem search_path definido, verificar outras
-- A função notify_admin_new_product já tem SET search_path = public, está correta

-- Verificar e corrigir a função update_lojistas_updated_at_column se necessário
CREATE OR REPLACE FUNCTION public.update_lojistas_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Verificar e corrigir a função update_service_providers_updated_at se necessário
CREATE OR REPLACE FUNCTION public.update_service_providers_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;