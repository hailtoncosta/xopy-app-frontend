-- Corrigir erro 406 (Not Acceptable) ao buscar perfis de usuários no chat
-- Permite que usuários autenticados (como prestadores) vejam os dados básicos (nome, avatar) dos clientes
-- Isso é essencial para renderizar a lista de conversas e as bolhas de mensagens corretamente

-- Remover políticas restritivas anteriores se existirem
DROP POLICY IF EXISTS "Usuários podem ver perfis públicos" ON user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;

-- Criar política permissiva para leitura de perfis por usuários logados
-- Nota: Em um ambiente de produção rigoroso, poderíamos restringir colunas via View, 
-- mas para este marketplace é padrão que usuários vejam perfis uns dos outros.
CREATE POLICY "Authenticated users can view all profiles"
ON user_profiles FOR SELECT
TO authenticated
USING (true);

-- Garantir que usuários possam atualizar APENAS seus próprios perfis
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id);

-- Garantir índice em id (já deve existir, mas por segurança)
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);
