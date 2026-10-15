import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DebugAuth = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const gatherDebugInfo = async () => {
      try {
        const info: any = {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          supabaseUrl: import.meta.env.VITE_API_URL,
          hasSupabaseKey: !!false,
          extensions: [],
          errors: []
        };

        // Verificar se há extensões interferindo
        if ((window as any).chrome && (window as any).chrome.runtime) {
          info.chromeExtensions = 'Detected';
        }

        // Testar conexão com Supabase
        try {
          const { data, error } = await supabase.auth.getSession();
          info.supabaseConnection = {
            success: !error,
            error: error?.message,
            hasSession: !!data.session
          };
        } catch (err: any) {
          info.supabaseConnection = {
            success: false,
            error: err.message
          };
        }

        // Verificar listeners ativos
        const eventListeners = [];
        if (window.addEventListener.toString().includes('[native code]')) {
          eventListeners.push('Native addEventListener');
        }
        info.eventListeners = eventListeners;

        setDebugInfo(info);
      } catch (error: any) {
        setDebugInfo({
          error: 'Failed to gather debug info',
          message: error.message
        });
      }
    };

    gatherDebugInfo();

    // Capturar erros não tratados
    const handleError = (event: ErrorEvent) => {
      console.error('DebugAuth: Erro capturado:', event.error);
      setDebugInfo(prev => ({
        ...prev,
        lastError: {
          message: event.error?.message || event.message,
          stack: event.error?.stack,
          timestamp: new Date().toISOString()
        }
      }));
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('DebugAuth: Promise rejeitada:', event.reason);
      setDebugInfo(prev => ({
        ...prev,
        lastPromiseRejection: {
          reason: event.reason?.message || String(event.reason),
          timestamp: new Date().toISOString()
        }
      }));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm z-50 hover:bg-blue-600"
        style={{ zIndex: 9999 }}
      >
        Debug Auth
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-lg p-6 max-w-2xl max-h-96 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Debug de Autenticação</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
        
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
          >
            Recarregar Página
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Limpar Storage
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;