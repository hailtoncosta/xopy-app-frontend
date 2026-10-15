-- Criar bucket para uploads de imagens
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir uploads autenticados
CREATE POLICY "Authenticated users can upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'uploads' AND
  auth.role() = 'authenticated'
);

-- Política para permitir leitura pública
CREATE POLICY "Public can view uploaded files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'uploads'
);

-- Política para permitir que usuários autenticados deletem seus próprios arquivos
CREATE POLICY "Authenticated users can delete their files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'uploads' AND
  auth.role() = 'authenticated'
);

-- Política para permitir que usuários autenticados atualizem seus próprios arquivos
CREATE POLICY "Authenticated users can update their files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'uploads' AND
  auth.role() = 'authenticated'
);