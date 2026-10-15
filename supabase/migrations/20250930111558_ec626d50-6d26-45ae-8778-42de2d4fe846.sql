-- Criar tabela para clips dinâmicos
CREATE TABLE IF NOT EXISTS public.dynamic_clips (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  author_name VARCHAR(100),
  author_avatar TEXT,
  duration VARCHAR(10),
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_dynamic_clips_active ON public.dynamic_clips(is_active, order_index);

-- Criar bucket para vídeos de clips (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'clips-videos',
  'clips-videos',
  true,
  52428800, -- 50MB em bytes
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies para dynamic_clips
ALTER TABLE public.dynamic_clips ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública de clips ativos
CREATE POLICY "Clips ativos são públicos para leitura"
ON public.dynamic_clips
FOR SELECT
USING (is_active = true);

-- Apenas admins podem gerenciar clips
CREATE POLICY "Admins podem gerenciar clips"
ON public.dynamic_clips
FOR ALL
USING (is_admin());

-- Políticas de storage para clips-videos
CREATE POLICY "Usuários autenticados podem fazer upload de vídeos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'clips-videos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Vídeos são públicos para visualização"
ON storage.objects
FOR SELECT
USING (bucket_id = 'clips-videos');

CREATE POLICY "Admins podem deletar vídeos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'clips-videos' AND
  is_admin()
);

CREATE POLICY "Admins podem atualizar vídeos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'clips-videos' AND
  is_admin()
);