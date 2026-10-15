import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, state } = await req.json();

    if (!code) {
      throw new Error('Código de autorização não fornecido');
    }

    // Configurações do Mercado Pago
    const clientId = '1523898674931437';
    const clientSecret = Deno.env.get('MP_CLIENT_SECRET');
    const redirectUri = 'https://app.xopy.com.br/oauth/callback';

    // Trocar código pelo access_token
    const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_secret: clientSecret!,
        client_id: clientId,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Erro ao trocar código por token:', error);
      throw new Error(`Falha ao obter token: ${error}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Token obtido com sucesso:', {
      user_id: tokenData.user_id,
      expires_in: tokenData.expires_in,
    });

    // Salvar tokens no Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obter usuário autenticado do state
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Usuário não autenticado');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Falha ao obter usuário autenticado');
    }

    // Inserir ou atualizar tokens
    const { error: dbError } = await supabase
      .from('mercado_pago_tokens')
      .upsert({
        lojista_id: user.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        user_id_mp: tokenData.user_id,
        public_key: tokenData.public_key,
        expires_in: tokenData.expires_in,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'lojista_id'
      });

    if (dbError) {
      console.error('Erro ao salvar tokens:', dbError);
      throw new Error(`Falha ao salvar tokens: ${dbError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Conta Mercado Pago conectada com sucesso!',
        user_id_mp: tokenData.user_id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro no callback OAuth:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        success: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
