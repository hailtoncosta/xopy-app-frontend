-- Adicionar política para admins poderem gerenciar prestadores de serviços
CREATE POLICY "Admins can manage all service providers"
ON public.service_providers
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());