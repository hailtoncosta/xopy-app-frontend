-- Criar tabela específica para banner de detalhes do produto
CREATE TABLE IF NOT EXISTS public.dynamic_product_detail_banners (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '40% OFF',
  description TEXT DEFAULT 'nas compras acima de R$800,00',
  image_url TEXT,
  alt_text TEXT DEFAULT 'Banner de desconto',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.dynamic_product_detail_banners ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow admin full access" 
ON public.dynamic_product_detail_banners 
FOR ALL 
USING (is_admin());

CREATE POLICY "Allow public read access" 
ON public.dynamic_product_detail_banners 
FOR SELECT 
USING (is_active = true);

-- Insert default data
INSERT INTO public.dynamic_product_detail_banners (title, description, image_url, alt_text, is_active)
VALUES ('40% OFF', 'nas compras acima de R$800,00', '', 'Banner de desconto', true)
ON CONFLICT DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_product_detail_banners_updated_at
    BEFORE UPDATE ON public.dynamic_product_detail_banners
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();