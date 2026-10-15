-- Corrigir políticas RLS para dynamic_news_banners
DROP POLICY IF EXISTS "Allow admin full access" ON public.dynamic_news_banners;
DROP POLICY IF EXISTS "Allow public read access" ON public.dynamic_news_banners;

CREATE POLICY "Admins podem gerenciar news banners" 
ON public.dynamic_news_banners 
FOR ALL 
USING (is_admin());

CREATE POLICY "News banners são públicos para leitura" 
ON public.dynamic_news_banners 
FOR SELECT 
USING (is_active = true);

-- Corrigir políticas RLS para dynamic_promotional_banners
DROP POLICY IF EXISTS "Allow admin full access" ON public.dynamic_promotional_banners;
DROP POLICY IF EXISTS "Allow public read access" ON public.dynamic_promotional_banners;

CREATE POLICY "Admins podem gerenciar promotional banners" 
ON public.dynamic_promotional_banners 
FOR ALL 
USING (is_admin());

CREATE POLICY "Promotional banners são públicos para leitura" 
ON public.dynamic_promotional_banners 
FOR SELECT 
USING (is_active = true);