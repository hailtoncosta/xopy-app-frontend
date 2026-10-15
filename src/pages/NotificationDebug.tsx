import React, { useState, useEffect, useCallback } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useAuth from '@/hooks/useAuth';

type SwRegInfo = {
  scope: string;
  scriptURL: string;
  state: string;
};

const NotificationDebug: React.FC = () => {
    const { user } = useAuth();
    const { permission, isSubscribed, requestPermission, error: hookError } = usePushNotifications();
    const [dbSubs, setDbSubs] = useState<any[]>([]);
    const [testResult, setTestResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [forceLoading, setForceLoading] = useState(false);
    const [browserSub, setBrowserSub] = useState<string | null>(null);
    const [sessionInfo, setSessionInfo] = useState<{ uid: string | null; email: string | null }>({ uid: null, email: null });
    const [swRegs, setSwRegs] = useState<SwRegInfo[]>([]);
    const [swController, setSwController] = useState<string | null>(null);

    const diagnostics = (() => {
        const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'n/a';
        const isWebView = /; wv\)|\bwv\b|Version\/\d+\.\d+.*Chrome\/\d+.*Mobile/i.test(ua);
        const isTwa = document.referrer?.startsWith('android-app://') || /Android.*;\sTWA/i.test(ua);
        const displayModeStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches ?? false;

        return {
            userAgent: ua,
            isWebView,
            isTwa,
            displayModeStandalone,
            notificationApi: typeof Notification !== 'undefined',
            serviceWorkerApi: 'serviceWorker' in navigator,
            pushManagerApi: 'PushManager' in window,
            protocol: window.location.protocol,
            origin: window.location.origin,
        };
    })();

    const refreshSwInfo = useCallback(async () => {
      if (!('serviceWorker' in navigator)) return;
      try {
        setSwController(navigator.serviceWorker.controller?.scriptURL || null);

        const regs = await navigator.serviceWorker.getRegistrations();
        const regInfos: SwRegInfo[] = regs.map((r) => ({
          scope: r.scope,
          scriptURL:
            r.active?.scriptURL ||
            r.waiting?.scriptURL ||
            r.installing?.scriptURL ||
            'desconhecido',
          state: r.active?.state || r.waiting?.state || r.installing?.state || 'desconhecido',
        }));
        setSwRegs(regInfos);
      } catch (e) {
        // ignore
      }
    }, []);

    const checkBrowserSubscription = useCallback(async () => {
        if (!('serviceWorker' in navigator)) {
            setBrowserSub('SW não suportado');
            return;
        }
        try {
            const reg = await navigator.serviceWorker.getRegistration('/');
            if (!reg) {
                setBrowserSub('SW não registrado');
                return;
            }
            const sub = await reg.pushManager?.getSubscription();
            if (sub) {
                setBrowserSub(sub.endpoint.substring(0, 50) + '...');
            } else {
                setBrowserSub('Nenhuma subscription no browser');
            }
        } catch (e: any) {
            setBrowserSub('Erro: ' + e.message);
        }
    }, []);

    const checkSessionInfo = useCallback(async () => {
        const { data } = await supabase.auth.getSession();
        setSessionInfo({
            uid: data.session?.user?.id || null,
            email: data.session?.user?.email || null,
        });
    }, []);

    useEffect(() => {
        checkBrowserSubscription();
        checkSessionInfo();
        refreshSwInfo();
        if (user) {
            checkDbSubscriptions();
        }
    }, [user, checkBrowserSubscription, checkSessionInfo, refreshSwInfo]);

    const checkDbSubscriptions = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('push_subscriptions') // @ts-ignore
            .select('*')
            .eq('user_id', user.id);

        if (data) setDbSubs(data);
        if (error) console.error('Error fetching subs:', error);
    };

    const forceResubscribe = async () => {
        if (!user) return;
        setForceLoading(true);
        setTestResult(null);

        try {
            // 1. Deletar subscriptions do banco para este usuário
            console.log('🔄 Forçando re-inscrição: deletando do banco...');
            await supabase
                .from('push_subscriptions')
                .delete()
                .eq('user_id', user.id);

            // 2. Cancelar subscription do browser
            if ('serviceWorker' in navigator) {
                const reg = await navigator.serviceWorker.getRegistration('/');
                if (reg) {
                    const sub = await reg.pushManager?.getSubscription();
                    if (sub) {
                        console.log('🔄 Cancelando subscription do browser...');
                        await sub.unsubscribe();
                    }
                }
            }

            // 3. Recarregar a página para forçar nova inscrição
            setTestResult({ success: true, message: 'Subscriptions limpas! Recarregando página...' });
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (e: any) {
            console.error('Erro ao forçar re-inscrição:', e);
            setTestResult({ success: false, error: e.message });
        } finally {
            setForceLoading(false);
        }
    };

    const sendTestNotification = async () => {
        if (!user) return;
        setLoading(true);
        setTestResult(null);
        try {
            const payload = {
                title: 'Teste de Notificação',
                body: 'Se você vê isso, o push está funcionando!',
                url: '/debug-notificacoes',
                tag: 'debug-' + Date.now()
            };

            const { data, error } = await supabase.functions.invoke('push-notify', {
                body: { recipientUserId: user.id, payload },
            });

            setTestResult({ success: !error, data, error });
            // Atualizar dados após envio
            await checkDbSubscriptions();
            await checkBrowserSubscription();
            await refreshSwInfo();
        } catch (err: any) {
            setTestResult({ success: false, error: err.message });
        } finally {
            setLoading(false);
        }
    };

    const showLocalNotification = async () => {
      setTestResult(null);
      try {
        if (!('serviceWorker' in navigator)) {
          setTestResult({ success: false, error: 'Service Worker não disponível' });
          return;
        }
        const reg = await navigator.serviceWorker.getRegistration('/');
        if (!reg) {
          setTestResult({ success: false, error: 'SW não registrado no escopo /' });
          return;
        }
        await reg.showNotification('Teste Local (sem push)', {
          body: 'Isso é uma notificação local via Service Worker. Se não aparecer, o problema é permissão/canal do Android.',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: 'local-' + Date.now(),
          data: { url: '/debug-notificacoes' },
          requireInteraction: false,
        } as any);
        setTestResult({ success: true, message: 'showNotification() chamado. Veja se apareceu no sistema.' });
      } catch (e: any) {
        setTestResult({ success: false, error: e?.message || String(e) });
      }
    };

    const refreshAll = async () => {
        await checkDbSubscriptions();
        await checkBrowserSubscription();
        await checkSessionInfo();
        await refreshSwInfo();
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Diagnóstico de Notificações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded">
                        <h3 className="font-bold mb-2">Ambiente</h3>
                        <p><strong>Protocol:</strong> {diagnostics.protocol}</p>
                        <p><strong>SW disponível:</strong> {diagnostics.serviceWorkerApi ? '✅ Sim' : '❌ Não'}</p>
                        <p><strong>PushManager disponível:</strong> {diagnostics.pushManagerApi ? '✅ Sim' : '❌ Não'}</p>
                        <p><strong>Notification API:</strong> {diagnostics.notificationApi ? '✅ Sim' : '❌ Não'}</p>
                        <p><strong>Standalone (instalado):</strong> {diagnostics.displayModeStandalone ? '✅ Sim' : '❌ Não'}</p>
                        <p><strong>Android WebView:</strong> {diagnostics.isWebView ? '⚠️ Sim' : '✅ Não'}</p>
                        <p><strong>TWA (Play Store/PWA):</strong> {diagnostics.isTwa ? '✅ Sim' : '❌ Não'}</p>
                        <details className="mt-2">
                            <summary className="cursor-pointer font-semibold">User-Agent</summary>
                            <pre className="text-xs overflow-auto mt-2">{diagnostics.userAgent}</pre>
                        </details>
                    </div>

                    <div className="p-4 bg-muted rounded">
                      <h3 className="font-bold mb-2">Service Worker (detalhes)</h3>
                      <p><strong>Controller:</strong> {swController || 'nenhum'}</p>
                      <p><strong>Registrations:</strong> {swRegs.length === 0 ? '0' : swRegs.length}</p>
                      {swRegs.map((r, i) => (
                        <div key={i} className="text-xs mt-2 p-2 bg-background rounded border">
                          <p><strong>Scope:</strong> {r.scope}</p>
                          <p><strong>Script:</strong> {r.scriptURL}</p>
                          <p><strong>State:</strong> {r.state}</p>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={refreshSwInfo} className="mt-2">
                        🔄 Atualizar SW
                      </Button>
                    </div>

                    <div className="p-4 bg-muted rounded">
                        <h3 className="font-bold mb-2">Sessão Supabase</h3>
                        <p><strong>Auth UID:</strong> {sessionInfo.uid || 'Não autenticado'}</p>
                        <p><strong>Email:</strong> {sessionInfo.email || 'N/A'}</p>
                    </div>

                    <div className="p-4 bg-muted rounded">
                        <h3 className="font-bold mb-2">Estado Local (Hook)</h3>
                        <p><strong>Usuário ID (hook):</strong> {user?.id || 'Não logado'}</p>
                        <p><strong>Permissão:</strong> {permission === 'granted' ? '✅ ' + permission : '⚠️ ' + permission}</p>
                        <p><strong>Hook diz "inscrito":</strong> {isSubscribed ? '✅ Sim' : '❌ Não'}</p>
                        <p><strong>Erro no Hook:</strong> {hookError ? '❌ ' + hookError : '✅ Nenhum'}</p>
                    </div>

                    <div className="p-4 bg-muted rounded">
                        <h3 className="font-bold mb-2">Subscription no Browser</h3>
                        <p><strong>Endpoint:</strong> {browserSub || 'Verificando...'}</p>
                    </div>

                    <div className="p-4 bg-muted rounded">
                        <h3 className="font-bold mb-2">Subscriptions no Banco de Dados</h3>
                        <p><strong>Total encontradas:</strong> {dbSubs.length === 0 ? '❌ 0' : '✅ ' + dbSubs.length}</p>
                        {dbSubs.map((sub, i) => (
                            <div key={i} className="text-xs mt-2 p-2 bg-background rounded border">
                                <p><strong>Platform:</strong> {sub.platform || 'web'}</p>
                                <p><strong>Endpoint:</strong> {sub.endpoint.substring(0, 40)}...</p>
                                <p><strong>Criado:</strong> {new Date(sub.created_at).toLocaleString()}</p>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={refreshAll} className="mt-2">
                            🔄 Atualizar Tudo
                        </Button>
                    </div>

                    {/* Análise automática */}
                    {dbSubs.length === 0 && isSubscribed && (
                        <div className="p-4 bg-destructive/10 border border-destructive rounded">
                            <p className="text-sm font-bold text-destructive">
                                ⚠️ PROBLEMA DETECTADO
                            </p>
                            <p className="text-sm mt-1">
                                O hook diz "inscrito" mas não há subscriptions no banco!
                                Isso significa que o save falhou silenciosamente.
                            </p>
                            <p className="text-sm mt-1">
                                <strong>Solução:</strong> Clique em "Forçar Re-inscrição" abaixo.
                            </p>
                        </div>
                    )}

                    {dbSubs.length === 0 && !isSubscribed && permission === 'granted' && (
                        <div className="p-4 bg-yellow-100 border border-yellow-500 rounded">
                            <p className="text-sm">
                                ⚠️ Permissão concedida mas não inscrito. Clique em "Forçar Re-inscrição".
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <Button onClick={requestPermission} disabled={permission === 'granted'}>
                            {permission === 'granted' ? '✅ Permissão já concedida' : 'Solicitar Permissão'}
                        </Button>

                        <Button
                            onClick={forceResubscribe}
                            disabled={forceLoading || !user}
                            variant="secondary"
                        >
                            {forceLoading ? 'Processando...' : '🔄 Forçar Re-inscrição (Limpar e Recriar)'}
                        </Button>

                        <Button
                            onClick={sendTestNotification}
                            disabled={loading || dbSubs.length === 0}
                            variant="default"
                        >
                            {loading ? 'Enviando...' : '📤 Enviar Notificação de Teste (via Push)'}
                        </Button>

                        <Button
                          onClick={showLocalNotification}
                          variant="outline"
                        >
                          🔔 Mostrar Notificação Local (sem push)
                        </Button>

                        {dbSubs.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center">
                                O teste só funciona se houver subscriptions no banco
                            </p>
                        )}
                    </div>

                    {testResult && (
                        <div className={`p-4 rounded ${testResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
                            <h3 className="font-bold">Resultado:</h3>
                            <pre className="text-xs overflow-auto mt-2">
                                {JSON.stringify(testResult, null, 2)}
                            </pre>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default NotificationDebug;

