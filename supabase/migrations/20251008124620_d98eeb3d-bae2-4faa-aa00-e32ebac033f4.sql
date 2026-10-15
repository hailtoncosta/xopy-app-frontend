-- Tabela para armazenar consultas de locação personalizada
CREATE TABLE public.rental_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rental_inquiries ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem criar suas próprias consultas"
ON public.rental_inquiries
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Usuários podem ver suas próprias consultas"
ON public.rental_inquiries
FOR SELECT
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins podem atualizar consultas"
ON public.rental_inquiries
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins podem gerenciar todas as consultas"
ON public.rental_inquiries
FOR ALL
USING (is_admin());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_rental_inquiries_updated_at
BEFORE UPDATE ON public.rental_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar índices para melhor performance
CREATE INDEX idx_rental_inquiries_user_id ON public.rental_inquiries(user_id);
CREATE INDEX idx_rental_inquiries_status ON public.rental_inquiries(status);
CREATE INDEX idx_rental_inquiries_created_at ON public.rental_inquiries(created_at DESC);