-- Adicionar coluna para relacionar produtos de usuários com dynamic_products
ALTER TABLE dynamic_products 
ADD COLUMN IF NOT EXISTS source_product_id uuid REFERENCES products(id) ON DELETE CASCADE;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_dynamic_products_source 
ON dynamic_products(source_product_id);