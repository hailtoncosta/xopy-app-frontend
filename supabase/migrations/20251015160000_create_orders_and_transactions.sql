-- Criar tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamentos
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Valores
  total_amount DECIMAL(10,2) NOT NULL,
  marketplace_fee DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  seller_amount DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  
  -- Status e Método
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Aguardando pagamento
    'processing',   -- Processando
    'paid',         -- Pago
    'approved',     -- Aprovado
    'rejected',     -- Rejeitado
    'cancelled',    -- Cancelado
    'refunded'      -- Estornado
  )),
  payment_method VARCHAR(50) CHECK (payment_method IN (
    'pix',
    'credit_card',
    'debit_card',
    'boleto'
  )),
  
  -- Dados de Entrega
  delivery_address JSONB,
  delivery_type VARCHAR(50),
  
  -- Metadados
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Índices para orders
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Criar tabela de transações do Mercado Pago
CREATE TABLE IF NOT EXISTS mercado_pago_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamento
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Dados do Mercado Pago
  mp_payment_id TEXT UNIQUE NOT NULL,
  mp_status VARCHAR(50) NOT NULL,
  mp_status_detail TEXT,
  
  -- Valores
  transaction_amount DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2),
  
  -- Dados de Pagamento
  payment_method_id VARCHAR(50),
  payment_type_id VARCHAR(50),
  
  -- PIX
  qr_code TEXT,
  qr_code_base64 TEXT,
  
  -- Cartão
  card_last_four_digits VARCHAR(4),
  card_brand VARCHAR(50),
  installments INTEGER DEFAULT 1,
  
  -- Metadados
  mp_response JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE
);

-- Índices para mercado_pago_transactions
CREATE INDEX IF NOT EXISTS idx_mp_transactions_order ON mercado_pago_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_mp_transactions_mp_payment ON mercado_pago_transactions(mp_payment_id);
CREATE INDEX IF NOT EXISTS idx_mp_transactions_status ON mercado_pago_transactions(mp_status);

-- Habilitar RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercado_pago_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas para orders
CREATE POLICY "Compradores veem seus pedidos"
ON orders FOR SELECT
USING (auth.uid() = buyer_id);

CREATE POLICY "Vendedores veem seus pedidos"
ON orders FOR SELECT
USING (auth.uid() = seller_id);

CREATE POLICY "Usuários criam pedidos como compradores"
ON orders FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Admins veem todos os pedidos"
ON orders FOR ALL
USING (is_admin());

-- Políticas para mercado_pago_transactions
CREATE POLICY "Usuários veem transações de seus pedidos"
ON mercado_pago_transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = mercado_pago_transactions.order_id
    AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
  )
);

CREATE POLICY "Admins veem todas as transações"
ON mercado_pago_transactions FOR ALL
USING (is_admin());

-- Triggers para updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mp_transactions_updated_at
  BEFORE UPDATE ON mercado_pago_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
