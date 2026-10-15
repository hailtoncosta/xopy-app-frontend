-- Adicionar configurações promocionais na tabela admin_settings
-- Esta migração adiciona as configurações de textos promocionais que podem ser editadas pelo admin

-- Inserir configurações promocionais padrão na tabela admin_settings
INSERT INTO public.admin_settings (type, settings) VALUES
('promo', '{
  "freeShippingTitle": "Frete grátis em produtos selecionados",
  "freeShippingSubtext": "Válido para compras acima de R$ 200",
  "freeShippingDescription": "Confira as condições",
  "discountTitle": "Descontos especiais",
  "discountSubtext": "Até 50% OFF em produtos selecionados",
  "discountDescription": "Aproveite nossas ofertas",
  "categoryOfferTitle": "Ofertas por categoria",
  "categoryOfferSubtext": "Produtos com preços especiais",
  "categoryOfferDescription": "Veja todas as categorias"
}'::jsonb)
ON CONFLICT (type) DO UPDATE SET
  settings = EXCLUDED.settings,
  updated_at = NOW();

-- Comentário sobre a migração
COMMENT ON TABLE public.admin_settings IS 'Tabela de configurações do sistema, incluindo textos promocionais editáveis pelo admin';