import React, { useState, useEffect } from 'react';
import { ArrowRight, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { contentService } from '@/services/contentService';
import { topChoices } from '@/data';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/contexts/FavoritesContext';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types';

interface TopChoicesSectionProps {
  className?: string;
  onProductClick?: (product: Product) => void;
}

const TopChoicesSection: React.FC<TopChoicesSectionProps> = ({ 
  className = "", 
  onProductClick
}) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopChoicesProducts = async () => {
      try {
        console.log('⭐ Carregando top choices do BANCO...');
        
        const dynamicProducts = await contentService.getProducts();
        if (dynamicProducts && dynamicProducts.length > 0) {
          const topChoicesProducts = dynamicProducts.filter(p => p.is_top_choice);
          
          // Ordenar por data de criação (mais novos primeiro) e limitar a 8
          const sortedProducts = topChoicesProducts
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 8);
          
          const dbProducts = sortedProducts.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image_url,
            type: p.type as 'produto' | 'serviço' | 'decoração',
            category: p.category,
            rating: p.rating || 0,
            isOffer: p.is_offer || false
          }));
          
          console.log('✅ Top choices carregados (8 mais recentes):', dbProducts.length);
          setProducts(dbProducts.length > 0 ? dbProducts : topChoices);
        } else {
          console.log('📋 Nenhum produto no banco, usando fallback');
          setProducts(topChoices);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar top choices:', error);
        setProducts(topChoices);
      } finally {
        setLoading(false);
      }
    };

    loadTopChoicesProducts();

    // Realtime updates
    console.log('🎯 [TopChoices] Configurando realtime...');
    const channel = supabase
      .channel('topchoices-products-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dynamic_products'
        },
        (payload) => {
          console.log('⚡ [TopChoices] REALTIME UPDATE:', payload);
          loadTopChoicesProducts();
        }
      )
      .subscribe();

    // Listeners para atualizações do admin
    const handleContentUpdate = (event: CustomEvent) => {
      console.log('🔄 Evento de atualização recebido na TopChoicesSection:', event.detail);
      if (event.detail.section === 'topChoices' || event.detail.type === 'topChoices') {
        console.log('⭐ Recarregando top choices devido a atualização do admin...');
        loadTopChoicesProducts();
      }
    };

    const handleTopChoicesUpdate = () => {
      console.log('⭐ Evento específico de top choices recebido, recarregando...');
      loadTopChoicesProducts();
    };

    const handleForceReload = (event: CustomEvent) => {
      if (event.detail.section === 'topChoices') {
        console.log('🔄 Força reload dos top choices...');
        loadTopChoicesProducts();
      }
    };

    const handleTopChoicesProductUpdate = (event: CustomEvent) => {
      console.log('🎯 Produto top choice atualizado diretamente:', event.detail);
      loadTopChoicesProducts();
    };

    const handleProductsUpdate = () => {
      console.log('📦 Evento de produtos atualizado, recarregando top choices...');
      loadTopChoicesProducts();
    };

    window.addEventListener('contentUpdated', handleContentUpdate as EventListener);
    window.addEventListener('topChoicesSectionUpdated', handleTopChoicesUpdate);
    window.addEventListener('forceContentReload', handleForceReload as EventListener);
    window.addEventListener('adminContentUpdated', handleContentUpdate as EventListener);
    window.addEventListener('topChoicesProductUpdated', handleTopChoicesProductUpdate as EventListener);
    window.addEventListener('productsUpdated', handleProductsUpdate);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_content_updated' || e.key === 'topchoices_products_cache') {
        console.log('📱 Mudança detectada no localStorage, recarregando top choices...');
        setTimeout(loadTopChoicesProducts, 500);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      console.log('🔌 [TopChoices] Desconectando realtime');
      supabase.removeChannel(channel);
      window.removeEventListener('contentUpdated', handleContentUpdate as EventListener);
      window.removeEventListener('topChoicesSectionUpdated', handleTopChoicesUpdate);
      window.removeEventListener('forceContentReload', handleForceReload as EventListener);
      window.removeEventListener('adminContentUpdated', handleContentUpdate as EventListener);
      window.removeEventListener('topChoicesProductUpdated', handleTopChoicesProductUpdate as EventListener);
      window.removeEventListener('productsUpdated', handleProductsUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleViewMore = () => {
    navigate('/categoria/top-choices');
  };

  const handleProductClick = (product: Product) => {
    if (onProductClick) {
      onProductClick(product);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    toggleFavorite(product);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'serviço':
        return 'bg-blue-100 text-blue-700';
      case 'decoração':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-orange-100 text-orange-700';
    }
  };

  if (loading) {
    return (
      <div className={`mb-3 bg-gray-50 rounded-lg p-2 ${className}`}>
        <h2 className="text-xl font-bold text-black mb-4">Top Escolhas pra Você</h2>
        <p className="text-gray-600">Carregando produtos...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={`mb-3 bg-gray-50 rounded-lg p-2 ${className}`}>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Mobile: Grid 2x4 (8 produtos) */
        @media (max-width: 768px) {
          .topchoices-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
          }
        }
        
        @media (min-width: 769px) {
          .topchoices-grid {
            display: flex;
            gap: 1rem;
            min-width: max-content;
            padding-bottom: 0.5rem;
          }
        }
      `}</style>

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-black">Top Escolhas pra Você</h2>
      </div>
      
      <div className="md:overflow-x-auto md:scrollbar-hide">
        <div className="topchoices-grid">
          {/* Sempre 8 produtos mais recentes */}
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow md:w-48 md:flex-shrink-0 cursor-pointer"
              onClick={() => handleProductClick(product)}
            >
              <div className="h-28 md:h-32 bg-gray-100 relative">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.warn('Erro ao carregar imagem do produto:', product.name);
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1585128903994-2dc2e06f62c7?w=400&h=300&fit=crop';
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className={`absolute bottom-2 right-2 w-6 h-6 rounded-full bg-white/90 hover:bg-white shadow-md transition-all duration-200 ${
                    isFavorite(product.id) 
                      ? 'text-orange-600 hover:text-orange-600' 
                      : 'text-gray-400 hover:text-orange-600'
                  }`}
                  onClick={(e) => handleToggleFavorite(e, product)}
                >
                  <Heart className={`h-3 w-3 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
              <div className="p-2 md:p-3">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-xs md:text-sm text-black leading-tight">{product.name}</h3>
                  <span className={`text-xs px-1 md:px-2 py-1 rounded-full ${getTypeColor(product.type)}`}>
                    {product.type}
                  </span>
                </div>
                <div>
                  <p className="text-black font-bold text-sm md:text-lg">{product.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <button 
          onClick={handleViewMore}
          className="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors"
        >
          Ver mais
        </button>
        <ArrowRight className="h-4 w-4 text-orange-600" />
      </div>
    </div>
  );
};

export default TopChoicesSection;
