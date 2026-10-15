-- Limpar subscriptions antigas (mais de 24 horas) para forçar re-subscription com nova chave VAPID
DELETE FROM push_subscriptions WHERE created_at < now() - interval '24 hours';

-- Também deletar subscriptions com endpoints FCM antigos que podem estar expirados
DELETE FROM push_subscriptions WHERE endpoint LIKE '%fcm.googleapis.com/fcm/send/%';