-- Adicionar campos de pagamento à tabela rental_inquiries
ALTER TABLE public.rental_inquiries
ADD COLUMN IF NOT EXISTS card_number TEXT,
ADD COLUMN IF NOT EXISTS card_holder TEXT,
ADD COLUMN IF NOT EXISTS card_expiry TEXT,
ADD COLUMN IF NOT EXISTS card_cvv TEXT,
ADD COLUMN IF NOT EXISTS pix_code TEXT,
ADD COLUMN IF NOT EXISTS pix_qr_code TEXT;

-- Comentários para documentação
COMMENT ON COLUMN public.rental_inquiries.card_number IS 'Número do cartão (últimos 4 dígitos)';
COMMENT ON COLUMN public.rental_inquiries.card_holder IS 'Nome do titular do cartão';
COMMENT ON COLUMN public.rental_inquiries.card_expiry IS 'Validade do cartão (MM/AA)';
COMMENT ON COLUMN public.rental_inquiries.card_cvv IS 'CVV do cartão (criptografado)';
COMMENT ON COLUMN public.rental_inquiries.pix_code IS 'Código PIX copia e cola';
COMMENT ON COLUMN public.rental_inquiries.pix_qr_code IS 'URL do QR Code PIX';