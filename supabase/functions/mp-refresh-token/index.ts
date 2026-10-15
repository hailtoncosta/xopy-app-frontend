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
    const { lojista_id } = await req.json();

    if (!lojista_id) {
      throw new Error('lojista_id é obrigatório');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar tokens atuais
    const { data: tokenData, error: tokenError } = await supabase
      .from('mercado_pago_tokens')
      .select('*')
      .eq('lojista_id', lojista_id)
      .single();

    if (tokenError || !tokenData) {
      throw new Error('Tokens não encontrados para este lojista');
    }

    if (!tokenData.refresh_token) {
      throw new Error('Refresh token não disponível. O token foi salvo manualmente e não pode ser renovado automaticamente.');
    }

    // Renovar token
    const clientId = '1523898674931437';
    const clientSecret = Deno.env.get('MP_CLIENT_SECRET');

    const refreshResponse = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_secret: clientSecret!,
        client_id: clientId,
        grant_type: 'refresh_token',
        refresh_token: tokenData.refresh_token,
      }),
    });

    if (!refreshResponse.ok) {
      const error = await refreshResponse.text();
      console.error('Erro ao renovar token:', error);
      throw new Error(`Falha ao renovar token: ${error}`);
    }

    const newTokenData = await refreshResponse.json();
    console.log('Token renovado com sucesso');

    // Atualizar tokens no banco
    const { error: updateError } = await supabase
      .from('mercado_pago_tokens')
      .update({
        access_token: newTokenData.access_token,
        refresh_token: newTokenData.refresh_token,
        expires_in: newTokenData.expires_in,
        updated_at: new Date().toISOString(),
      })
      .eq('lojista_id', lojista_id);

    if (updateError) {
      throw new Error(`Falha ao atualizar tokens: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Token renovado com sucesso',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro ao renovar token:', error);
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
