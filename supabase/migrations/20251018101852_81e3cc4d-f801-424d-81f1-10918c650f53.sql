
-- Problema: Usuários não-admin não conseguem ler as configurações da tabela admin_settings
-- Solução: Criar política para permitir SELECT para todos, mas manter UPDATE/DELETE apenas para admins

-- Remover a política existente que bloqueia tudo
DROP POLICY IF EXISTS "Admins podem gerenciar admin_settings" ON admin_settings;

-- Criar política para permitir que TODOS leiam as configurações (incluindo usuários não autenticados)
CREATE POLICY "Todos podem ler configurações"
ON admin_settings
FOR SELECT
TO public
USING (true);

-- Criar política para permitir que apenas admins insiram configurações
CREATE POLICY "Apenas admins podem inserir configurações"
ON admin_settings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  )
);

-- Criar política para permitir que apenas admins atualizem configurações
CREATE POLICY "Apenas admins podem atualizar configurações"
ON admin_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  )
);

-- Criar política para permitir que apenas admins deletem configurações
CREATE POLICY "Apenas admins podem deletar configurações"
ON admin_settings
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  )
);
