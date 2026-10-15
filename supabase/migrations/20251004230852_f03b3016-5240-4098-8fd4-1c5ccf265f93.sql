-- Habilitar realtime para dynamic_banners
ALTER TABLE public.dynamic_banners REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dynamic_banners;

-- Habilitar realtime para dynamic_clips
ALTER TABLE public.dynamic_clips REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dynamic_clips;