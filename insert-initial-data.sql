-- Script para inserir dados iniciais nas tabelas dinâmicas
-- Execute este SQL no painel do Supabase (SQL Editor)
-- Isso irá contornar as políticas RLS pois será executado como admin

-- Limpar dados existentes (se houver)
DELETE FROM dynamic_products;
DELETE FROM dynamic_banners;
DELETE FROM dynamic_categories;
DELETE FROM dynamic_news_banners;

-- Inserir produtos em destaque
INSERT INTO dynamic_products (name, price, image_url, type, category, rating, is_offer, is_featured, product_group, order_index) VALUES
('Cimento CP-II 50kg', 'R$ 24,90', '/src/assets/produto-cimento.jpg', 'produto', 'Material', 4.8, true, true, 'featured', 1),
('Tijolo Baiano 6 Furos', 'R$ 0,85', '/src/assets/produto-tijolo.jpg', 'produto', 'Material', 4.6, false, true, 'featured', 2),
('Tinta Acrílica 18L', 'R$ 89,90', '/src/assets/produto-tinta.jpg', 'produto', 'Material', 4.9, true, true, 'featured', 3),
('Argamassa AC-I 20kg', 'R$ 18,50', '/src/assets/produto-argamassa.jpg', 'produto', 'Material', 4.7, false, true, 'featured', 4);

-- Inserir produtos essenciais
INSERT INTO dynamic_products (name, price, image_url, type, category, rating, is_essential, product_group, order_index) VALUES
('Cal Hidratada 20kg', 'R$ 12,90', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', 'produto', 'Material', 4.3, true, 'essential', 1),
('Brita 1 (m³)', 'R$ 65,00', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', 'produto', 'Material', 4.4, true, 'essential', 2),
('Ferro 10mm (12m)', 'R$ 38,50', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=300&fit=crop', 'produto', 'Material', 4.7, true, 'essential', 3),
('Tubo PVC 100mm (6m)', 'R$ 42,30', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 'produto', 'Material', 4.5, true, 'essential', 4);

-- Inserir telhas
INSERT INTO dynamic_products (name, price, image_url, type, category, rating, product_group, order_index) VALUES
('Telha Cerâmica Colonial', 'R$ 1,85', 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=300&h=300&fit=crop', 'produto', 'Material', 4.6, 'tiles', 1),
('Telha Fibrocimento 6mm', 'R$ 12,50', 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=300&h=300&fit=crop', 'produto', 'Material', 4.4, 'tiles', 2),
('Telha Metálica Galvanizada', 'R$ 28,90', 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=300&h=300&fit=crop', 'produto', 'Material', 4.7, 'tiles', 3),
('Telha Shingle Asfáltica', 'R$ 15,75', 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=300&h=300&fit=crop', 'produto', 'Material', 4.5, 'tiles', 4);

-- Inserir produtos de pintura
INSERT INTO dynamic_products (name, price, image_url, type, category, rating, product_group, order_index) VALUES
('Tinta Látex Branca 18L', 'R$ 89,90', '/src/assets/produto-tinta.jpg', 'produto', 'Material', 4.9, 'paint', 1),
('Kit Pincel Profissional 5 Peças', 'R$ 45,50', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300&h=300&fit=crop', 'produto', 'Material', 4.7, 'paint', 2),
('Rolo Pintura + Bandeja', 'R$ 28,90', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300&h=300&fit=crop', 'produto', 'Material', 4.6, 'paint', 3),
('Tinta Esmalte Sintético 3,6L', 'R$ 65,90', '/src/assets/produto-tinta.jpg', 'produto', 'Material', 4.8, 'paint', 4);

-- Inserir produtos de decoração
INSERT INTO dynamic_products (name, price, image_url, type, category, rating, product_group, order_index) VALUES
('Luminária Pendente Moderna', 'R$ 189,90', 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=300&h=300&fit=crop', 'decoração', 'Decoração', 4.8, 'decoration', 1),
('Espelho Decorativo 60cm', 'R$ 125,50', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop', 'decoração', 'Decoração', 4.7, 'decoration', 2),
('Quadro Decorativo 40x60cm', 'R$ 85,90', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop', 'decoração', 'Decoração', 4.6, 'decoration', 3),
('Vaso Cerâmica P/ Plantas', 'R$ 45,90', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300&h=300&fit=crop', 'decoração', 'Decoração', 4.5, 'decoration', 4);

-- Inserir top escolhas
INSERT INTO dynamic_products (name, price, image_url, type, category, rating, is_top_choice, product_group, order_index) VALUES
('Saco de Cimento 50kg', 'R$ 26,90', '/src/assets/produto-cimento.jpg', 'produto', 'Material', 4.8, true, 'topChoices', 1),
('Cerâmica 45x45cm (m²)', 'R$ 32,50', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=300&h=300&fit=crop', 'produto', 'Material', 4.6, true, 'topChoices', 2),
('Torneira Cromada Bica Móvel', 'R$ 78,90', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 'produto', 'Material', 4.7, true, 'topChoices', 3),
('Porta de Madeira 80x210cm', 'R$ 245,00', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop', 'produto', 'Material', 4.5, true, 'topChoices', 4);

-- Inserir banners
INSERT INTO dynamic_banners (title, description, image_url, alt_text, order_index) VALUES
('Promoção Cimento', 'Até 30% de desconto em cimentos selecionados', '/src/assets/banner-cimento.jpg', 'Promoção Cimento', 1),
('Semana da Pintura', 'Tintas e acessórios com preços especiais', '/src/assets/banner-pintura.jpg', 'Semana da Pintura', 2),
('Contrate um Engenheiro', 'Profissionais qualificados para seu projeto', '/src/assets/banner-engenheiro.jpg', 'Contrate um Engenheiro', 3),
('Ofertas Especiais do Mês', 'Descontos imperdíveis em toda a loja', '/src/assets/banner-ofertas.jpg', 'Ofertas Especiais do Mês', 4);

-- Inserir categorias
INSERT INTO dynamic_categories (id, label, icon_name, order_index) VALUES
('tudo', 'Tudo', 'Grid3X3', 1),
('ofertas', 'Ofertas', 'Percent', 2),
('servicos', 'Serviços', 'Wrench', 3),
('destaques', 'Destaques', 'Star', 4),
('mais-vendidos', 'Mais vendidos', 'TrendingUp', 5),
('queridinhos', 'Queridinhos', 'Heart', 6);

-- Inserir news banner
INSERT INTO dynamic_news_banners (title, description, image_url, alt_text) VALUES
('Novidades', 'Confira as últimas atualizações e novos serviços', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=200&fit=crop&crop=center', 'Banner de Novidades - Novas funcionalidades e serviços disponíveis');

-- Verificar se os dados foram inseridos
SELECT 'Produtos inseridos:' as info, COUNT(*) as total FROM dynamic_products
UNION ALL
SELECT 'Banners inseridos:' as info, COUNT(*) as total FROM dynamic_banners
UNION ALL
SELECT 'Categorias inseridas:' as info, COUNT(*) as total FROM dynamic_categories
UNION ALL
SELECT 'News banners inseridos:' as info, COUNT(*) as total FROM dynamic_news_banners;