-- Atualizar função is_admin() usando CREATE OR REPLACE para evitar dependências
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Buscar o email do usuário atual usando auth.jwt()
    user_email := auth.jwt() ->> 'email';
    
    -- Verificar se o email está na lista de admins
    RETURN user_email = ANY(ARRAY[
        'admin@pedreiro.com', 
        'admin@example.com',
        'enoquesanbor@gmail.com'
    ]);
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- Atualizar as políticas da tabela products para garantir acesso correto
DROP POLICY IF EXISTS "Admins podem visualizar todos os produtos" ON products;
CREATE POLICY "Admins podem visualizar todos os produtos" 
ON products 
FOR SELECT 
USING (
    (status = 'active') OR 
    is_admin() OR 
    (auth.uid() = user_id)
);

-- Garantir que admins possam atualizar qualquer produto
DROP POLICY IF EXISTS "Admins podem atualizar produtos para aprovação" ON products;
CREATE POLICY "Admins podem atualizar produtos para aprovação" 
ON products 
FOR UPDATE 
USING (
    is_admin() OR 
    (auth.uid() = user_id)
);

-- Política para inserção
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios produtos" ON products;
CREATE POLICY "Usuários podem inserir seus próprios produtos" 
ON products 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para exclusão
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios produtos" ON products;
CREATE POLICY "Usuários podem deletar seus próprios produtos" 
ON products 
FOR DELETE 
USING (
    (auth.uid() = user_id) OR 
    is_admin()
);