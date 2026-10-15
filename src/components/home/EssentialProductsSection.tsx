import React, { useState, useEffect } from 'react';
import { ArrowRight, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { contentService } from '@/services/contentService';
import { essentialProducts as fallbackProducts } from '@/data';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/contexts/FavoritesContext';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types';

interface EssentialProductsSectionProps {
  className?: string;
  onProductClick?: (product: Product) => void;
}

const EssentialProductsSection: React.FC<EssentialProductsSectionProps> = ({ 
  className = "", 
  onProductClick
}) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEssentialProducts = async () => {
      try {
        console.log('🔨 Carregando produtos essenciais do BANCO...');
        
        const dynamicProducts = await contentService.getProducts();
        if (dynamicProducts && dynamicProducts.length > 0) {
          const essentialProducts = dynamicProducts.filter(p => p.is_essential);
          
          // Ordenar por data de criação (mais novos primeiro) e limitar a 8
          const sortedProducts = essentialProducts
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
          
          console.log('✅ Produtos essenciais carregados (8 mais recentes):', dbProducts.length);
          setProducts(dbProducts.length > 0 ? dbProducts : fallbackProducts);
        } else {
          console.log('📋 Nenhum produto no banco, usando fallback');
          setProducts(fallbackProducts);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar produtos essenciais:', error);
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    loadEssentialProducts();

    // Realtime updates para produtos
    console.log('🎯 [EssentialProducts] Configurando realtime...');
    const channel = supabase
      .channel('essential-products-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dynamic_products'
        },
        (payload) => {
          console.log('⚡ [EssentialProducts] REALTIME UPDATE:', payload);
          loadEssentialProducts();
        }
      )
      .subscribe();

    // Listeners para atualizações do admin
    const handleContentUpdate = (event: CustomEvent) => {
      if (event.detail.section === 'essential' || event.detail.type === 'essential') {
        console.log('🔨 Recarregando produtos essenciais devido a atualização do admin...');
        loadEssentialProducts();
      }
    };

    const handleEssentialUpdate = () => {
      console.log('🔨 Evento específico de essenciais recebido, recarregando...');
      loadEssentialProducts();
    };

    const handleForceReload = (event: CustomEvent) => {
      if (event.detail.section === 'essential') {
        console.log('🔄 Força reload dos produtos essenciais...');
        loadEssentialProducts();
      }
    };

    const handleProductsUpdate = () => {
      console.log('📦 Evento de produtos atualizado, recarregando essenciais...');
      loadEssentialProducts();
    };

    window.addEventListener('contentUpdated', handleContentUpdate as EventListener);
    window.addEventListener('essentialSectionUpdated', handleEssentialUpdate);
    window.addEventListener('forceContentReload', handleForceReload as EventListener);
    window.addEventListener('adminContentUpdated', handleContentUpdate as EventListener);
    window.addEventListener('productsUpdated', handleProductsUpdate);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_content_updated' || e.key === 'essential_products_cache') {
        console.log('📱 Mudança detectada no localStorage, recarregando essenciais...');
        setTimeout(loadEssentialProducts, 500);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      console.log('🔌 [EssentialProducts] Desconectando realtime');
      supabase.removeChannel(channel);
      window.removeEventListener('contentUpdated', handleContentUpdate as EventListener);
      window.removeEventListener('essentialSectionUpdated', handleEssentialUpdate);
      window.removeEventListener('forceContentReload', handleForceReload as EventListener);
      window.removeEventListener('adminContentUpdated', handleContentUpdate as EventListener);
      window.removeEventListener('productsUpdated', handleProductsUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleViewMore = () => {
    navigate('/categoria/essenciais');
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
        <h2 className="text-xl font-bold text-black mb-4">Essenciais da obra</h2>
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
          .essential-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
          }
        }
        
        /* Desktop: Scroll horizontal */
        @media (min-width: 769px) {
          .essential-grid {
            display: flex;
            gap: 1rem;
            min-width: max-content;
            padding-bottom: 0.5rem;
          }
        }
      `}</style>

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-black">Essenciais da obra</h2>
      </div>
      
      <div className="md:overflow-x-auto md:scrollbar-hide">
        <div className="essential-grid">
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
                    console.warn('Erro ao carregar imagem do produto essencial:', product.name);
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=300&fit=crop';
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
                  <h3 className="font-medium text-xs text-black leading-tight">{product.name}</h3>
                  <span className={`text-xs px-1 md:px-2 py-1 rounded-full ${getTypeColor(product.type)}`}>
                    {product.type}
                  </span>
                </div>
                <div>
                  <p className="text-black font-bold text-xs md:text-sm">{product.price}</p>
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

export default EssentialProductsSection;
