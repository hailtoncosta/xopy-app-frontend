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
    const {
      lojista_id,
      transaction_amount,
      description,
      payment_method_id,
      payer,
      marketplace_fee,
      items,
      token,
      issuer_id,
      installments,
      product_id
    } = await req.json();

    if (!lojista_id || !transaction_amount || !payment_method_id || !payer) {
      throw new Error('Parâmetros obrigatórios faltando');
    }

    // Validar token para pagamentos com cartão
    if (payment_method_id !== 'pix' && !token) {
      throw new Error('Token do cartão é obrigatório para pagamentos com cartão');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // SECURITY FIX: Validate product price server-side if product_id is provided
    if (product_id) {
      console.log('🔒 Validating product price server-side for product:', product_id);
      
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, price, status, approval_status, user_id')
        .eq('id', product_id)
        .single();

      if (productError || !product) {
        console.error('❌ Product not found:', productError);
        throw new Error('Produto não encontrado ou inválido');
      }

      // Validate product is available for purchase
      if (product.status !== 'active' || product.approval_status !== 'approved') {
        console.error('❌ Product not available:', product);
        throw new Error('Produto não está disponível para compra');
      }

      // Verify submitted amount matches actual product price (with 0.01 tolerance for floating point)
      const actualPrice = parseFloat(product.price.toString());
      const submittedAmount = parseFloat(transaction_amount.toString());
      
      if (Math.abs(actualPrice - submittedAmount) > 0.01) {
        console.error('❌ Price mismatch:', { actualPrice, submittedAmount });
        throw new Error(`Valor inválido. Preço esperado: R$ ${actualPrice.toFixed(2)}, enviado: R$ ${submittedAmount.toFixed(2)}`);
      }

      // Verify seller matches product owner
      if (product.user_id !== lojista_id) {
        console.error('❌ Seller mismatch:', { productOwner: product.user_id, providedSeller: lojista_id });
        throw new Error('Vendedor inválido para este produto');
      }

      console.log('✅ Product validation passed');
    } else {
      console.warn('⚠️ No product_id provided - skipping server-side price validation');
    }

    // Buscar taxa de comissão da plataforma
    const { data: settingsData, error: settingsError } = await supabase
      .from('platform_settings')
      .select('commission_rate')
      .single();

    if (settingsError) {
      console.error('Erro ao buscar taxa de comissão:', settingsError);
    }

    // Taxa de comissão em porcentagem (padrão: 5%)
    const commissionRate = settingsData?.commission_rate || 5.0;
    
    // Calcular taxa da plataforma baseada no valor da transação
    const platformFee = (transaction_amount * commissionRate) / 100;

    console.log(`Taxa de comissão: ${commissionRate}% | Valor da taxa: R$ ${platformFee.toFixed(2)}`);

    // Buscar tokens do lojista
    const { data: tokenData, error: tokenError } = await supabase
      .from('mercado_pago_tokens')
      .select('*')
      .eq('lojista_id', lojista_id)
      .single();

    if (tokenError || !tokenData) {
      throw new Error('Lojista não possui conta Mercado Pago conectada');
    }

    // User ID da Xopy (marketplace)
    const xopyUserId = '2695399049';

    // Criar pagamento no Mercado Pago
    const paymentPayload: any = {
      transaction_amount,
      description,
      payment_method_id,
      payer: {
        email: payer.email,
        first_name: payer.first_name,
        last_name: payer.last_name,
      },
      marketplace_fee: platformFee, // Taxa da Xopy calculada dinamicamente
      sponsor_id: xopyUserId, // User ID da Xopy
      application_fee: platformFee, // Taxa cobrada pela plataforma
      additional_info: {
        items: items || [],
      },
      notification_url: `${supabaseUrl}/functions/v1/mp-webhook`,
      metadata: {
        lojista_id: lojista_id,
        xopy_marketplace: true,
      }
    };

    // Adicionar dados específicos para pagamento com cartão
    if (payment_method_id !== 'pix' && token) {
      paymentPayload.token = token;
      paymentPayload.installments = installments || 1;
      if (issuer_id) {
        paymentPayload.issuer_id = issuer_id;
      }
    }

    console.log('Criando pagamento com payload:', JSON.stringify(paymentPayload, null, 2));

    const paymentResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.access_token}`,
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(paymentPayload),
    });

    if (!paymentResponse.ok) {
      const error = await paymentResponse.json();
      console.error('Erro ao criar pagamento:', error);
      throw new Error(`Falha ao criar pagamento: ${JSON.stringify(error)}`);
    }

    const paymentData = await paymentResponse.json();
    console.log('Pagamento criado com sucesso:', {
      id: paymentData.id,
      status: paymentData.status,
    });

    return new Response(
      JSON.stringify({
        success: true,
        payment: paymentData,
        message: 'Pagamento criado com sucesso',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
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
