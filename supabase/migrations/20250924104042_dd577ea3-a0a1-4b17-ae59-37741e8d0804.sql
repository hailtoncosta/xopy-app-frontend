-- Inserir dados padrão para banner promocional se não existir
INSERT INTO dynamic_promotional_banners (title, description, image_url, alt_text, is_active, order_index)
SELECT 'Ofertas Imperdíveis!', 'Descontos de até 50% em produtos selecionados desta categoria', '', 'Banner promocional', true, 1
WHERE NOT EXISTS (SELECT 1 FROM dynamic_promotional_banners);

-- Atualizar banner de notícias para ter dados mais consistentes
UPDATE dynamic_news_banners 
SET 
  title = 'Novidades da Semana',
  description = 'Confira as novidades e promoções desta semana',
  alt_text = 'Banner de notícias',
  updated_at = NOW()
WHERE id = 1;

-- Garantir que o banner de produto tem dados consistentes
UPDATE dynamic_product_detail_banners 
SET 
  title = '40% OFF',
  description = 'nas compras acima de R$800,00',
  alt_text = 'Banner de desconto',
  updated_at = NOW()
WHERE id = 1;