-- Adicionar 'locação' como tipo válido na tabela dynamic_products

-- Primeiro, remover o constraint existente
ALTER TABLE dynamic_products DROP CONSTRAINT IF EXISTS dynamic_products_type_check;

-- Criar novo constraint que inclui 'locação'
ALTER TABLE dynamic_products ADD CONSTRAINT dynamic_products_type_check 
  CHECK (type IN ('produto', 'serviço', 'decoração', 'locação'));

-- Comentário para documentação
COMMENT ON CONSTRAINT dynamic_products_type_check ON dynamic_products 
  IS 'Permite os tipos: produto, serviço, decoração, locação';