INSERT INTO public.user_roles (user_id, role) 
VALUES ('dc8f2fce-9680-43f0-a73e-233fc7ff16b4', 'admin') 
ON CONFLICT (user_id, role) DO NOTHING;