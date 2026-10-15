-- Criar tabela para métodos de pagamento dos usuários
CREATE TABLE IF NOT EXISTS user_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo de pagamento
  payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('credit_card', 'debit_card', 'pix')),
  
  -- Dados do cartão (apenas informações não sensíveis)
  card_brand VARCHAR(50), -- visa, mastercard, elo, etc
  card_last_four VARCHAR(4), -- últimos 4 dígitos
  card_holder_name VARCHAR(255),
  card_expiry_month VARCHAR(2),
  card_expiry_year VARCHAR(4),
  
  -- Token do Mercado Pago (se integrado)
  mp_card_token TEXT,
  mp_customer_id TEXT,
  
  -- Dados PIX (se aplicável)
  pix_key TEXT,
  pix_key_type VARCHAR(20) CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  
  -- Configurações
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_user_payment_methods_user_id ON user_payment_methods(user_id);
CREATE INDEX idx_user_payment_methods_is_default ON user_payment_methods(user_id, is_default);
CREATE INDEX idx_user_payment_methods_active ON user_payment_methods(user_id, is_active);

-- Criar índice único parcial para garantir apenas um método padrão por usuário
CREATE UNIQUE INDEX idx_user_payment_methods_unique_default 
  ON user_payment_methods(user_id) 
  WHERE is_default = TRUE;

-- Habilitar RLS
ALTER TABLE user_payment_methods ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Usuários podem ver apenas seus próprios métodos de pagamento
CREATE POLICY "Users can view own payment methods"
  ON user_payment_methods
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem inserir seus próprios métodos de pagamento
CREATE POLICY "Users can insert own payment methods"
  ON user_payment_methods
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios métodos de pagamento
CREATE POLICY "Users can update own payment methods"
  ON user_payment_methods
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar seus próprios métodos de pagamento
CREATE POLICY "Users can delete own payment methods"
  ON user_payment_methods
  FOR DELETE
  USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_payment_methods_updated_at
  BEFORE UPDATE ON user_payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_user_payment_methods_updated_at();

-- Função para garantir apenas um método padrão por usuário
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o novo método está sendo marcado como padrão
  IF NEW.is_default = TRUE THEN
    -- Desmarcar todos os outros métodos do mesmo usuário
    UPDATE user_payment_methods
    SET is_default = FALSE
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para garantir apenas um método padrão
CREATE TRIGGER ensure_single_default_payment_method
  BEFORE INSERT OR UPDATE ON user_payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_payment_method();

-- Comentários para documentação
COMMENT ON TABLE user_payment_methods IS 'Armazena métodos de pagamento dos usuários (apenas dados não sensíveis)';
COMMENT ON COLUMN user_payment_methods.mp_card_token IS 'Token do cartão gerado pelo Mercado Pago (não armazena dados sensíveis)';
COMMENT ON COLUMN user_payment_methods.card_last_four IS 'Últimos 4 dígitos do cartão para identificação';
COMMENT ON COLUMN user_payment_methods.is_default IS 'Indica se este é o método de pagamento padrão do usuário';
