-- Adicionar coluna source_product_id à tabela dynamic_products
-- Esta coluna armazena o UUID do produto original da tabela products

ALTER TABLE public.dynamic_products 
ADD COLUMN IF NOT EXISTS source_product_id UUID REFERENCES public.products(id) ON DELETE CASCADE;

-- Adicionar coluna description se não existir
ALTER TABLE public.dynamic_products 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_dynamic_products_source_product_id 
ON public.dynamic_products(source_product_id);

-- Comentários
COMMENT ON COLUMN public.dynamic_products.source_product_id IS 
'UUID do produto original na tabela products (para produtos de usuários aprovados)';

COMMENT ON COLUMN public.dynamic_products.description IS 
'Descrição do produto';

-- Verificar dados
SELECT 
    'Migração aplicada com sucesso!' as status,
    COUNT(*) as total_produtos,
    COUNT(source_product_id) as produtos_com_source_id
FROM public.dynamic_products;
