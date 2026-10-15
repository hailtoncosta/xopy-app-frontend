-- Migration: Create user_addresses table
-- Description: Tabela para armazenar endereços de entrega dos usuários

-- Criar tabela user_addresses
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL DEFAULT 'other', -- 'home', 'work', 'other'
  label VARCHAR(100) NOT NULL,
  street VARCHAR(255) NOT NULL,
  number VARCHAR(20) NOT NULL,
  complement VARCHAR(100),
  neighborhood VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(9) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários na tabela
COMMENT ON TABLE user_addresses IS 'Armazena endereços de entrega dos usuários';
COMMENT ON COLUMN user_addresses.type IS 'Tipo do endereço: home, work, other';
COMMENT ON COLUMN user_addresses.label IS 'Nome/label do endereço (ex: Casa, Trabalho)';
COMMENT ON COLUMN user_addresses.zip_code IS 'CEP no formato 00000-000';
COMMENT ON COLUMN user_addresses.is_default IS 'Indica se é o endereço padrão do usuário';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_is_default ON user_addresses(user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_user_addresses_created_at ON user_addresses(created_at DESC);

-- Habilitar RLS
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver seus próprios endereços
CREATE POLICY "Usuários podem ver seus próprios endereços"
  ON user_addresses FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Usuários podem criar seus próprios endereços
CREATE POLICY "Usuários podem criar seus próprios endereços"
  ON user_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar seus próprios endereços
CREATE POLICY "Usuários podem atualizar seus próprios endereços"
  ON user_addresses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem deletar seus próprios endereços
CREATE POLICY "Usuários podem deletar seus próprios endereços"
  ON user_addresses FOR DELETE
  USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_user_addresses_updated_at ON user_addresses;
CREATE TRIGGER trigger_update_user_addresses_updated_at
  BEFORE UPDATE ON user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_user_addresses_updated_at();

-- Função para garantir apenas um endereço padrão por usuário
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o novo endereço está sendo marcado como padrão
  IF NEW.is_default = TRUE THEN
    -- Desmarcar todos os outros endereços do mesmo usuário
    UPDATE user_addresses 
    SET is_default = FALSE 
    WHERE user_id = NEW.user_id 
    AND id != NEW.id;
  END IF;
  
  -- Se é o primeiro endereço do usuário, marcar como padrão
  IF NOT EXISTS (
    SELECT 1 FROM user_addresses 
    WHERE user_id = NEW.user_id 
    AND id != NEW.id
  ) THEN
    NEW.is_default = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para garantir apenas um endereço padrão
DROP TRIGGER IF EXISTS trigger_ensure_single_default_address ON user_addresses;
CREATE TRIGGER trigger_ensure_single_default_address
  BEFORE INSERT OR UPDATE ON user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_address();

-- Função para definir novo padrão ao deletar endereço padrão
CREATE OR REPLACE FUNCTION set_new_default_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o endereço deletado era o padrão
  IF OLD.is_default = TRUE THEN
    -- Definir o mais recente como padrão
    UPDATE user_addresses 
    SET is_default = TRUE 
    WHERE user_id = OLD.user_id 
    AND id = (
      SELECT id FROM user_addresses 
      WHERE user_id = OLD.user_id 
      ORDER BY created_at DESC 
      LIMIT 1
    );
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger para definir novo padrão ao deletar
DROP TRIGGER IF EXISTS trigger_set_new_default_on_delete ON user_addresses;
CREATE TRIGGER trigger_set_new_default_on_delete
  AFTER DELETE ON user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION set_new_default_on_delete();
