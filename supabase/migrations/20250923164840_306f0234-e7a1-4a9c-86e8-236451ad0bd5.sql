-- Habilitar RLS nas tabelas dinâmicas que estão faltando
ALTER TABLE dynamic_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_category_chips ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_news_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_promotional_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_store_data ENABLE ROW LEVEL SECURITY;

-- Criar função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se o usuário logado é admin
    RETURN auth.uid() IN (
        SELECT id FROM auth.users WHERE email IN (
            'admin@pedreiro.com',
            'admin@example.com'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Atualizar políticas das tabelas dinâmicas para usar a função is_admin
DROP POLICY IF EXISTS "Allow admin full access" ON public.dynamic_banners;
DROP POLICY IF EXISTS "Allow public read access" ON public.dynamic_banners;

CREATE POLICY "Admins podem gerenciar banners" 
ON public.dynamic_banners 
FOR ALL 
USING (public.is_admin());

CREATE POLICY "Banners são públicos para leitura" 
ON public.dynamic_banners 
FOR SELECT 
USING (is_active = true);

-- Aplicar o mesmo padrão para outras tabelas dinâmicas
DROP POLICY IF EXISTS "Allow admin full access" ON public.dynamic_categories;
DROP POLICY IF EXISTS "Allow public read access" ON public.dynamic_categories;

CREATE POLICY "Admins podem gerenciar categorias" 
ON public.dynamic_categories 
FOR ALL 
USING (public.is_admin());

CREATE POLICY "Categorias são públicas para leitura" 
ON public.dynamic_categories 
FOR SELECT 
USING (is_active = true);

-- Continuar para outras tabelas
DROP POLICY IF EXISTS "Allow admin full access" ON public.dynamic_category_chips;
DROP POLICY IF EXISTS "Allow public read access" ON public.dynamic_category_chips;

CREATE POLICY "Admins podem gerenciar chips de categorias" 
ON public.dynamic_category_chips 
FOR ALL 
USING (public.is_admin());

CREATE POLICY "Chips são públicos para leitura" 
ON public.dynamic_category_chips 
FOR SELECT 
USING (is_active = true);

-- Produtos dinâmicos
DROP POLICY IF EXISTS "Allow admin full access" ON public.dynamic_products;
DROP POLICY IF EXISTS "Allow public read access" ON public.dynamic_products;

CREATE POLICY "Admins podem gerenciar produtos dinâmicos" 
ON public.dynamic_products 
FOR ALL 
USING (public.is_admin());

CREATE POLICY "Produtos dinâmicos são públicos para leitura" 
ON public.dynamic_products 
FOR SELECT 
USING (is_active = true);