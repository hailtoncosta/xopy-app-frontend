-- Adicionar campos de pagamento e locação na tabela rental_inquiries
ALTER TABLE public.rental_inquiries
ADD COLUMN whatsapp_contact TEXT DEFAULT '(11) 98765-4321',
ADD COLUMN rental_item_id UUID REFERENCES public.dynamic_rentals(id),
ADD COLUMN rental_item_name TEXT,
ADD COLUMN rental_days INTEGER DEFAULT 1,
ADD COLUMN daily_rate NUMERIC(10,2),
ADD COLUMN total_amount NUMERIC(10,2),
ADD COLUMN deposit_amount NUMERIC(10,2),
ADD COLUMN payment_method TEXT CHECK (payment_method IN ('pix', 'cartao', 'pendente')),
ADD COLUMN payment_status TEXT DEFAULT 'pendente' CHECK (payment_status IN ('pendente', 'pago', 'cancelado'));

-- Criar índice para melhor performance
CREATE INDEX idx_rental_inquiries_payment_status ON public.rental_inquiries(payment_status);
CREATE INDEX idx_rental_inquiries_rental_item_id ON public.rental_inquiries(rental_item_id);