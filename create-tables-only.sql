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
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para banners promocionais dinâmicos
CREATE TABLE IF NOT EXISTS dynamic_promotional_banners (
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

-- Tabela para dados da loja dinâmicos
CREATE TABLE IF NOT EXISTS dynamic_store_data (
  id SERIAL PRIMARY KEY,
  store_name VARCHAR(255) NOT NULL,
  store_description TEXT,
  store_logo TEXT,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para provedores de serviços
CREATE TABLE IF NOT EXISTS service_providers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE dynamic_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_news_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_promotional_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_store_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para leitura
CREATE POLICY "Allow public read access" ON dynamic_banners FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON dynamic_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON dynamic_products FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON dynamic_news_banners FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON dynamic_promotional_banners FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON dynamic_store_data FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON service_providers FOR SELECT USING (true);

-- Políticas de acesso admin para todas as operações
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