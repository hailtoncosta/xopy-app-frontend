import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processando autorização...');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      // Verificar se houve erro
      if (error) {
        throw new Error(`Erro na autorização: ${error}`);
      }

      // Verificar se tem o código
      if (!code) {
        throw new Error('Código de autorização não encontrado');
      }

      // Verificar state (segurança)
      const savedState = sessionStorage.getItem('mp_oauth_state');
      if (state !== savedState) {
        throw new Error('State inválido - possível ataque CSRF');
      }

      setMessage('Trocando código por token...');

      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Chamar edge function para trocar código por token
      const { data, error: functionError } = await supabase.functions.invoke('mp-exchange-code', {
        body: {
          code,
          lojista_id: user.id,
        },
      });

      if (functionError) {
        throw functionError;
      }

      // Limpar state do sessionStorage
      sessionStorage.removeItem('mp_oauth_state');

      setStatus('success');
      setMessage('Conta conectada com sucesso!');
      toast.success('Mercado Pago conectado com sucesso!');

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/admin/settings');
      }, 2000);

    } catch (error: any) {
      console.error('Erro no callback OAuth:', error);
      setStatus('error');
      setMessage(error.message || 'Erro ao conectar com Mercado Pago');
      toast.error(error.message || 'Erro ao conectar com Mercado Pago');

      // Redirecionar após 3 segundos
      setTimeout(() => {
        navigate('/admin/settings');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-orange-600 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Conectando...
              </h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Sucesso!
              </h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500 mt-4">
                Redirecionando...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Erro
              </h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500 mt-4">
                Redirecionando...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
