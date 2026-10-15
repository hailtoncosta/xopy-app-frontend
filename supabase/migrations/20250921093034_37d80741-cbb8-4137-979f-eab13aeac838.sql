-- Adicionar status de aprovação para produtos submetidos por usuários
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Adicionar data de aprovação/rejeição
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP WITH TIME ZONE;

-- Adicionar campo para comentários do admin
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS admin_comments TEXT;

-- Atualizar produtos existentes para 'approved' se estão ativos
UPDATE public.products 
SET approval_status = 'approved', approval_date = NOW() 
WHERE status = 'active';

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_approval_status ON public.products (approval_status);
CREATE INDEX IF NOT EXISTS idx_products_user_id_status ON public.products (user_id, approval_status);