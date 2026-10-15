INSERT INTO public.user_roles (user_id, role)
VALUES ('77990fae-5a0f-4645-a535-c79668202da0', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;