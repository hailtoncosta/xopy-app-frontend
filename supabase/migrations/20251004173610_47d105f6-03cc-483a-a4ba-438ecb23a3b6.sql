-- Habilitar Realtime para a tabela dynamic_products
ALTER TABLE dynamic_products REPLICA IDENTITY FULL;

-- Adicionar a tabela à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE dynamic_products;