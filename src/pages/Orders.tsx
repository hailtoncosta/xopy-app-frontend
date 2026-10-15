import { appConfirm } from '@/lib/feedback';
import { request } from '@/integrations/api/client';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  metadata?: { quantity?: number; title?: string; unit_price?: number; checkout_request_id?: string };
  product_id?: string;
  rental_id?: string;
  order_type?: string;
  rental_info?: {
    days: number;
    daily_rate: number;
    base_price: number;
    start_date: string;
    end_date: string;
  };
  products?: {
    name: string;
    price: number;
    images?: string[];
  };
}

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('🔍 Buscando pedidos...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado');
        navigate('/auth');
        return;
      }

      console.log('👤 User ID:', user.id);

      // Buscar pedidos sem JOIN complexo
      const { data: ordersData, error: ordersError } = await (supabase as any)
        .from('orders')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('❌ Erro ao buscar pedidos:', ordersError);
        throw ordersError;
      }

      console.log('✅ Pedidos encontrados:', ordersData?.length || 0);

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        return;
      }

      // Buscar informações dos produtos separadamente
      const ordersWithProducts = await Promise.all(
        ordersData.map(async (order: any) => {
          try {
            // Verificar se é pedido de locação
            const isRental = order.order_type === 'rental';
            
            if (isRental) {
              console.log('🏠 Pedido de locação detectado:', order.id);
              console.log('📦 Rental ID:', order.rental_id);
              console.log('📋 Rental Info:', order.rental_info);
              
              // Para locações, buscar em dynamic_rentals usando rental_id
              if (order.rental_id) {
                const { data: rental, error: rentalError } = await (supabase as any)
                  .from('dynamic_rentals')
                  .select('id, name, price, image_url, category')
                  .eq('id', order.rental_id)
                  .maybeSingle();

                if (rental) {
                  console.log('✅ Locação encontrada no banco:', rental.name);
                  return {
                    ...order,
                    products: {
                      name: rental.name,
                      price: parseFloat(rental.price.replace(/[^\d,]/g, '').replace(',', '.')) || order.total_amount,
                      images: rental.image_url ? [rental.image_url] : [],
                    },
                  };
                }
              }
              
              // Se não encontrar no banco, usar dados do rental_info
              if (order.rental_info) {
                console.log('⚠️ Usando dados do rental_info');
                const rentalInfo = order.rental_info;
                return {
                  ...order,
                  products: {
                    name: rentalInfo.name || rentalInfo.title || `Locação - ${rentalInfo.days || 1} dia(s)`,
                    price: rentalInfo.base_price || rentalInfo.basePrice || order.total_amount,
                    images: rentalInfo.image ? [rentalInfo.image] : [],
                  },
                };
              }

              // Fallback final
              console.log('❌ Nenhuma informação de locação encontrada');
              return {
                ...order,
                products: {
                  name: 'Locação de Equipamento',
                  price: order.total_amount,
                  images: [],
                },
              };
            } else {
              // Buscar em products para pedidos normais
              const { data: product, error: productError } = await (supabase as any)
                .from('products')
                .select('id, title, price, category, images')
                .eq('id', order.product_id)
                .maybeSingle();

              if (productError) {
                console.error('⚠️ Erro ao buscar produto:', productError);
              }

              return {
                ...order,
                products: product ? {
                  name: product.title,
                  price: product.price,
                  images: product.images || [],
                } : null,
              };
            }
          } catch (error) {
            console.error('⚠️ Erro ao processar pedido:', error);
            return {
              ...order,
              products: null,
            };
          }
        })
      );

      console.log('✅ Pedidos com produtos:', ordersWithProducts.length);
      setOrders(ordersWithProducts);
    } catch (error: any) {
      console.error('❌ Erro ao buscar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 'pending':
        return <Package className="h-5 w-5 text-gray-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'delivered':
        return 'Entregue';
      case 'processing':
        return 'Em processamento';
      case 'pending':
        return 'Aguardando pagamento';
      case 'cancelled':
      case 'rejected':
        return 'Cancelado';
      case 'refunded':
        return 'Reembolsado';
      case 'charged_back':
        return 'Pagamento contestado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'delivered':
        return 'text-green-600';
      case 'processing':
        return 'text-orange-600';
      case 'pending':
        return 'text-gray-600';
      case 'cancelled':
      case 'rejected':
        return 'text-red-600';
      case 'refunded':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const [cancelling, setCancelling] = useState<string | null>(null);
  const cancelOrder = async (id: string) => {
    if (cancelling || !(await appConfirm('Cancelar este pedido? O estoque reservado será liberado.'))) return;
    setCancelling(id);
    try { await request(`/checkout/orders/${id}/cancel`, 'POST', {}); await fetchOrders(); toast.success('Pedido cancelado.'); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Não foi possível cancelar.'); }
    finally { setCancelling(null); }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center bg-white p-4 border-b border-gray-200 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="text-black flex items-center">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h2 className="text-black text-lg font-bold flex-1 text-center pr-6">Meus Pedidos</h2>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Nenhum pedido encontrado</p>
            <p className="text-gray-500 text-sm mt-2">Seus pedidos aparecerão aqui</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-black font-semibold">#{order.id.slice(0, 8)}</p>
                    <p className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex gap-3 items-center">
                    {/* Imagem do Produto */}
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={order.products?.images?.[0] || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop'}
                        alt={order.metadata?.title || order.products?.name || 'Produto'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop';
                        }}
                      />
                    </div>
                    
                    {/* Informações do Produto */}
                    <div className="flex-1">
                      <p className="text-black text-sm font-medium">
                        {order.metadata?.title || order.products?.name || 'Produto'}
                      </p>
                      {order.order_type === 'rental' && order.rental_info && (
                        <p className="text-gray-500 text-xs">
                          {order.rental_info.days} dia(s) • R$ {order.rental_info.daily_rate?.toFixed(2)}/dia
                        </p>
                      )}
                      {order.order_type !== 'rental' && (
                        <p className="text-gray-500 text-xs">Quantidade: {order.metadata?.quantity || 1}</p>
                      )}
                      <p className="text-orange-600 font-bold text-sm mt-1">
                        R$ {Number(order.metadata?.unit_price || order.products?.price || 0).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  {order.metadata?.checkout_request_id && <button onClick={() => navigate(`/pagamento/${order.metadata?.checkout_request_id}`)} className="mb-3 mr-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white">{order.status === 'pending' ? 'Pagar / consultar pagamento' : 'Ver pagamento'}</button>}
                  {order.status === 'pending' && order.metadata?.checkout_request_id && <button disabled={!!cancelling} onClick={() => cancelOrder(order.id)} className="mb-3 text-sm text-red-600 disabled:opacity-50">{cancelling === order.id ? 'Cancelando...' : 'Cancelar pedido'}</button>}
                  <p className="text-black font-bold">Total: R$ {Number(order.total_amount).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;