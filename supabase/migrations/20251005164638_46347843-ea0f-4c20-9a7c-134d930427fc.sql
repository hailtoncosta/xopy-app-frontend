-- Adicionar coluna description à tabela dynamic_products
ALTER TABLE public.dynamic_products 
ADD COLUMN IF NOT EXISTS description text;