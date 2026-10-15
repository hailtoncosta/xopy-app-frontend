import { useState, useEffect } from 'react';
import { Package, TrendingUp, Star, Loader2 } from 'lucide-react';
import { sellerStoreService, type SellerStats } from '@/services/sellerStoreService';

interface StatsSectionProps {
  userId: string;
}

export const StatsSection = ({ userId }: StatsSectionProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<SellerStats>({
    totalProducts: 0,
    totalSales: 0,
    avgRating: 0
  });

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await sellerStoreService.getSellerStats(userId);
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-center h-20">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      icon: Package,
      label: 'Produtos Ativos',
      value: stats.totalProducts,
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    },
    {
      icon: TrendingUp,
      label: 'Total de Vendas',
      value: stats.totalSales,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      icon: Star,
      label: 'Avaliação Média',
      value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '-',
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
