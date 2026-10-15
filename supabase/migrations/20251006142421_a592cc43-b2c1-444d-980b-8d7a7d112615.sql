-- Criar tabela para produtos de locação
CREATE TABLE IF NOT EXISTS public.dynamic_rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price VARCHAR(50) NOT NULL,
  period VARCHAR(50) DEFAULT '/dia',
  image_url TEXT NOT NULL,
  available BOOLEAN DEFAULT true,
  popular BOOLEAN DEFAULT false,
  rating NUMERIC(3,2) DEFAULT 0.0,
  location VARCHAR(255) DEFAULT 'São Paulo - SP',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_dynamic_rentals_active ON public.dynamic_rentals(is_active);
CREATE INDEX idx_dynamic_rentals_category ON public.dynamic_rentals(category);
CREATE INDEX idx_dynamic_rentals_popular ON public.dynamic_rentals(popular);

-- RLS Policies
ALTER TABLE public.dynamic_rentals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locações são públicas para leitura"
ON public.dynamic_rentals
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins podem gerenciar locações"
ON public.dynamic_rentals
FOR ALL
USING (is_admin());

-- Trigger para updated_at
CREATE TRIGGER update_dynamic_rentals_updated_at
BEFORE UPDATE ON public.dynamic_rentals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.dynamic_rentals;

-- Inserir dados iniciais das locações existentes
INSERT INTO public.dynamic_rentals (name, category, price, period, image_url, available, popular, rating, location, description, order_index) VALUES
('Escavadeira Hidráulica CAT 320', 'Máquinas Pesadas', 'R$ 450', '/dia', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop', true, true, 4.8, 'São Paulo - SP', 'Escavadeira hidráulica para trabalhos pesados de terraplanagem', 1),
('Plataforma Elevatória 15m', 'Plataformas', 'R$ 280', '/dia', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop', true, false, 4.6, 'São Paulo - SP', 'Plataforma elevatória para trabalhos em altura até 15 metros', 2),
('Betoneira 400L Profissional', 'Ferramentas', 'R$ 85', '/dia', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop', true, false, 4.5, 'São Paulo - SP', 'Betoneira de alta capacidade para grandes volumes de concreto', 3),
('Compressor de Ar 10HP', 'Ferramentas', 'R$ 120', '/dia', 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop', false, false, 4.7, 'São Paulo - SP', 'Compressor de ar de alta pressão para ferramentas pneumáticas', 4),
('Retroescavadeira JCB', 'Máquinas Pesadas', 'R$ 520', '/dia', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop', true, true, 4.9, 'São Paulo - SP', 'Retroescavadeira versátil para escavação e carregamento', 5),
('Andaime Tubular Completo', 'Plataformas', 'R$ 45', '/dia', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop', true, false, 4.4, 'São Paulo - SP', 'Sistema completo de andaimes tubulares para construção', 6),
('Martelo Demolidor Elétrico', 'Ferramentas', 'R$ 65', '/dia', 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop', true, false, 4.3, 'São Paulo - SP', 'Martelo demolidor profissional para quebra de concreto e alvenaria', 7),
('Gerador de Energia 15KVA', 'Equipamentos Elétricos', 'R$ 180', '/dia', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop', true, false, 4.7, 'São Paulo - SP', 'Gerador de energia silencioso para obras e eventos', 8);