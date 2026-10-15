-- Criar tabela para armazenar tokens do Mercado Pago dos lojistas
CREATE TABLE IF NOT EXISTS public.mercado_pago_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lojista_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  user_id_mp TEXT NOT NULL,
  public_key TEXT,
  expires_in INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lojista_id)
);

-- Índice para buscar tokens por lojista
CREATE INDEX IF NOT EXISTS idx_mp_tokens_lojista ON public.mercado_pago_tokens(lojista_id);

-- Habilitar RLS
ALTER TABLE public.mercado_pago_tokens ENABLE ROW LEVEL SECURITY;

-- Política: Lojistas podem ver seus próprios tokens
CREATE POLICY "Lojistas podem ver seus próprios tokens MP"
ON public.mercado_pago_tokens
FOR SELECT
USING (auth.uid() = lojista_id);

-- Política: Lojistas podem inserir seus próprios tokens
CREATE POLICY "Lojistas podem inserir seus próprios tokens MP"
ON public.mercado_pago_tokens
FOR INSERT
WITH CHECK (auth.uid() = lojista_id);

-- Política: Lojistas podem atualizar seus próprios tokens
CREATE POLICY "Lojistas podem atualizar seus próprios tokens MP"
ON public.mercado_pago_tokens
FOR UPDATE
USING (auth.uid() = lojista_id);

-- Política: Admins podem ver todos os tokens
CREATE POLICY "Admins podem ver todos os tokens MP"
ON public.mercado_pago_tokens
FOR ALL
USING (is_admin());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_mercado_pago_tokens_updated_at
  BEFORE UPDATE ON public.mercado_pago_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();