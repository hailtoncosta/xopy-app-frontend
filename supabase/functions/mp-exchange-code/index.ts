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
    const { code, lojista_id } = await req.json();
    console.log('📥 Trocando código por token para lojista:', lojista_id);

    if (!code || !lojista_id) {
      throw new Error('Código e lojista_id são obrigatórios');
    }

    const clientId = Deno.env.get('MP_CLIENT_ID');
    const clientSecret = Deno.env.get('MP_CLIENT_SECRET');
    const appUrl = Deno.env.get('VITE_APP_URL') || 'https://app.xopy.com.br';
    const redirectUri = `${appUrl}/oauth/callback`;

    if (!clientId || !clientSecret) {
      throw new Error('Credenciais do Mercado Pago não configuradas');
    }

    console.log('🔄 Trocando código por token no MP...');

    // Trocar código por token
    const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Erro ao trocar código:', errorText);
      throw new Error(`Erro ao obter token: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Token obtido com sucesso');

    // Salvar no banco
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: upsertError } = await supabase
      .from('mercado_pago_tokens')
      .upsert({
        lojista_id: lojista_id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        user_id_mp: tokenData.user_id.toString(),
        public_key: tokenData.public_key,
        expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
        token_response: tokenData,
      }, {
        onConflict: 'lojista_id',
      });

    if (upsertError) {
      console.error('❌ Erro ao salvar token:', upsertError);
      throw new Error('Erro ao salvar token no banco de dados');
    }

    console.log('✅ Token salvo no banco');

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('❌ Erro:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
