import { appNotify } from '@/lib/feedback';
import React, { useState } from 'react';
import { 
  Search, 
  Filter,
  Eye,
  Edit3,
  Truck,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  User,
  MapPin,
  CreditCard,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  Download,
  Printer,
  RefreshCw,
  AlertTriangle,
  X,
  Save
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress?: Address;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  notes?: string;
  trackingCode?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
}

const OrdersAdmin: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Carregar pedidos reais do banco
  React.useEffect(() => {
    loadOrders();
  }, []);
  
  const loadOrders = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Carregando pedidos do banco...');
      
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:buyer_id(id, email),
          seller:seller_id(id, email),
          product:product_id(id, title, price, images)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erro ao carregar pedidos:', error);
        throw error;
      }
      
      console.log('✅ Pedidos carregados:', ordersData?.length || 0);
      
      // Converter para o formato esperado
      const convertedOrders: Order[] = (ordersData || []).map((order: any) => ({
        id: order.id,
        orderNumber: `PED-${order.id.slice(0, 8).toUpperCase()}`,
        customer: {
          id: order.buyer?.id || '',
          name: order.buyer?.email?.split('@')[0] || 'Cliente',
          email: order.buyer?.email || '',
          phone: '(11) 99999-9999' // Placeholder
        },
        items: [{
          id: order.product?.id || '',
          productId: order.product?.id || '',
          productName: order.product?.title || 'Produto',
          productImage: order.product?.images?.[0] || '/placeholder.svg',
          quantity: 1,
          unitPrice: order.product?.price || 0,
          totalPrice: order.total_amount || 0
        }],
        status: order.status as Order['status'],
        paymentStatus: order.payment_status === 'approved' ? 'paid' : 
                       order.payment_status === 'pending' ? 'pending' :
                       order.payment_status === 'rejected' ? 'failed' : 'pending',
        paymentMethod: order.payment_method === 'pix' ? 'PIX' : 
                      order.payment_method === 'credit_card' ? 'Cartão de Crédito' : 
                      order.payment_method || 'Não informado',
        shippingAddress: {
          street: 'Rua Exemplo',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567'
        },
        subtotal: order.total_amount || 0,
        shippingCost: order.shipping_cost || 0,
        discount: 0,
        total: order.total_amount || 0,
        notes: order.notes,
        trackingCode: order.tracking_code,
        createdAt: new Date(order.created_at),
        updatedAt: new Date(order.updated_at || order.created_at),
        estimatedDelivery: order.estimated_delivery ? new Date(order.estimated_delivery) : undefined
      }));
      
      setOrders(convertedOrders);
    } catch (error) {
      console.error('❌ Erro ao carregar pedidos:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const [ordersMock] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'PED-2024-001',
      customer: {
        id: '1',
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '(11) 99999-9999'
      },
      items: [
        {
          id: '1',
          productId: '1',
          productName: 'Smartphone Samsung Galaxy',
          productImage: '/placeholder.svg',
          quantity: 1,
          unitPrice: 1299.99,
          totalPrice: 1299.99
        },
        {
          id: '2',
          productId: '2',
          productName: 'Capinha Transparente',
          productImage: '/placeholder.svg',
          quantity: 1,
          unitPrice: 29.99,
          totalPrice: 29.99
        }
      ],
      status: 'processing',
      paymentStatus: 'paid',
      paymentMethod: 'Cartão de Crédito',
      shippingAddress: {
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      },
      subtotal: 1329.98,
      shippingCost: 15.00,
      discount: 0,
      total: 1344.98,
      notes: 'Entregar no portão principal',
      trackingCode: 'BR123456789',
      createdAt: new Date('2024-01-15T10:30:00'),
      updatedAt: new Date('2024-01-15T14:20:00'),
      estimatedDelivery: new Date('2024-01-20')
    },
    {
      id: '2',
      orderNumber: 'PED-2024-002',
      customer: {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@email.com',
        phone: '(11) 88888-8888'
      },
      items: [
        {
          id: '3',
          productId: '3',
          productName: 'Notebook Dell Inspiron',
          productImage: '/placeholder.svg',
          quantity: 1,
          unitPrice: 2499.99,
          totalPrice: 2499.99
        }
      ],
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'PIX',
      shippingAddress: {
        street: 'Av. Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100'
      },
      subtotal: 2499.99,
      shippingCost: 0,
      discount: 100.00,
      total: 2399.99,
      createdAt: new Date('2024-01-16T09:15:00'),
      updatedAt: new Date('2024-01-16T09:15:00')
    },
    {
      id: '3',
      orderNumber: 'PED-2024-003',
      customer: {
        id: '3',
        name: 'Pedro Costa',
        email: 'pedro@email.com',
        phone: '(11) 77777-7777'
      },
      items: [
        {
          id: '4',
          productId: '4',
          productName: 'Fone Bluetooth Sony',
          productImage: '/placeholder.svg',
          quantity: 2,
          unitPrice: 199.99,
          totalPrice: 399.98
        }
      ],
      status: 'delivered',
      paymentStatus: 'paid',
      paymentMethod: 'Cartão de Débito',
      shippingAddress: {
        street: 'Rua Augusta',
        number: '500',
        neighborhood: 'Consolação',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01305-000'
      },
      subtotal: 399.98,
      shippingCost: 12.00,
      discount: 0,
      total: 411.98,
      trackingCode: 'BR987654321',
      createdAt: new Date('2024-01-10T16:45:00'),
      updatedAt: new Date('2024-01-14T11:30:00')
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<Order['status']>('pending');
  const [newTrackingCode, setNewTrackingCode] = useState('');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.trackingCode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const now = new Date();
      const orderDate = order.createdAt;
      
      switch (dateFilter) {
        case 'today':
          matchesDate = orderDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= monthAgo;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
    };
    return colors[status];
  };

  const getStatusIcon = (status: Order['status']) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      confirmed: <CheckCircle className="w-4 h-4" />,
      processing: <Package className="w-4 h-4" />,
      shipped: <Truck className="w-4 h-4" />,
      delivered: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
      refunded: <RefreshCw className="w-4 h-4" />
    };
    return icons[status];
  };

  const getStatusLabel = (status: Order['status']) => {
    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      processing: 'Processando',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado'
    };
    return labels[status];
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
    };
    return colors[status];
  };

  const getPaymentStatusLabel = (status: Order['paymentStatus']) => {
    const labels = {
      pending: 'Pendente',
      paid: 'Pago',
      failed: 'Falhou',
      refunded: 'Reembolsado'
    };
    return labels[status];
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return;

    try {
      console.log('🔄 Atualizando status do pedido:', selectedOrder.id);
      
      // Atualizar no banco de dados
      const { error } = await (supabase as any)
        .from('orders')
        .update({
          status: newStatus,
          tracking_code: newTrackingCode || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOrder.id);
      
      if (error) {
        console.error('❌ Erro ao atualizar pedido:', error);
        appNotify('Erro ao atualizar pedido');
        return;
      }
      
      console.log('✅ Pedido atualizado com sucesso');
      
      // Atualizar estado local
      setOrders(prev => prev.map(order => 
        order.id === selectedOrder.id 
          ? { 
              ...order, 
              status: newStatus, 
              trackingCode: newTrackingCode || order.trackingCode,
              updatedAt: new Date() 
            }
          : order
      ));

      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewTrackingCode('');
      
      // Recarregar pedidos
      await loadOrders();
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      appNotify('Erro ao atualizar status do pedido');
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleChangeStatus = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNewTrackingCode(order.trackingCode || '');
    setShowStatusModal(true);
  };

  const formatAddress = (address: Address) => {
    return `${address.street}, ${address.number}${address.complement ? `, ${address.complement}` : ''}, ${address.neighborhood}, ${address.city}/${address.state} - ${address.zipCode}`;
  };

  const getTotalOrders = () => orders.length;
  const getPendingOrders = () => orders.filter(order => order.status === 'pending').length;
  const getTotalRevenue = () => orders.filter(order => order.paymentStatus === 'paid').reduce((sum, order) => sum + order.total, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gerenciamento de Pedidos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie todos os pedidos da plataforma
            </p>
          </div>
          
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Pedidos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getTotalOrders()}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pedidos Pendentes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getPendingOrders()}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  R$ {getTotalRevenue().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por pedido, cliente, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="processing">Processando</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregue</option>
                <option value="cancelled">Cancelado</option>
                <option value="refunded">Reembolsado</option>
              </select>
            </div>

            <div>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos os Pagamentos</option>
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="failed">Falhou</option>
                <option value="refunded">Reembolsado</option>
              </select>
            </div>

            <div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todas as Datas</option>
                <option value="today">Hoje</option>
                <option value="week">Última Semana</option>
                <option value="month">Último Mês</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Carregando pedidos...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || dateFilter !== 'all'
                  ? 'Nenhum pedido encontrado com os filtros aplicados'
                  : 'Nenhum pedido encontrado'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Pagamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.orderNumber}
                        </div>
                        {order.trackingCode && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {order.trackingCode}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.customer.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.customer.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {getPaymentStatusLabel(order.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {order.createdAt.toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleChangeStatus(order)}
                          className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Alterar status"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detalhes do Pedido {selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Informações do Cliente
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Nome:</strong> {selectedOrder.customer.name}</p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {selectedOrder.customer.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {selectedOrder.customer.phone}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Endereço de Entrega
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatAddress(selectedOrder.shippingAddress)}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Pagamento
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Método:</strong> {selectedOrder.paymentMethod}</p>
                      <p>
                        <strong>Status:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                          {getPaymentStatusLabel(selectedOrder.paymentStatus)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Info */}
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Status do Pedido
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Status:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusLabel(selectedOrder.status)}
                        </span>
                      </p>
                      {selectedOrder.trackingCode && (
                        <p><strong>Código de Rastreamento:</strong> {selectedOrder.trackingCode}</p>
                      )}
                      {selectedOrder.estimatedDelivery && (
                        <p><strong>Previsão de Entrega:</strong> {selectedOrder.estimatedDelivery.toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Datas
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Criado em:</strong> {selectedOrder.createdAt.toLocaleString('pt-BR')}</p>
                      <p><strong>Atualizado em:</strong> {selectedOrder.updatedAt.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Observações
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Itens do Pedido</h4>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Produto
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Qtd
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Preço Unit.
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-10 h-10 rounded object-cover"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.productName}
                                </p>
                                {item.variant && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.variant}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                            R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                            R$ {item.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Order Summary */}
                <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>R$ {selectedOrder.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frete:</span>
                      <span>R$ {selectedOrder.shippingCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Desconto:</span>
                        <span>-R$ {selectedOrder.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t border-gray-200 dark:border-gray-600 pt-2">
                      <span>Total:</span>
                      <span>R$ {selectedOrder.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleChangeStatus(selectedOrder)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit3 className="w-4 h-4" />
                  Alterar Status
                </button>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Change Modal */}
        {showStatusModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Alterar Status do Pedido
                </h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Novo Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as Order['status'])}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="processing">Processando</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregue</option>
                    <option value="cancelled">Cancelado</option>
                    <option value="refunded">Reembolsado</option>
                  </select>
                </div>

                {(newStatus === 'shipped' || newStatus === 'delivered') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Código de Rastreamento
                    </label>
                    <input
                      type="text"
                      value={newTrackingCode}
                      onChange={(e) => setNewTrackingCode(e.target.value)}
                      placeholder="Digite o código de rastreamento"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpdateOrderStatus}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrdersAdmin;