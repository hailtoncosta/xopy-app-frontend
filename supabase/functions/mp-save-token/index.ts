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
    const { access_token, lojista_id } = await req.json();
    console.log('📥 Salvando token para lojista:', lojista_id);

    if (!access_token || !lojista_id) {
      throw new Error('access_token e lojista_id são obrigatórios');
    }

    // Validação básica do token
    if (!access_token.startsWith('TEST-') && !access_token.startsWith('APP_USR-')) {
      throw new Error('Token inválido. Deve começar com TEST- ou APP_USR-');
    }

    if (access_token.length < 60) {
      throw new Error('Token muito curto. Verifique se copiou corretamente');
    }

    console.log('✅ Token parece válido');

    // Salvar no banco
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extrair user_id do token (se possível) ou usar um placeholder
    const user_id_mp = `manual_${Date.now()}`;

    const { error: upsertError } = await supabase
      .from('mercado_pago_tokens')
      .upsert({
        lojista_id: lojista_id,
        access_token: access_token,
        refresh_token: null,
        user_id_mp: user_id_mp,
        public_key: null,
        expires_in: null,
        expires_at: null,
      }, {
        onConflict: 'lojista_id',
      });

    if (upsertError) {
      console.error('❌ Erro ao salvar token:', upsertError);
      throw new Error(`Erro ao salvar token: ${upsertError.message}`);
    }

    console.log('✅ Token salvo com sucesso');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Token salvo com sucesso',
    }), {
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
