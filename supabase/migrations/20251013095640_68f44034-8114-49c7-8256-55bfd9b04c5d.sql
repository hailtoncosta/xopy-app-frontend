-- Adicionar campos para vincular produtos aos clips
ALTER TABLE public.dynamic_clips 
ADD COLUMN IF NOT EXISTS linked_product_id INTEGER,
ADD COLUMN IF NOT EXISTS linked_product_section TEXT,
ADD COLUMN IF NOT EXISTS linked_product_type TEXT DEFAULT 'product' CHECK (linked_product_type IN ('product', 'rental'));

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.dynamic_clips.linked_product_id IS 'ID do produto ou equipamento de locação vinculado ao clip';
COMMENT ON COLUMN public.dynamic_clips.linked_product_section IS 'Seção do produto (paint, decoration, tiles, essential, featured, topChoices, rental)';
COMMENT ON COLUMN public.dynamic_clips.linked_product_type IS 'Tipo do produto vinculado: product (dynamic_products) ou rental (dynamic_rentals)';