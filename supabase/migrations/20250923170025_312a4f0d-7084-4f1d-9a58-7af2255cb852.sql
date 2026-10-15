-- Corrigir warning de segurança da função is_admin() adicionando search_path
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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