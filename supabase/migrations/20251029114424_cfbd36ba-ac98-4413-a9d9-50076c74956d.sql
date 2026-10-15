-- Criar tabela para configurações da plataforma
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 5.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configuração inicial com 5% de taxa
INSERT INTO public.platform_settings (commission_rate) 
VALUES (5.00)
ON CONFLICT DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler (necessário para cálculos de pagamento)
CREATE POLICY "Todos podem ler configurações da plataforma"
ON public.platform_settings
FOR SELECT
USING (true);

-- Política: Apenas admins podem atualizar
CREATE POLICY "Apenas admins podem atualizar configurações"
ON public.platform_settings
FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- Política: Apenas admins podem inserir
CREATE POLICY "Apenas admins podem inserir configurações"
ON public.platform_settings
FOR INSERT
WITH CHECK (is_admin());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE public.platform_settings IS 'Configurações gerais da plataforma Xopy';
COMMENT ON COLUMN public.platform_settings.commission_rate IS 'Taxa de comissão da plataforma em porcentagem (0-100)';