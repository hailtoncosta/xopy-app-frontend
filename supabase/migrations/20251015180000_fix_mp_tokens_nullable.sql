-- Tornar refresh_token opcional (pode ser NULL para tokens manuais)
ALTER TABLE public.mercado_pago_tokens 
ALTER COLUMN refresh_token DROP NOT NULL;

-- Tornar expires_in opcional (pode ser NULL para tokens manuais)
ALTER TABLE public.mercado_pago_tokens 
ALTER COLUMN expires_in DROP NOT NULL;

-- Adicionar coluna expires_at para facilitar verificação
ALTER TABLE public.mercado_pago_tokens 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Comentários para documentação
COMMENT ON COLUMN public.mercado_pago_tokens.refresh_token IS 'Token de refresh (NULL para tokens manuais)';
COMMENT ON COLUMN public.mercado_pago_tokens.expires_in IS 'Tempo de expiração em segundos (NULL para tokens manuais)';
COMMENT ON COLUMN public.mercado_pago_tokens.expires_at IS 'Data/hora de expiração do token';
