import React, { useState, useEffect } from 'react';
import { ArrowRight, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { contentService } from '@/services/contentService';
import { paintWeek } from '@/data';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/contexts/FavoritesContext';
import type { Product } from '@/types';

interface PaintSectionProps {
  className?: string;
  onProductClick?: (product: Product) => void;
}

const PaintSection: React.FC<PaintSectionProps> = ({ 
  className = "", 
  onProductClick
}) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPaintProducts = async () => {
      try {
        console.log('🎨 [PaintSection] Carregando produtos de pintura do BANCO...');
        
        const dynamicProducts = await contentService.getProducts();
        console.log('🎨 [PaintSection] Produtos recebidos do contentService:', dynamicProducts.length);
        
        if (dynamicProducts && dynamicProducts.length > 0) {
          const paintProducts = dynamicProducts.filter(p => 
            p.product_group === 'paint' || p.category === 'Pintura'
          );
          
          console.log('🎨 [PaintSection] Produtos de pintura filtrados:', paintProducts.length);
          
          // Ordenar por data de criação (mais novos primeiro) e limitar a 8
          const sortedProducts = paintProducts
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
          
          console.log('✅ [PaintSection] Produtos de pintura mapeados (8 mais recentes):', dbProducts.length);
          setProducts(dbProducts.length > 0 ? dbProducts : paintWeek);
        } else {
          console.log('📋 [PaintSection] Nenhum produto no banco, usando fallback');
          setProducts(paintWeek);
        }
      } catch (error) {
        console.error('❌ [PaintSection] Erro ao carregar produtos de pintura:', error);
        setProducts(paintWeek);
      } finally {
        setLoading(false);
      }
    };

    loadPaintProducts();

    // ⚡ SUPABASE REALTIME - Sincronização automática com o banco
    console.log('⚡ [PaintSection] Configurando Supabase Realtime para dynamic_products...');
    const channel = supabase
      .channel('paint-products-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // UPDATE, INSERT, DELETE
          schema: 'public',
          table: 'dynamic_products',
          filter: 'product_group=eq.paint'
        },
        (payload) => {
          console.log('⚡ [PaintSection] REALTIME UPDATE RECEBIDO:', {
            eventType: payload.eventType,
            table: payload.table,
            new: payload.new,
            old: payload.old
          });
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            console.log('🔄 [PaintSection] Recarregando produtos devido a atualização REALTIME do banco...');
            loadPaintProducts();
          }
        }
      )
      .subscribe((status) => {
        console.log('⚡ [PaintSection] Status da inscrição Realtime:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ [PaintSection] Realtime CONECTADO e ouvindo atualizações!');
        }
      });

    // Setup do BroadcastChannel para comunicação entre abas/páginas (fallback)
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      broadcastChannel = new BroadcastChannel('admin-updates');
      console.log('📡 [PaintSection] BroadcastChannel configurado');
      
      broadcastChannel.onmessage = (event) => {
        console.log('📨 [PaintSection] Mensagem recebida via BroadcastChannel:', event.data);
        if (event.data.section === 'paint' || event.data.type === 'paint') {
          console.log('🎨 [PaintSection] ✅ Recarregando produtos devido a atualização via BroadcastChannel...');
          loadPaintProducts();
        }
      };
    } catch (error) {
      console.warn('[PaintSection] BroadcastChannel não suportado:', error);
    }

    // Listeners para atualizações do admin (mesma aba/página)
    const handleContentUpdate = (event: CustomEvent) => {
      console.log('🔔 [PaintSection] Evento contentUpdated recebido:', event.detail);
      if (event.detail.section === 'paint' || event.detail.type === 'paint') {
        console.log('🎨 [PaintSection] ✅ Recarregando produtos de pintura devido a atualização do admin...');
        loadPaintProducts();
      } else {
        console.log('🎨 [PaintSection] ⏭️ Evento ignorado - seção diferente:', event.detail.section || event.detail.type);
      }
    };

    const handlePaintUpdate = () => {
      console.log('🔔 [PaintSection] Evento paintSectionUpdated recebido, recarregando...');
      loadPaintProducts();
    };

    const handleForceReload = (event: CustomEvent) => {
      console.log('🔔 [PaintSection] Evento forceContentReload recebido:', event.detail);
      if (event.detail.section === 'paint') {
        console.log('🔄 [PaintSection] ✅ Força reload dos produtos de pintura...');
        loadPaintProducts();
      } else {
        console.log('🎨 [PaintSection] ⏭️ ForceReload ignorado - seção diferente:', event.detail.section);
      }
    };

    const handlePaintProductUpdate = (event: CustomEvent) => {
      console.log('🔔 [PaintSection] Evento paintProductUpdated recebido:', event.detail);
      loadPaintProducts();
    };

    const handleAdminUpdate = (event: CustomEvent) => {
      console.log('🔔 [PaintSection] Evento adminContentUpdated recebido:', event.detail);
      if (event.detail.section === 'paint') {
        console.log('🎨 [PaintSection] ✅ Recarregando devido a adminContentUpdated...');
        loadPaintProducts();
      }
    };

    // Listener para localStorage (fallback)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_content_updated' || e.key === 'paint_products_cache') {
        console.log('📦 [PaintSection] Mudança detectada via localStorage, recarregando...');
        setTimeout(loadPaintProducts, 500);
      }
    };

    // Adicionar listeners para diferentes tipos de eventos
    console.log('👂 [PaintSection] Registrando listeners de eventos...');
    console.log('👂 [PaintSection] Timestamp de montagem:', new Date().toISOString());
    window.addEventListener('contentUpdated', handleContentUpdate as EventListener);
    window.addEventListener('paintSectionUpdated', handlePaintUpdate);
    window.addEventListener('forceContentReload', handleForceReload as EventListener);
    window.addEventListener('adminContentUpdated', handleAdminUpdate as EventListener);
    window.addEventListener('paintProductUpdated', handlePaintProductUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);
    console.log('✅ [PaintSection] Todos os listeners registrados');

    return () => {
      console.log('🧹 [PaintSection] Limpando listeners...');
      
      // Desinscrever do canal Realtime
      supabase.removeChannel(channel);
      console.log('⚡ [PaintSection] Realtime desconectado');
      
      // Remover event listeners
      window.removeEventListener('contentUpdated', handleContentUpdate as EventListener);
      window.removeEventListener('paintSectionUpdated', handlePaintUpdate);
      window.removeEventListener('forceContentReload', handleForceReload as EventListener);
      window.removeEventListener('adminContentUpdated', handleAdminUpdate as EventListener);
      window.removeEventListener('paintProductUpdated', handlePaintProductUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      
      if (broadcastChannel) {
        broadcastChannel.close();
        console.log('📡 [PaintSection] BroadcastChannel fechado');
      }
    };
  }, []);

  const handleViewMore = () => {
    navigate('/categoria/pintura');
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
        <h2 className="text-xl font-bold text-black mb-4">Semana da pintura</h2>
        <p className="text-gray-600">Carregando produtos...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={`mb-3 bg-gray-50 rounded-lg p-2 ${className}`}>
      {/* CSS para esconder scrollbar e layout responsivo */}
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
          .paint-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
          }
        }
        
        /* Desktop: Scroll horizontal */
        @media (min-width: 769px) {
          .paint-grid {
            display: flex;
            gap: 1rem;
            min-width: max-content;
            padding-bottom: 0.5rem;
          }
        }
      `}</style>

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-black">Semana da pintura</h2>
      </div>
      
      <div className="md:overflow-x-auto md:scrollbar-hide">
        <div className="paint-grid">
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
                    console.warn('Erro ao carregar imagem do produto de pintura:', product.name);
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop';
                  }}
                />
                {/* Botão de Favoritos */}
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
      
      {/* Botão Ver mais */}
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

export default PaintSection;