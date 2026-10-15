import { supabase } from '@/integrations/supabase/client';
import { createPayment, PaymentData } from './mercadoPagoService';

export interface CreateOrderData {
  product_id: string;
  seller_id: string;
  total_amount: number;
  marketplace_fee?: number;
  shipping_cost?: number;
  payment_method: 'pix' | 'credit_card' | 'debit_card' | 'boleto';
  delivery_address?: any;
  delivery_type?: string;
  order_type?: string;
  rental_info?: {
    days: number;
    daily_rate: number;
    base_price: number;
    start_date: string;
    end_date: string;
  };
  payer: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  product_info: {
    title: string;
    quantity: number;
    unit_price: number;
  };
  card_token?: string;
  card_data?: any;
}

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  total_amount: number;
  marketplace_fee: number;
  seller_amount: number;
  shipping_cost: number;
  status: string;
  payment_method: string;
  delivery_address?: any;
  delivery_type?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
}

/**
 * Cria um novo pedido e processa o pagamento
 */
export const createOrder = async (orderData: CreateOrderData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // SECURITY: Marketplace fees are calculated server-side by the payment processor
    // No client-side fee calculation to prevent manipulation

    // Criar pedido no banco usando o client direto (não tipado)
    const { data: order, error: orderError } = await (supabase as any)
      .from('orders')
      .insert({
      buyer_id: user.id,
      seller_id: orderData.seller_id,
      product_id: orderData.product_id,
      total_amount: orderData.total_amount,
      marketplace_fee: 0, // Will be updated by payment processor
      seller_amount: 0, // Will be updated by payment processor
        shipping_cost: orderData.shipping_cost || 0,
        payment_method: orderData.payment_method,
        delivery_address: orderData.delivery_address,
        delivery_type: orderData.delivery_type,
        order_type: orderData.order_type || 'product',
        rental_info: orderData.rental_info || null,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Erro ao criar pedido:', orderError);
      throw new Error('Erro ao criar pedido: ' + orderError.message);
    }

    console.log('Pedido criado:', order);

    // Criar pagamento no Mercado Pago
    const orderId = String(order.id);
    const paymentData: any = {
      lojista_id: orderData.seller_id,
      transaction_amount: orderData.total_amount,
      description: `Pedido #${orderId.substring(0, 8)} - ${orderData.product_info.title}`,
      payment_method_id: orderData.payment_method === 'pix' ? 'pix' : orderData.card_data?.payment_method_id || 'credit_card',
      payer: orderData.payer,
      product_id: orderData.product_id, // SECURITY: Send product_id for server-side validation
      items: [
        {
          title: orderData.product_info.title,
          quantity: orderData.product_info.quantity,
          unit_price: orderData.product_info.unit_price,
        },
      ],
    };

    // Adicionar dados do cartão se for pagamento com cartão
    if (orderData.payment_method === 'credit_card' && orderData.card_token) {
      paymentData.token = orderData.card_token;
      paymentData.issuer_id = orderData.card_data?.issuer_id;
      paymentData.installments = 1; // Pode ser parametrizado depois
    }

    console.log('Criando pagamento no MP:', paymentData);
    const payment = await createPayment(paymentData);
    console.log('Pagamento criado:', payment);

    // Salvar transação usando o client direto (não tipado)
    const { error: transactionError } = await (supabase as any)
      .from('mercado_pago_transactions')
      .insert({
        order_id: order.id,
        mp_payment_id: payment.id.toString(),
        mp_status: payment.status,
        mp_status_detail: payment.status_detail,
        transaction_amount: payment.transaction_amount,
        payment_method_id: payment.payment_method_id,
        payment_type_id: payment.payment_type_id,
        qr_code: payment.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
        mp_response: payment,
      });

    if (transactionError) {
      console.error('Erro ao salvar transação:', transactionError);
      throw new Error('Erro ao salvar transação: ' + transactionError.message);
    }

    return {
      order,
      payment,
    };
  } catch (error: any) {
    console.error('Erro ao criar pedido:', error);
    throw error;
  }
};

/**
 * Busca um pedido por ID
 */
export const getOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await (supabase as any)
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Erro ao buscar pedido:', error);
      return null;
    }

    return data as Order;
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    return null;
  }
};

/**
 * Busca pedidos do usuário
 */
export const getUserOrders = async (type: 'buyer' | 'seller' = 'buyer') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const column = type === 'buyer' ? 'buyer_id' : 'seller_id';

    console.log('🔍 Buscando pedidos:', { userId: user.id, type, column });

    // Buscar pedidos sem JOIN complexo
    const { data: orders, error } = await (supabase as any)
      .from('orders')
      .select('*')
      .eq(column, user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar pedidos:', error);
      throw error;
    }

    console.log('✅ Pedidos encontrados:', orders?.length || 0);

    // Se não houver pedidos, retornar array vazio
    if (!orders || orders.length === 0) {
      return [];
    }

    // Buscar informações dos produtos separadamente
    const ordersWithProducts = await Promise.all(
      orders.map(async (order: any) => {
        try {
          const { data: product } = await (supabase as any)
            .from('products')
            .select('id, title, price, category, images')
            .eq('id', order.product_id)
            .single();

          return {
            ...order,
            product: product || null,
          };
        } catch (error) {
          console.error('Erro ao buscar produto do pedido:', error);
          return {
            ...order,
            product: null,
          };
        }
      })
    );

    return ordersWithProducts;
  } catch (error) {
    console.error('❌ Erro ao buscar pedidos:', error);
    throw error;
  }
};

/**
 * Atualiza status do pedido
 */
export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const { error } = await (supabase as any)
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
        paid_at: status === 'paid' ? new Date().toISOString() : undefined,
      })
      .eq('id', orderId);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    throw error;
  }
};

/**
 * Busca transação do Mercado Pago por order_id
 */
export const getOrderTransaction = async (orderId: string) => {
  try {
    const { data, error } = await (supabase as any)
      .from('mercado_pago_transactions')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) {
      console.error('Erro ao buscar transação:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar transação:', error);
    return null;
  }
};
