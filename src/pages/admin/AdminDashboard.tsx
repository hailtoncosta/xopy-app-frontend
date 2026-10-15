import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, ShoppingCart, TrendingUp, Eye, DollarSign } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { contentService } from '@/services/contentService';
import { supabase } from '@/integrations/supabase/client';

interface DashboardMetrics {
  totalProducts: number;
  activeUsers: number;
  ordersToday: number;
  monthlyRevenue: string;
}

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProducts: 0,
    activeUsers: 0,
    ordersToday: 0,
    monthlyRevenue: 'R$ 0,00'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      
      // Carregar produtos dinâmicos
      const products = await contentService.getProducts();
      
      // Carregar usuários ativos (mock por enquanto)
      const { data: users } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' });
      
      setMetrics({
        totalProducts: products.length,
        activeUsers: users?.length || 0,
        ordersToday: Math.floor(Math.random() * 50) + 100, // Mock
        monthlyRevenue: `R$ ${(Math.random() * 50000 + 10000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')},00`
      });
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      // Usar dados mock em caso de erro
      setMetrics({
        totalProducts: 1234,
        activeUsers: 8549,
        ordersToday: 156,
        monthlyRevenue: 'R$ 45.200,00'
      });
    } finally {
      setLoading(false);
    }
  };

  const metricCards = [
    {
      title: 'Total de Produtos',
      value: loading ? '...' : metrics.totalProducts.toString(),
      change: 12,
      changeType: 'increase' as const,
      icon: Package,
      color: 'blue' as const
    },
    {
      title: 'Usuários Ativos',
      value: loading ? '...' : metrics.activeUsers.toString(),
      change: 8,
      changeType: 'increase' as const,
      icon: Users,
      color: 'green' as const
    },
    {
      title: 'Pedidos Hoje',
      value: loading ? '...' : metrics.ordersToday.toString(),
      change: -3,
      changeType: 'decrease' as const,
      icon: ShoppingCart,
      color: 'orange' as const
    },
    {
      title: 'Receita Mensal',
      value: loading ? '...' : metrics.monthlyRevenue,
      change: 15,
      changeType: 'increase' as const,
      icon: DollarSign,
      color: 'purple' as const
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 bg-blue-50',
      green: 'bg-green-500 text-green-600 bg-green-50',
      orange: 'bg-orange-500 text-orange-600 bg-orange-50',
      purple: 'bg-purple-500 text-purple-600 bg-purple-50'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Painel Administrativo!</h2>
          <p className="text-blue-100">
            Gerencie todos os aspectos da sua plataforma de construção e materiais.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((metric, index) => {
            const Icon = metric.icon;
            const colorClasses = getColorClasses(metric.color).split(' ');
            
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metric.value}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className={`h-4 w-4 mr-1 ${
                        metric.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.changeType === 'increase' ? '+' : ''}{metric.change}%
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${colorClasses[2]}`}>
                    <Icon className={`h-6 w-6 ${colorClasses[1]}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <Link 
                to="/admin/section-manager"
                className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="font-medium text-purple-900">Gerenciar Seções</span>
                </div>
                <span className="text-purple-600">→</span>
              </Link>

              <Link 
                to="/admin/products/add"
                className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium text-blue-900">Adicionar Produto</span>
                </div>
                <span className="text-blue-600">→</span>
              </Link>
              
              <Link 
                to="/admin/banner-editor"
                className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-green-600 mr-3" />
                  <span className="font-medium text-green-900">Editor de Banners</span>
                </div>
                <span className="text-green-600">→</span>
              </Link>
              
              <Link 
                to="/admin/content/management"
                className="w-full flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <Eye className="h-5 w-5 text-orange-600 mr-3" />
                  <span className="font-medium text-orange-900">Gerenciar Conteúdo</span>
                </div>
                <span className="text-orange-600">→</span>
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Atividade Recente</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Novo produto adicionado</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Há 2 minutos</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Pedido #1234 processado</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Há 15 minutos</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Backup automático concluído</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Há 1 hora</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;