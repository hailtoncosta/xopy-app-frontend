-- Corrigir RLS policy do admin_settings que está causando erro 403
DROP POLICY IF EXISTS "Apenas admins podem acessar configurações" ON public.admin_settings;

CREATE POLICY "Admins podem gerenciar configurações admin" 
ON public.admin_settings 
FOR ALL 
USING (is_admin());

-- Adicionar policy de leitura pública para configurações não sensíveis
CREATE POLICY "Configurações públicas podem ser lidas" 
ON public.admin_settings 
FOR SELECT 
USING (type IN ('appearance', 'interface', 'general'));