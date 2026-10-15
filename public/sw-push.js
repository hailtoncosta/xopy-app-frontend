// Push notification handlers for Xopy PWA
// Version 6 - Improved background push for TWA/Android
const SW_PUSH_VERSION = 'v6-2026-01-14';

// Forçar exibição da notificação mesmo em background
self.addEventListener('push', (event) => {
  console.log('🔔 [SW-PUSH] Push event received at', new Date().toISOString());

  let data = {
    title: '💬 Nova mensagem - Xopy',
    body: 'Você recebeu uma nova mensagem',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'xopy-msg-' + Date.now(),
    data: { url: '/conversas' }
  };

  try {
    if (event.data) {
      const rawData = event.data.text();
      console.log('📦 [SW-PUSH] Raw data length:', rawData.length);
      try {
        const parsed = JSON.parse(rawData);
        data = { ...data, ...parsed };
        console.log('✅ [SW-PUSH] Parsed title:', parsed.title || 'default');
      } catch (e) {
        console.warn('⚠️ [SW-PUSH] JSON parse failed, using raw as body');
        data.body = rawData;
      }
    }
  } catch (err) {
    console.error('❌ [SW-PUSH] Error processing push data:', err);
  }

  // Opções de notificação otimizadas para Android/TWA
  const options = {
    body: data.body || 'Você recebeu uma nova mensagem',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-72x72.png',
    tag: data.tag || ('xopy-msg-' + Date.now()),
    data: data.data || { url: '/conversas' },
    requireInteraction: false,
    vibrate: [200, 100, 200],
    renotify: true, // Sempre vibrar/alertar mesmo com mesma tag
    silent: false,
    // Android: Forçar visibilidade
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'dismiss', title: 'Dispensar' }
    ]
  };

  const title = data.title || '💬 Nova mensagem - Xopy';
  console.log('🔔 [SW-PUSH] Showing notification:', title);

  // Usar waitUntil para garantir que a notificação seja exibida
  event.waitUntil(
    (async () => {
      try {
        // Verificar se há clientes (app aberto)
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        console.log('👥 [SW-PUSH] Active clients:', clients.length);

        // Sempre mostrar notificação (mesmo com app aberto para debug)
        await self.registration.showNotification(title, options);
        console.log('✅ [SW-PUSH] Notification displayed successfully');
      } catch (err) {
        console.error('❌ [SW-PUSH] showNotification failed:', err);
      }
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ [SW-PUSH] Click action:', event.action);
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification?.data?.url || '/conversas';
  console.log('🔗 [SW-PUSH] Navigate to:', targetUrl);

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        const url = new URL(client.url);
        if (url.pathname === targetUrl || url.pathname === '/') {
          return client.focus().then(() => {
            if (url.pathname !== targetUrl) return client.navigate(targetUrl);
          });
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('🔕 [SW-PUSH] Notification closed');
});

self.addEventListener('install', (event) => {
  console.log('🔧 [SW-PUSH] Installing', SW_PUSH_VERSION);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ [SW-PUSH] Activated', SW_PUSH_VERSION);
  event.waitUntil(self.clients.claim());
});

console.log('🔔 [SW-PUSH] Loaded', SW_PUSH_VERSION);
