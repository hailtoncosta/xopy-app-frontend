-- Migration: Create seller_stores table and related infrastructure
-- Description: Tabela para armazenar configurações de loja dos vendedores

-- Criar tabela seller_stores
CREATE TABLE IF NOT EXISTS seller_stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Comentários na tabela
COMMENT ON TABLE seller_stores IS 'Armazena configurações de loja dos vendedores';
COMMENT ON COLUMN seller_stores.user_id IS 'ID do usuário vendedor (único por vendedor)';
COMMENT ON COLUMN seller_stores.business_name IS 'Nome da empresa/loja';
COMMENT ON COLUMN seller_stores.description IS 'Descrição da loja (máx 500 caracteres)';
COMMENT ON COLUMN seller_stores.logo_url IS 'URL do logo da loja no Supabase Storage';
COMMENT ON COLUMN seller_stores.state IS 'Sigla do estado (ex: SP, RJ)';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_seller_stores_user_id ON seller_stores(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_stores_created_at ON seller_stores(created_at DESC);

-- Adicionar índices em products se não existirem
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_user_status ON products(user_id, status);

-- Habilitar RLS
ALTER TABLE seller_stores ENABLE ROW LEVEL SECURITY;

-- Policy: Vendedores podem ver sua própria loja
CREATE POLICY "Vendedores podem ver sua própria loja"
  ON seller_stores FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Vendedores podem criar sua loja
CREATE POLICY "Vendedores podem criar sua loja"
  ON seller_stores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Vendedores podem atualizar sua loja
CREATE POLICY "Vendedores podem atualizar sua loja"
  ON seller_stores FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Todos podem ver lojas públicas (para perfil público)
CREATE POLICY "Todos podem ver lojas públicas"
  ON seller_stores FOR SELECT
  USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_seller_stores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_seller_stores_updated_at ON seller_stores;
CREATE TRIGGER trigger_update_seller_stores_updated_at
  BEFORE UPDATE ON seller_stores
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_stores_updated_at();

-- Verificar se bucket de storage existe, se não, criar
-- Nota: Isso precisa ser feito via Supabase Dashboard ou API
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('store-logos', 'store-logos', true)
-- ON CONFLICT (id) DO NOTHING;

-- Comentário sobre storage
COMMENT ON TABLE seller_stores IS 'Tabela de lojas dos vendedores. Logos devem ser armazenados no bucket "product-images" com prefixo "store-logos/"';
