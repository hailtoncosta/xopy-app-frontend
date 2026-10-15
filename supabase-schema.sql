-- Criação das tabelas para o sistema de vendas
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  type TEXT NOT NULL CHECK (type IN ('customer', 'service_provider', 'store_owner', 'guest')),
  avatar TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para a tabela users
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(type);

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  seller_type VARCHAR(20) NOT NULL CHECK (seller_type IN ('individual', 'business')),
  product_type VARCHAR(20) NOT NULL CHECK (product_type IN ('new', 'leftover')),
  manufacturing_date DATE,
  seller_info JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de imagens dos produtos
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_path TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at na tabela products
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para users
CREATE POLICY "Usuários podem ver seu próprio perfil" ON users
    FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON users
    FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Usuários podem inserir seu próprio perfil" ON users
    FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Política para produtos: usuários podem ver todos os produtos ativos
CREATE POLICY "Produtos públicos são visíveis para todos" ON products
    FOR SELECT USING (status = 'active');

-- Política para produtos: usuários podem inserir seus próprios produtos
CREATE POLICY "Usuários podem inserir seus próprios produtos" ON products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para produtos: usuários podem atualizar seus próprios produtos
CREATE POLICY "Usuários podem atualizar seus próprios produtos" ON products
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para produtos: usuários podem deletar seus próprios produtos
CREATE POLICY "Usuários podem deletar seus próprios produtos" ON products
    FOR DELETE USING (auth.uid() = user_id);

-- Política para imagens: usuários podem ver imagens de produtos ativos
CREATE POLICY "Imagens de produtos são visíveis para todos" ON product_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = product_images.product_id 
            AND products.status = 'active'
        )
    );

-- Política para imagens: usuários podem inserir imagens em seus próprios produtos
CREATE POLICY "Usuários podem inserir imagens em seus produtos" ON product_images
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = product_images.product_id 
            AND products.user_id = auth.uid()
        )
    );

-- Política para imagens: usuários podem atualizar imagens de seus próprios produtos
CREATE POLICY "Usuários podem atualizar imagens de seus produtos" ON product_images
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = product_images.product_id 
            AND products.user_id = auth.uid()
        )
    );

-- Política para imagens: usuários podem deletar imagens de seus próprios produtos
CREATE POLICY "Usuários podem deletar imagens de seus produtos" ON product_images
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = product_images.product_id 
            AND products.user_id = auth.uid()
        )
    );

-- Criar tabela de prestadores de serviços
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,
  neighborhood TEXT,
  city TEXT,
  experience TEXT NOT NULL,
  daily_rate DECIMAL(10,2) NOT NULL,
  specialties TEXT,
  description TEXT,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para a tabela service_providers
CREATE INDEX IF NOT EXISTS idx_service_providers_user_id ON service_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_category ON service_providers(category);
CREATE INDEX IF NOT EXISTS idx_service_providers_status ON service_providers(status);
CREATE INDEX IF NOT EXISTS idx_service_providers_created_at ON service_providers(created_at DESC);

-- Trigger para atualizar updated_at na tabela service_providers
CREATE TRIGGER update_service_providers_updated_at
    BEFORE UPDATE ON service_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança para service_providers
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

-- Política para prestadores: usuários podem ver prestadores aprovados
CREATE POLICY "Prestadores aprovados são visíveis para todos" ON service_providers
    FOR SELECT USING (status = 'approved');

-- Política para prestadores: usuários podem inserir seu próprio cadastro
CREATE POLICY "Usuários podem inserir seu próprio cadastro de prestador" ON service_providers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para prestadores: usuários podem atualizar seu próprio cadastro
CREATE POLICY "Usuários podem atualizar seu próprio cadastro de prestador" ON service_providers
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para prestadores: usuários podem ver seu próprio cadastro
CREATE POLICY "Usuários podem ver seu próprio cadastro de prestador" ON service_providers
    FOR SELECT USING (auth.uid() = user_id);

-- Criar bucket para armazenamento de imagens (execute no Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Política de storage para permitir upload de imagens
-- CREATE POLICY "Usuários podem fazer upload de imagens" ON storage.objects
--     FOR INSERT WITH CHECK (
--         bucket_id = 'product-images' AND
--         auth.role() = 'authenticated'
--     );

-- Política de storage para permitir visualização de imagens
-- CREATE POLICY "Imagens são públicas" ON storage.objects
--     FOR SELECT USING (bucket_id = 'product-images');

-- Política de storage para permitir atualização de imagens próprias
-- CREATE POLICY "Usuários podem atualizar suas imagens" ON storage.objects
--     FOR UPDATE USING (
--         bucket_id = 'product-images' AND
--         auth.uid()::text = (storage.foldername(name))[1]
--     );

-- Política de storage para permitir deleção de imagens próprias
-- CREATE POLICY "Usuários podem deletar suas imagens" ON storage.objects
--     FOR DELETE USING (
--         bucket_id = 'product-images' AND
--         auth.uid()::text = (storage.foldername(name))[1]
--     );