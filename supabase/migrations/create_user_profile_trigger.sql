-- Trigger MELHORADO para criar automaticamente user_profile quando um usuário se registra
-- Suporta cadastro normal, Google OAuth, e outros provedores
-- Execute este script no SQL Editor do Supabase

-- Criar/Atualizar função que será executada pelo trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir ou atualizar perfil de usuário
  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    phone,
    user_type,
    avatar_url,
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'given_name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(
      NEW.raw_user_meta_data->>'type',
      NEW.raw_user_meta_data->>'user_type',
      'customer'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      NEW.raw_user_meta_data->>'avatar',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    ),
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END,
    NEW.created_at,
    COALESCE(NEW.updated_at, NEW.created_at)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(
      NULLIF(EXCLUDED.full_name, ''),
      user_profiles.full_name
    ),
    phone = COALESCE(
      NULLIF(EXCLUDED.phone, ''),
      user_profiles.phone
    ),
    avatar_url = COALESCE(
      NULLIF(EXCLUDED.avatar_url, ''),
      user_profiles.avatar_url
    ),
    is_verified = EXCLUDED.is_verified,
    updated_at = EXCLUDED.updated_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger que executa a função quando um novo usuário é criado OU atualizado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Comentário explicativo
COMMENT ON FUNCTION public.handle_new_user() IS 
'Cria/atualiza automaticamente um perfil em user_profiles quando um usuário se registra ou atualiza em auth.users. Suporta Google OAuth e outros provedores.';
