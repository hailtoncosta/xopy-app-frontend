-- Tabela para banners dinâmicos
CREATE TABLE IF NOT EXISTS dynamic_banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para categorias dinâmicas
CREATE TABLE IF NOT EXISTS dynamic_categories (
  id VARCHAR(50) PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  icon_name VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para produtos dinâmicos
CREATE TABLE IF NOT EXISTS dynamic_products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price VARCHAR(50) NOT NULL,
  image_url TEXT NOT NULL,
  type VARCHAR(20) CHECK (type IN ('produto', 'serviço', 'decoração')) DEFAULT 'produto',
  category VARCHAR(100) NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0.0,
  is_offer BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_essential BOOLEAN DEFAULT false,
  is_top_choice BOOLEAN DEFAULT false,
  product_group VARCHAR(50) DEFAULT 'home',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para news banner dinâmico
CREATE TABLE IF NOT EXISTS dynamic_news_banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para banners promocionais dinâmicos
CREATE TABLE IF NOT EXISTS dynamic_promotional_banners (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  price VARCHAR(50),
  features JSONB DEFAULT '[]'::jsonb,
  button_text VARCHAR(100) DEFAULT 'Ver Produtos',
  gradient VARCHAR(255) DEFAULT 'bg-gradient-to-r from-blue-600 to-blue-800',
  emoji VARCHAR(10) DEFAULT '🏠',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para dados da loja dinâmicos
CREATE TABLE IF NOT EXISTS dynamic_store_data (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  review_count VARCHAR(20) DEFAULT '0',
  features JSONB DEFAULT '[]'::jsonb,
  gradient VARCHAR(255) DEFAULT 'bg-gradient-to-r from-blue-600 to-blue-800',
  logo VARCHAR(10) DEFAULT 'C',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_dynamic_banners_active_order ON dynamic_banners(is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_dynamic_categories_active_order ON dynamic_categories(is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_dynamic_products_active_group ON dynamic_products(is_active, product_group, order_index);
CREATE INDEX IF NOT EXISTS idx_dynamic_news_banners_active ON dynamic_news_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_dynamic_promotional_banners_active ON dynamic_promotional_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_dynamic_store_data_active ON dynamic_store_data(is_active);

-- Inserir dados iniciais baseados nos dados estáticos existentes

-- Banners iniciais
INSERT INTO dynamic_banners (title, description, image_url, alt_text, order_index) VALUES
('Promoção Cimento', 'Até 30% de desconto em cimentos selecionados', '/src/assets/banner-cimento.jpg', 'Promoção Cimento', 1),
('Semana da Pintura', 'Tintas e acessórios com preços especiais', '/src/assets/banner-pintura.jpg', 'Semana da Pintura', 2),
('Contrate um Engenheiro', 'Profissionais qualificados para seu projeto', '/src/assets/banner-engenheiro.jpg', 'Contrate um Engenheiro', 3),
('Ofertas Especiais do Mês', 'Descontos imperdíveis em toda a loja', '/src/assets/banner-ofertas.jpg', 'Ofertas Especiais do Mês', 4)
ON CONFLICT DO NOTHING;

-- Categorias iniciais
INSERT INTO dynamic_categories (id, label, icon_name, order_index) VALUES
('ofertas', 'Ofertas', 'Tag', 1),
('servicos', 'Serviços', 'Wrench', 2),
('destaques', 'Destaques', 'Star', 3),
('mais-vendidos', 'Mais vendidos', 'TrendingUp', 4),
('queridinhos', 'Queridinhos', 'Heart', 5)
ON CONFLICT DO NOTHING;

-- News Banner inicial
INSERT INTO dynamic_news_banners (title, description, image_url, alt_text) VALUES
('Novidades', 'Confira as últimas atualizações e novos serviços', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=200&fit=crop&crop=center', 'Banner de Novidades - Novas funcionalidades e serviços disponíveis')
ON CONFLICT DO NOTHING;

-- Banner promocional inicial
INSERT INTO dynamic_promotional_banners (id, title, subtitle, description, price, features, button_text, gradient, emoji) VALUES
('smart-home', 'Casa Inteligente', 'Eletrônicos & Automação', 'Produtos Eletrônicos e Automação', 'R$ 89,90', '["Economia", "Controle app", "Fácil instalação"]'::jsonb, 'Ver Produtos', 'bg-gradient-to-r from-green-600 to-emerald-800', '🏠')
ON CONFLICT DO NOTHING;

-- Dados da loja inicial
INSERT INTO dynamic_store_data (id, name, subtitle, description, rating, review_count, features, gradient, logo) VALUES
('casa-construcao', 'Casa & Construção', 'Loja Oficial', 'Materiais de construção com os melhores preços da região', 4.8, '2.1k', '["Entrega rápida", "Até 18h"]'::jsonb, 'bg-gradient-to-r from-blue-600 to-blue-800', 'C')
ON CONFLICT DO NOTHING;

-- Alguns produtos iniciais (exemplo)
INSERT INTO dynamic_products (name, price, image_url, type, category, rating, is_offer, product_group, order_index) VALUES
('Cimento CP-II 50kg', 'R$ 24,90', '/src/assets/produto-cimento.jpg', 'produto', 'Material', 4.8, true, 'home', 1),
('Tijolo Baiano 6 Furos', 'R$ 0,85', '/src/assets/produto-tijolo.jpg', 'produto', 'Material', 4.6, false, 'home', 2),
('Tinta Acrílica 18L', 'R$ 89,90', '/src/assets/produto-tinta.jpg', 'produto', 'Material', 4.9, true, 'home', 3),
('Argamassa AC-I 20kg', 'R$ 18,50', '/src/assets/produto-argamassa.jpg', 'produto', 'Material', 4.7, false, 'home', 4)
ON CONFLICT DO NOTHING;

-- Políticas RLS (Row Level Security)
ALTER TABLE dynamic_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_news_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_promotional_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_store_data ENABLE ROW LEVEL SECURITY;

-- Políticas para leitura pública
CREATE POLICY "Allow public read access" ON dynamic_banners FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON dynamic_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON dynamic_products FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON dynamic_news_banners FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON dynamic_promotional_banners FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON dynamic_store_data FOR SELECT USING (true);

-- Políticas para administradores (assumindo que existe uma função is_admin())
CREATE POLICY "Allow admin full access" ON dynamic_banners FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin full access" ON dynamic_categories FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin full access" ON dynamic_products FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin full access" ON dynamic_news_banners FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin full access" ON dynamic_promotional_banners FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin full access" ON dynamic_store_data FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dynamic_banners_updated_at BEFORE UPDATE ON dynamic_banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dynamic_categories_updated_at BEFORE UPDATE ON dynamic_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dynamic_products_updated_at BEFORE UPDATE ON dynamic_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dynamic_news_banners_updated_at BEFORE UPDATE ON dynamic_news_banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dynamic_promotional_banners_updated_at BEFORE UPDATE ON dynamic_promotional_banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dynamic_store_data_updated_at BEFORE UPDATE ON dynamic_store_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();