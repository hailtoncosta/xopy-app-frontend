-- Permitir que image_url seja NULL nas tabelas de banners
ALTER TABLE dynamic_promotional_banners ALTER COLUMN image_url DROP NOT NULL;
ALTER TABLE dynamic_news_banners ALTER COLUMN image_url DROP NOT NULL;

-- Atualizar registros com image_url vazio para NULL
UPDATE dynamic_promotional_banners SET image_url = NULL WHERE image_url = '';
UPDATE dynamic_news_banners SET image_url = NULL WHERE image_url = '';
UPDATE dynamic_product_detail_banners SET image_url = NULL WHERE image_url = '';