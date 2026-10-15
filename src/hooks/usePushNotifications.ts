import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import useAuth from './useAuth';

// Helper to convert base64 public key to Uint8Array for pushManager.subscribe
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export interface PushSubscriptionRecord {
  id?: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  platform?: string;
}

function detectPlatform() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Windows/i.test(ua)) return 'windows';
  if (/Macintosh/i.test(ua)) return 'mac';
  return 'web';
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const platform = useMemo(() => detectPlatform(), []);

  const subscribeUser = async (userId: string) => {
    try {
      console.log('🔔 Push: Iniciando subscription para usuário:', userId);
      setError(null);
      setIsSubscribed(false);

      // Only attempt on secure contexts
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        const msg = 'Push requer HTTPS (ou localhost).';
        console.warn('🔔 Push:', msg);
        setError(msg);
        return;
      }

      // Check for service worker and push support
      if (!('serviceWorker' in navigator)) {
        const msg = 'Service Worker não suportado neste ambiente (provável WebView).';
        console.warn('🔔 Push:', msg);
        setError(msg);
        return;
      }
      if (!('PushManager' in window)) {
        const msg = 'PushManager não suportado neste ambiente (provável WebView).';
        console.warn('🔔 Push:', msg);
        setError(msg);
        return;
      }
      if (typeof Notification === 'undefined') {
        const msg = 'Notification API não disponível.';
        console.warn('🔔 Push:', msg);
        setError(msg);
        return;
      }

      // Buscar VAPID public key do backend (não é segredo, mas evita hardcode)
      const { data: keyResp, error: keyErr } = await supabase.functions.invoke('vapid-public-key');
      if (keyErr || !keyResp?.publicKey) {
        console.error('🔔 Push: Falha ao obter VAPID public key:', keyErr);
        setError(keyErr?.message || 'Falha ao obter chave VAPID');
        return;
      }

      const publicKey = String(keyResp.publicKey);

      // Usar o Service Worker principal do PWA (gerado pelo VitePWA) para evitar conflito de escopo.
      // Ele já importa /sw-push.js via Workbox (vite.config.ts -> workbox.importScripts).
      const registration = await navigator.serviceWorker.ready;
      console.log('🔔 Push: Service worker pronto no escopo:', registration.scope);

      // Garantir que exista um SW ativo
      if (!registration.active) {
        console.warn('🔔 Push: Nenhum service worker ativo ainda; aguardando ativação...');
        await new Promise<void>((resolve) => {
          const sw = registration.installing || registration.waiting;
          if (!sw) return resolve();
          sw.addEventListener('statechange', () => {
            if (sw.state === 'activated') resolve();
          });
          if (sw.state === 'activated') resolve();
        });
      }

      // 1) Verificar subscription existente
      let subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        console.log('🔔 Push: Já existe subscription ativa, salvando no banco...');
        const saved = await saveSubscription(subscription, userId);
        setIsSubscribed(saved);
        if (!saved) {
          console.warn('🔔 Push: Falha ao salvar subscription existente no banco');
        }
        return;
      }

      // 2) Se não existir, criar uma nova
      const applicationServerKey = urlBase64ToUint8Array(publicKey);

      console.log('🔔 Push: Criando nova subscription...');
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
      console.log('🔔 Push: Subscription criada com sucesso:', subscription.endpoint.substring(0, 60) + '...');

      const saved = await saveSubscription(subscription, userId);
      setIsSubscribed(saved);
      if (!saved) {
        console.warn('🔔 Push: Falha ao salvar nova subscription no banco');
      }
    } catch (e: any) {
      console.error('🔔 Push: Erro ao criar subscription:', e);
      setError(e?.message || 'Erro desconhecido');
    }
  };

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return;

    try {
      console.log('🔔 Push: Solicitando permissão...');
      const newPermission = await Notification.requestPermission();
      console.log('🔔 Push: Nova permissão:', newPermission);
      setPermission(newPermission);

      if (newPermission === 'granted' && user?.id) {
        await subscribeUser(user.id);
      }
    } catch (e: any) {
      console.error('🔔 Push: Erro ao solicitar permissão:', e);
      setError(e?.message || 'Erro desconhecido');
    }
  };

  useEffect(() => {
    const setup = async () => {
      try {
        setError(null);
        setIsSubscribed(false);

        if (!user || !user.id) {
          console.log('🔔 Push: Aguardando login do usuário');
          return;
        }

        console.log('🔔 Push: Iniciando configuração para usuário:', user.id);

        if (typeof Notification === 'undefined') {
          const msg = '🔔 Push: Notification API não disponível (provável WebView).';
          console.warn(msg);
          setError(msg);
          return;
        }

        // Only attempt on secure contexts
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          const msg = '🔔 Push: Requer HTTPS (ou localhost).';
          console.warn(msg);
          setError(msg);
          return;
        }

        // Check for service worker and push support
        if (!('serviceWorker' in navigator)) {
          const msg = '🔔 Push: Service Worker não suportado (provável WebView).';
          console.warn(msg);
          setError(msg);
          return;
        }

        if (!('PushManager' in window)) {
          const msg = '🔔 Push: PushManager não suportado (provável WebView).';
          console.warn(msg);
          setError(msg);
          return;
        }

        // Atualizar permissão
        const currentPerm = Notification.permission;
        console.log('🔔 Push: Permissão atual:', currentPerm);
        setPermission(currentPerm);

        // Se já concedeu permissão, garantir subscription
        if (currentPerm === 'granted') {
          await subscribeUser(user.id);
        }
      } catch (e: any) {
        console.error('🔔 Push: Erro na configuração:', e);
        setError(e?.message || 'Erro desconhecido');
      }
    };

    setup();
  }, [user?.id]);

  async function saveSubscription(subscription: PushSubscription, userId: string): Promise<boolean> {
    try {
      // Verificar sessão do Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        const msg = 'Sessão não encontrada. Faça login novamente.';
        console.error('🔔 Push:', msg, sessionError);
        setError(msg);
        return false;
      }

      const authUserId = sessionData.session.user.id;
      console.log('🔔 Push: Auth UID:', authUserId);
      console.log('🔔 Push: User ID passado:', userId);

      if (authUserId !== userId) {
        const msg = 'User ID não corresponde à sessão autenticada';
        console.error('🔔 Push:', msg);
        setError(msg);
        return false;
      }

      const raw = subscription.toJSON();
      
      console.log('🔔 Push: Preparando para salvar subscription...');
      console.log('🔔 Push: Endpoint:', raw.endpoint?.substring(0, 60) + '...');
      console.log('🔔 Push: Tem p256dh:', !!raw.keys?.p256dh);
      console.log('🔔 Push: Tem auth:', !!raw.keys?.auth);
      console.log('🔔 Push: Platform:', platform);

      if (!raw.endpoint || !raw.keys?.p256dh || !raw.keys?.auth) {
        const msg = 'Subscription inválida: faltam endpoint ou keys';
        console.error('🔔 Push:', msg);
        setError(msg);
        return false;
      }

      const record = {
        user_id: authUserId, // Usar o ID da sessão autenticada
        endpoint: raw.endpoint,
        p256dh: raw.keys.p256dh,
        auth: raw.keys.auth,
        platform,
      };

      // Manter múltiplos dispositivos: remover apenas duplicatas deste endpoint antes de inserir.
      console.log('🔔 Push: Removendo duplicatas do endpoint...');
      const { error: delError } = await supabase
        .from('push_subscriptions' as any)
        .delete()
        .eq('user_id', userId)
        .eq('endpoint', record.endpoint);

      if (delError) {
        console.error('🔔 Push: Erro ao limpar duplicatas:', delError);
        // Continuar mesmo com erro de delete (pode não existir)
      }

      console.log('🔔 Push: Inserindo nova subscription...');
      const { data, error: insError } = await supabase
        .from('push_subscriptions' as any)
        .insert(record)
        .select();

      if (insError) {
        console.error('🔔 Push: Erro ao salvar subscription:', insError);
        setError(insError.message);
        return false;
      }

      console.log('✅ Push: Subscription salva com sucesso!', data);
      return true;
    } catch (e: any) {
      console.error('🔔 Push: Exceção ao salvar subscription:', e);
      setError(e?.message || 'Erro desconhecido ao salvar');
      return false;
    }
  }

  return { permission, isSubscribed, error, requestPermission };
}
