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

-- Função para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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