import { supabase } from '@/integrations/supabase/client';

export interface PaymentData {
  lojista_id: string;
  transaction_amount: number;
  description: string;
  payment_method_id: string;
  payer: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  marketplace_fee: number;
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
  }>;
}

export interface MercadoPagoConnection {
  connected: boolean;
  user_id_mp?: string;
  created_at?: string;
}

/**
 * Verifica se o usuário possui conta Mercado Pago conectada
 */
export const checkMercadoPagoConnection = async (): Promise<MercadoPagoConnection> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { connected: false };
    }

    const { data, error } = await supabase
      .from('mercado_pago_tokens')
      .select('user_id_mp, created_at')
      .eq('lojista_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Erro ao verificar conexão MP:', error);
      return { connected: false };
    }

    if (data) {
      return {
        connected: true,
        user_id_mp: data.user_id_mp,
        created_at: data.created_at,
      };
    }

    return { connected: false };
  } catch (error) {
    console.error('Erro ao verificar conexão:', error);
    return { connected: false };
  }
};

/**
 * Cria um pagamento no Mercado Pago com split automático
 */
export const createPayment = async (paymentData: PaymentData) => {
  try {
    const { data, error } = await supabase.functions.invoke('mp-create-payment', {
      body: paymentData,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.success) {
      throw new Error(data.error || 'Erro ao criar pagamento');
    }

    return data.payment;
  } catch (error: any) {
    console.error('Erro ao criar pagamento:', error);
    throw error;
  }
};

/**
 * Renova o token de acesso do Mercado Pago
 */
export const refreshToken = async (lojista_id: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('mp-refresh-token', {
      body: { lojista_id },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.success) {
      throw new Error(data.error || 'Erro ao renovar token');
    }

    return data;
  } catch (error: any) {
    console.error('Erro ao renovar token:', error);
    throw error;
  }
};

/**
 * Inicia o fluxo de conexão OAuth do Mercado Pago
 */
export const initiateMercadoPagoConnect = () => {
  const clientId = '1523898674931437';
  const redirectUri = encodeURIComponent('https://app.xopy.com.br/oauth/callback');
  
  // Gerar state único para segurança CSRF
  const state = crypto.randomUUID();
  sessionStorage.setItem('mp_oauth_state', state);

  const authUrl = `https://auth.mercadopago.com/authorization?client_id=${clientId}&response_type=code&platform_id=mp&state=${state}&redirect_uri=${redirectUri}`;
  
  window.location.href = authUrl;
};
