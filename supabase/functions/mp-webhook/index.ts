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
    const body = await req.json();
    console.log('📥 Webhook recebido:', JSON.stringify(body, null, 2));

    // Validar assinatura do webhook (segurança) - OBRIGATÓRIO
    const xSignature = req.headers.get('x-signature');
    const xRequestId = req.headers.get('x-request-id');
    const webhookSecret = Deno.env.get('MP_WEBHOOK_SECRET');

    // Validação obrigatória: rejeitar se não houver secret configurado
    if (!webhookSecret) {
      console.error('❌ MP_WEBHOOK_SECRET não configurado');
      return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Validação obrigatória: rejeitar se não houver headers de assinatura
    if (!xSignature || !xRequestId) {
      console.error('❌ Headers de assinatura ausentes');
      return new Response(JSON.stringify({ error: 'Missing required signature headers' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Validar assinatura
    const parts = xSignature.split(',');
    let ts = '';
    let hash = '';
    
    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key && value) {
        const trimmedKey = key.trim();
        const trimmedValue = value.trim();
        if (trimmedKey === 'ts') ts = trimmedValue;
        if (trimmedKey === 'v1') hash = trimmedValue;
      }
    }

    if (!ts || !hash) {
      console.error('❌ Formato de assinatura inválido');
      return new Response(JSON.stringify({ error: 'Invalid signature format' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const dataId = body?.data?.id || '';
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(manifest)
    );
    
    const hashArray = Array.from(new Uint8Array(signature));
    const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (computedHash !== hash) {
      console.error('❌ Assinatura inválida');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    
    console.log('✅ Assinatura validada com sucesso');

    const { type, data } = body;

    // Só processar notificações de pagamento
    if (type !== 'payment') {
      console.log('ℹ️ Tipo de notificação ignorado:', type);
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const paymentId = data.id;
    console.log('💳 Processando pagamento:', paymentId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar transação
    const { data: transaction, error: txError } = await supabase
      .from('mercado_pago_transactions')
      .select(`
        *,
        order:orders(*)
      `)
      .eq('mp_payment_id', paymentId.toString())
      .single();

    if (txError || !transaction) {
      console.error('❌ Transação não encontrada:', paymentId, txError);
      return new Response(JSON.stringify({ error: 'Transaction not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    console.log('✅ Transação encontrada:', transaction.id);

    // Buscar token do vendedor
    const { data: tokenData, error: tokenError } = await supabase
      .from('mercado_pago_tokens')
      .select('access_token')
      .eq('lojista_id', transaction.order.seller_id)
      .single();

    if (tokenError || !tokenData) {
      console.error('❌ Token MP não encontrado:', tokenError);
      throw new Error('Token MP não encontrado');
    }

    // Buscar detalhes do pagamento no MP
    console.log('🔍 Buscando detalhes do pagamento no MP...');
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error('❌ Erro ao buscar pagamento no MP:', errorText);
      throw new Error('Erro ao buscar pagamento no MP');
    }

    const paymentData = await mpResponse.json();
    console.log('💰 Status do pagamento:', paymentData.status, paymentData.status_detail);

    // Atualizar transação
    const { error: updateTxError } = await supabase
      .from('mercado_pago_transactions')
      .update({
        mp_status: paymentData.status,
        mp_status_detail: paymentData.status_detail,
        mp_response: paymentData,
        approved_at: paymentData.status === 'approved' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction.id);

    if (updateTxError) {
      console.error('❌ Erro ao atualizar transação:', updateTxError);
    } else {
      console.log('✅ Transação atualizada');
    }

    // Determinar status do pedido
    let orderStatus = 'pending';
    if (paymentData.status === 'approved') {
      orderStatus = 'paid';
    } else if (paymentData.status === 'rejected') {
      orderStatus = 'rejected';
    } else if (paymentData.status === 'refunded') {
      orderStatus = 'refunded';
    }

    // Atualizar pedido
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({
        status: orderStatus,
        paid_at: paymentData.status === 'approved' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction.order.id);

    if (updateOrderError) {
      console.error('❌ Erro ao atualizar pedido:', updateOrderError);
    } else {
      console.log('✅ Pedido atualizado para status:', orderStatus);
    }

    // Criar notificações
    if (paymentData.status === 'approved') {
      console.log('🔔 Criando notificações...');

      // Notificação para vendedor
      const { error: sellerNotifError } = await supabase
        .from('notifications')
        .insert({
          user_id: transaction.order.seller_id,
          type: 'payment_received',
          title: '💰 Pagamento Recebido!',
          message: `Você recebeu R$ ${transaction.order.seller_amount.toFixed(2).replace('.', ',')} pela venda de um produto.`,
          data: {
            order_id: transaction.order.id,
            amount: transaction.order.seller_amount,
            product_id: transaction.order.product_id,
          },
          action_url: `/pedidos`,
        });

      if (sellerNotifError) {
        console.error('❌ Erro ao criar notificação do vendedor:', sellerNotifError);
      } else {
        console.log('✅ Notificação do vendedor criada');
      }

      // Notificação para comprador
      const { error: buyerNotifError } = await supabase
        .from('notifications')
        .insert({
          user_id: transaction.order.buyer_id,
          type: 'payment_approved',
          title: '✅ Pagamento Aprovado!',
          message: 'Seu pagamento foi aprovado. O vendedor já foi notificado.',
          data: {
            order_id: transaction.order.id,
            amount: transaction.order.total_amount,
          },
          action_url: `/pedidos`,
        });

      if (buyerNotifError) {
        console.error('❌ Erro ao criar notificação do comprador:', buyerNotifError);
      } else {
        console.log('✅ Notificação do comprador criada');
      }
    }

    console.log('✅ Webhook processado com sucesso');

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('❌ Erro no webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
