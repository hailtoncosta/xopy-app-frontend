-- Tabela para likes de clips
CREATE TABLE IF NOT EXISTS public.clip_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clip_id UUID NOT NULL REFERENCES public.dynamic_clips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(clip_id, user_id)
);

-- Tabela para comentários de clips
CREATE TABLE IF NOT EXISTS public.clip_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clip_id UUID NOT NULL REFERENCES public.dynamic_clips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_clip_likes_clip_id ON public.clip_likes(clip_id);
CREATE INDEX idx_clip_likes_user_id ON public.clip_likes(user_id);
CREATE INDEX idx_clip_comments_clip_id ON public.clip_comments(clip_id);
CREATE INDEX idx_clip_comments_user_id ON public.clip_comments(user_id);

-- RLS Policies para clip_likes
ALTER TABLE public.clip_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes são públicos para leitura"
  ON public.clip_likes FOR SELECT
  USING (true);

CREATE POLICY "Usuários autenticados podem dar like"
  ON public.clip_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem remover seus próprios likes"
  ON public.clip_likes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies para clip_comments
ALTER TABLE public.clip_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comentários são públicos para leitura"
  ON public.clip_comments FOR SELECT
  USING (true);

CREATE POLICY "Usuários autenticados podem comentar"
  ON public.clip_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios comentários"
  ON public.clip_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios comentários"
  ON public.clip_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar contadores na tabela dynamic_clips
CREATE OR REPLACE FUNCTION update_clip_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.dynamic_clips 
    SET likes = likes + 1 
    WHERE id = NEW.clip_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.dynamic_clips 
    SET likes = GREATEST(0, likes - 1)
    WHERE id = OLD.clip_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_clip_likes_count
  AFTER INSERT OR DELETE ON public.clip_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_clip_likes_count();

CREATE OR REPLACE FUNCTION update_clip_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.dynamic_clips 
    SET comments = comments + 1 
    WHERE id = NEW.clip_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.dynamic_clips 
    SET comments = GREATEST(0, comments - 1)
    WHERE id = OLD.clip_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_clip_comments_count
  AFTER INSERT OR DELETE ON public.clip_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_clip_comments_count();

-- Trigger para updated_at em comentários
CREATE TRIGGER update_clip_comments_updated_at
  BEFORE UPDATE ON public.clip_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();