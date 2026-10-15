-- Criar tabela para gerenciar as category chips editáveis pelo admin
CREATE TABLE IF NOT EXISTS public.dynamic_category_chips (
    id SERIAL PRIMARY KEY,
    chip_id VARCHAR(50) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir dados iniciais das category chips
INSERT INTO public.dynamic_category_chips (chip_id, label, icon_name, order_index) VALUES
('tudo', 'Tudo', 'Home', 0),
('ofertas', 'Ofertas', 'Percent', 1),
('servicos', 'Serviços', 'Wrench', 2),
('destaques', 'Destaques', 'Star', 3),
('mais-vendidos', 'Mais vendidos', 'TrendingUp', 4),
('queridinhos', 'Queridinhos', 'Heart', 5)
ON CONFLICT (chip_id) DO NOTHING;

-- Habilitar RLS na tabela
ALTER TABLE public.dynamic_category_chips ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Allow public read access" ON public.dynamic_category_chips;
CREATE POLICY "Allow public read access" ON public.dynamic_category_chips
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin full access" ON public.dynamic_category_chips;
CREATE POLICY "Allow admin full access" ON public.dynamic_category_chips
FOR ALL USING ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_dynamic_category_chips_updated_at ON public.dynamic_category_chips;
CREATE TRIGGER update_dynamic_category_chips_updated_at
BEFORE UPDATE ON public.dynamic_category_chips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();