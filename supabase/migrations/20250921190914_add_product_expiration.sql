-- Adicionar campo de expiração para produtos
ALTER TABLE public.products 
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;

-- Adicionar índice para melhor performance
CREATE INDEX idx_products_expires_at ON public.products (expires_at);

-- Função para definir expiração de 30 dias
CREATE OR REPLACE FUNCTION set_product_expiration_30_days(product_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.products 
    SET expires_at = NOW() + INTERVAL '30 days'
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar produtos expirados
CREATE OR REPLACE FUNCTION get_expired_products()
RETURNS TABLE(
    id UUID,
    title TEXT,
    user_id UUID,
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.title, p.user_id, p.expires_at
    FROM public.products p
    WHERE p.expires_at IS NOT NULL 
    AND p.expires_at < NOW()
    AND p.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para auto-desativar produtos expirados (pode ser chamada por um cron job)
CREATE OR REPLACE FUNCTION deactivate_expired_products()
RETURNS INTEGER AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    UPDATE public.products 
    SET status = 'inactive',
        updated_at = NOW()
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW()
    AND status = 'active';
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;