-- Create table for popular categories
CREATE TABLE IF NOT EXISTS public.dynamic_popular_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  store TEXT NOT NULL,
  banner_title TEXT DEFAULT 'Super Ofertas',
  banner_subtitle TEXT DEFAULT 'Até 50% OFF em materiais selecionados',
  banner_image_url TEXT,
  filter_chips JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dynamic_popular_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins podem gerenciar categorias populares"
ON public.dynamic_popular_categories
FOR ALL
USING (is_admin());

CREATE POLICY "Categorias populares são públicas para leitura"
ON public.dynamic_popular_categories
FOR SELECT
USING (is_active = true);

-- Insert default data (migrar dados existentes do código)
INSERT INTO public.dynamic_popular_categories (id, name, image_url, store, order_index) VALUES
  ('essenciais', 'Essenciais da obra', 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=300&h=300&fit=crop', 'leroy', 1),
  ('telhanorte', 'Telhanorte', 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=300&h=300&fit=crop', 'telhanorte', 2),
  ('telhas', 'Telhas', 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=300&h=300&fit=crop', 'telhanorte', 3),
  ('cc', 'C&C', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', 'cc', 4),
  ('pintura', 'Semana da pintura', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300&h=300&fit=crop', 'cc', 5),
  ('dicico', 'Dicico', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop', 'dicico', 6),
  ('decoracao', 'Vibe Decoração', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop', 'dicico', 7),
  ('leroy', 'Leroy Merlin', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', 'leroy', 8),
  ('top-escolhas', 'Top escolhas pra você', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', 'leroy', 9),
  ('construcenter', 'Construcenter', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 'construcenter', 10),
  ('hidraulica', 'Hidráulica', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 'construcenter', 11),
  ('eletrica', 'Elétrica', 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=300&h=300&fit=crop', 'cc', 12),
  ('ferramentas', 'Ferramentas', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=300&fit=crop', 'telhanorte', 13),
  ('seguranca', 'Segurança', 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=300&h=300&fit=crop', 'telhanorte', 14)
ON CONFLICT (id) DO NOTHING;