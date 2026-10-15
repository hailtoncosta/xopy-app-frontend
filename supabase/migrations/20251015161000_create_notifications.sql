-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamento
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo e Conteúdo
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'payment_received',
    'order_created',
    'payment_approved',
    'payment_rejected',
    'order_cancelled',
    'order_refunded',
    'product_sold',
    'product_purchased'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Dados Extras
  data JSONB,
  
  -- Link de Ação
  action_url TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Usuários veem suas notificações"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários atualizam suas notificações"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins veem todas as notificações"
ON notifications FOR ALL
USING (is_admin());
