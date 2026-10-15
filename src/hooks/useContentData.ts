import { useState, useEffect } from 'react';
import { contentService } from '@/services/contentService';
import { supabase } from '@/integrations/supabase/client';
import type { 
  DynamicBanner, 
  DynamicCategory, 
  DynamicProduct
} from '@/services/contentService';
import type { Banner } from '@/components/home/BannerCarousel';
import type { Product } from '@/types';

// Fallback para dados estáticos enquanto carrega
import { 
  homeBanners, 
  serviceCategories,
  newFeaturedProducts,
  newEssentialProducts,
  topChoices,
  roofTiles,
  paintWeek,
  newDecorationProducts,
  electroProducts
} from '@/data';

export interface ContentData {
  banners: Banner[];
  categories: DynamicCategory[];
  featuredProducts: Product[];
  essentialProducts: Product[];
  topChoices: Product[];
  roofTiles: Product[];
  paintWeek: Product[];
  decorationProducts: Product[];
  electroProducts: Product[];
  rentalProducts: Product[];
  clipsProducts: Product[];
  loading: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useContentData = (): ContentData => {

  const [data, setData] = useState<ContentData>({
    banners: homeBanners, // Banners estáticos como fallback
    categories: serviceCategories.map(cat => ({
      id: cat.id.toString(),
      label: cat.name,
      icon_name: 'Tag',
      is_active: true,
      order_index: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })),
    featuredProducts: newFeaturedProducts,
    essentialProducts: newEssentialProducts,
    topChoices: topChoices,
    roofTiles: roofTiles,
    paintWeek: paintWeek,
    decorationProducts: newDecorationProducts,
    electroProducts: electroProducts,
    rentalProducts: [],
    clipsProducts: [],
    loading: true,
    isLoading: true,
    error: null
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [refreshKey, setRefreshKey] = useState(0);

  // Função para forçar atualização dos banners - REMOVIDA refreshBanners
  // const refreshBanners = () => {
  //   setRefreshKey(prev => prev + 1);
  // };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setData(prev => ({ ...prev, loading: true, error: null }));

        console.log('Iniciando carregamento de dados dinâmicos...');

        // Carregar dados em paralelo com timeout
        const loadWithTimeout = async () => {
          const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout na conexão')), 10000)
          );
          
          return Promise.race([
            Promise.all([
              contentService.getBanners(),
              contentService.getCategories(),
              contentService.getProducts()
            ]),
            timeout
          ]);
        };

        const [banners, categories, products] = await loadWithTimeout() as [any[], any[], any[]];

        console.log('Dados carregados:', {
          banners: banners.length,
          categories: categories.length,
          products: products.length
        });

        // Buscar produtos marcados como destaque (is_featured = true) de ambas as tabelas
        let featuredProducts = [];
        try {
          // Buscar produtos do usuário (tabela products)
          const { data: userProducts, error: userError } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'active')
            .eq('approval_status', 'approved')
            .eq('is_featured', true)
            .limit(10);
          
          // Buscar produtos do sistema (tabela dynamic_products)
          const { data: systemProducts, error: systemError } = await supabase
            .from('dynamic_products')
            .select('*')
            .eq('is_active', true)
            .eq('is_featured', true)
            .limit(10);
          
          // Combinar produtos do usuário
          let userFeaturedProducts = [];
          if (!userError && userProducts) {
            userFeaturedProducts = userProducts.map((product: any) => ({
              id: product.id,
              name: product.title,
              price: `R$ ${product.price}`,
              image: product.images?.[0] || '',
              category: product.category,
              rating: 5.0,
              isOffer: false,
              type: product.product_type || 'produto'
            }));
          }
          
          // Combinar produtos do sistema
          let systemFeaturedProducts = [];
          if (!systemError && systemProducts) {
            systemFeaturedProducts = systemProducts.map((product: any) => ({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image_url || '',
              category: product.category,
              rating: product.rating || 5.0,
              isOffer: product.is_offer || false,
              type: product.type || 'produto'
            }));
          }
          
          // Combinar ambos os tipos de produtos
          featuredProducts = [...systemFeaturedProducts, ...userFeaturedProducts].slice(0, 10);
          
          console.log('Produtos em destaque carregados:', {
            sistema: systemFeaturedProducts.length,
            usuario: userFeaturedProducts.length,
            total: featuredProducts.length
          });
          
          // Se não encontrou nenhum produto, usar fallback
          if (featuredProducts.length === 0) {
            console.warn('Nenhum produto em destaque encontrado, usando fallback');
            featuredProducts = products.filter(p => p.is_featured).slice(0, 10);
          }
        } catch (error) {
          console.warn('Erro ao buscar produtos em destaque, usando fallback:', error);
          featuredProducts = products.filter(p => p.is_featured).slice(0, 10);
        }
        const essentialProducts = products.filter(p => p.is_essential).slice(0, 10);
        const topChoicesProducts = products.filter(p => p.is_top_choice).slice(0, 10);
        const roofTilesProducts = products.filter(p => p.category === 'Telhas e Coberturas').slice(0, 10);
        // Corrigido para usar product_group = 'paint' que é como os produtos são salvos no admin
        const paintWeekProducts = products.filter(p => p.product_group === 'paint').slice(0, 10);
        console.log('🎨 Produtos de pintura carregados na home:', {
          total: products.length,
          filtrados: paintWeekProducts.length,
          produtos: paintWeekProducts.map(p => ({ id: p.id, name: p.name, product_group: p.product_group }))
        });
        const decorationProductsFiltered = products.filter(p => p.product_group === 'decoration' || p.type === 'decoração').slice(0, 10);
        console.log('✨ Produtos de decoração carregados na home:', {
          total: products.length,
          filtrados: decorationProductsFiltered.length,
          produtos: decorationProductsFiltered.map(p => ({ id: p.id, name: p.name, product_group: p.product_group, type: p.type }))
        });
        
        const electroProductsFiltered = products.filter(p => p.is_electro || p.category === 'Ferramentas').slice(0, 10);
        
        const rentalProductsFiltered = products.filter(p => p.type === 'locação' || p.product_group === 'rental').slice(0, 10);
        console.log('🚛 Produtos de locação carregados na home:', {
          total: products.length,
          filtrados: rentalProductsFiltered.length,
          produtos: rentalProductsFiltered.map(p => ({ id: p.id, name: p.name, type: p.type, product_group: p.product_group }))
        });
        
        const clipsProductsFiltered = products.filter(p => p.type === 'video' || p.product_group === 'clips').slice(0, 10);
        console.log('🎬 Produtos de clips carregados na home:', {
          total: products.length,  
          filtrados: clipsProductsFiltered.length,
          produtos: clipsProductsFiltered.map(p => ({ id: p.id, name: p.name, type: p.type, product_group: p.product_group }))
        });

        // Usar dados dinâmicos se disponíveis, senão usar fallbacks
        setData({
          banners: banners.length > 0 ? banners : homeBanners,
          categories: categories.length > 0 ? categories.map(cat => ({
            id: cat.id,
            label: cat.label,
            icon_name: cat.icon_name,
            is_active: cat.is_active,
            order_index: cat.order_index,
            created_at: cat.created_at,
            updated_at: cat.updated_at
          })) : serviceCategories.map(cat => ({
            id: cat.id.toString(),
            label: cat.name,
            icon_name: 'Tag',
            is_active: true,
            order_index: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })),
          featuredProducts: featuredProducts.length > 0 ? featuredProducts : newFeaturedProducts,
          essentialProducts: essentialProducts.length > 0 ? essentialProducts : newEssentialProducts,
          topChoices: topChoicesProducts.length > 0 ? topChoicesProducts : topChoices,
          roofTiles: roofTilesProducts.length > 0 ? roofTilesProducts : roofTiles,
          paintWeek: paintWeekProducts.length > 0 ? paintWeekProducts : paintWeek,
          decorationProducts: decorationProductsFiltered.length > 0 ? decorationProductsFiltered : newDecorationProducts,
          electroProducts: electroProductsFiltered.length > 0 ? electroProductsFiltered : electroProducts,
          rentalProducts: rentalProductsFiltered.length > 0 ? rentalProductsFiltered : [],
          clipsProducts: clipsProductsFiltered.length > 0 ? clipsProductsFiltered : [],
          loading: false,
          isLoading: false,
          error: null
        });
        setIsLoading(false);

        console.log('Dados carregados com sucesso!');
      } catch (error) {
        console.error('Erro ao carregar dados dinâmicos:', {
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          details: error
        });

        // Em caso de erro, usar dados estáticos como fallback
        setData({
          banners: homeBanners,
          categories: serviceCategories.map(cat => ({
            id: cat.id.toString(),
            label: cat.name,
            icon_name: 'Tag',
            is_active: true,
            order_index: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })),
          featuredProducts: newFeaturedProducts,
          essentialProducts: newEssentialProducts,
          topChoices: topChoices,
          roofTiles: roofTiles,
          paintWeek: paintWeek,
          decorationProducts: newDecorationProducts,
          electroProducts: electroProducts,
          rentalProducts: [],
          clipsProducts: [],
          loading: false,
          isLoading: false,
          error: 'Conexão com servidor indisponível. Usando dados offline.'
        });
        setIsLoading(false);
      }
    };

    loadData();
  }, [refreshKey]); // Recarrega quando refreshKey muda

  // Escutar eventos de atualização de banner do admin
  useEffect(() => {
    const handleBannerUpdate = (event?: any) => {
      console.log('🔄 Banner atualizado detectado - recarregando dados IMEDIATAMENTE...');
      setRefreshKey(prev => prev + 1);
    };

    // Escutar eventos específicos de diferentes tipos de conteúdo
    const handleContentUpdate = (event: any) => {
      console.log('🔄 Conteúdo atualizado:', event.detail);
      console.log('🔄 Forçando refresh dos dados IMEDIATAMENTE...');
      setRefreshKey(prev => prev + 1);
    };
    
    const handleProductCreated = (event: any) => {
      console.log('🆕 Produto criado detectado:', event.detail);
      console.log('🔄 Recarregando dados da página principal IMEDIATAMENTE...');
      setRefreshKey(prev => prev + 1);
    };
    
    const handleProductUpdated = (event: any) => {
      console.log('✏️ Produto atualizado detectado:', event.detail);
      console.log('🔄 Recarregando dados da página principal IMEDIATAMENTE...');
      setRefreshKey(prev => prev + 1);
    };
    
    const handleForceContentReload = (event: any) => {
      console.log('🚀 Forçamento de recarregamento detectado:', event.detail);
      console.log('🔄 Executando recarregamento forçado da página principal IMEDIATAMENTE...');
      setRefreshKey(prev => prev + 1);
    };

    // Escutar mudanças no localStorage de outras abas (admin)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_content_updated') {
        console.log('🔄 Mudança detectada via localStorage - recarregando IMEDIATAMENTE...');
        setRefreshKey(prev => prev + 1);
      }
    };
    
    // NOVO: Escutar eventos específicos do admin
    const handleAdminContentSaved = (event: any) => {
      console.log('💾 Conteúdo salvo no admin detectado:', event.detail);
      setRefreshKey(prev => prev + 1);
    };
    
    const handleAdminContentDeleted = (event: any) => {
      console.log('🗑️ Conteúdo deletado no admin detectado:', event.detail);  
      setRefreshKey(prev => prev + 1);
    };
    
    const handleCarouselForceReload = (event: any) => {
      console.log('🎠 Forçamento específico do carrossel detectado:', event.detail);
      setRefreshKey(prev => prev + 1);
    };
    
    const handlePaintSectionUpdated = (event: any) => {
      console.log('🎨 Seção de pintura atualizada detectada:', event.detail);
      setRefreshKey(prev => prev + 1);
    };
    
    const handleRentalSectionUpdated = (event: any) => {
      console.log('🚛 Seção de locação atualizada detectada:', event.detail);
      setRefreshKey(prev => prev + 1);
    };
    
    const handleEssentialSectionUpdated = (event: any) => {
      console.log('🏗️ Seção essenciais atualizada detectada:', event.detail);
      setRefreshKey(prev => prev + 1);
    };
    
    const handleTilesSectionUpdated = (event: any) => {
      console.log('🏠 Seção telhas atualizada detectada:', event.detail);
      setRefreshKey(prev => prev + 1);
    };
    
    const handleDecorationSectionUpdated = (event: any) => {
      console.log('✨ Seção decoração atualizada detectada:', event.detail);
      setRefreshKey(prev => prev + 1);
    };
    
    const handleTopChoicesSectionUpdated = (event: any) => {
      console.log('⭐ Seção top choices atualizada detectada:', event.detail);
      setRefreshKey(prev => prev + 1);
    };
    
    const handleClipsSectionUpdated = (event: any) => {
      console.log('🎬 Seção clips atualizada detectada:', event.detail);
      setRefreshKey(prev => prev + 1);
    };
    
    const handleFeaturedSectionUpdated = (event: any) => {
      console.log('⭐ Seção destaques atualizada detectada:', event.detail);
      setRefreshKey(prev => prev + 1);
    };

    // Registrar todos os listeners
    window.addEventListener('bannerUpdated', handleBannerUpdate);
    window.addEventListener('contentUpdated', handleContentUpdate);
    window.addEventListener('productUpdated', handleProductUpdated);
    window.addEventListener('productCreated', handleProductCreated);
    window.addEventListener('productDeleted', handleBannerUpdate);
    window.addEventListener('forceContentReload', handleForceContentReload);
    window.addEventListener('storage', handleStorageChange);
    
    // NOVO: Registrar listeners específicos do admin
    window.addEventListener('adminContentSaved', handleAdminContentSaved);
    window.addEventListener('adminContentDeleted', handleAdminContentDeleted);
    window.addEventListener('carouselForceReload', handleCarouselForceReload);
    window.addEventListener('paintSectionUpdated', handlePaintSectionUpdated);
    window.addEventListener('rentalSectionUpdated', handleRentalSectionUpdated);
    window.addEventListener('essentialSectionUpdated', handleEssentialSectionUpdated);
    window.addEventListener('tilesSectionUpdated', handleTilesSectionUpdated);
    window.addEventListener('decorationSectionUpdated', handleDecorationSectionUpdated);
    window.addEventListener('topChoicesSectionUpdated', handleTopChoicesSectionUpdated);
    window.addEventListener('clipsSectionUpdated', handleClipsSectionUpdated);
    window.addEventListener('featuredSectionUpdated', handleFeaturedSectionUpdated);
    
    // Debug: verificar se os eventos estão sendo disparados
    console.log('👂 Listeners de atualização registrados');
    
    // Verificar atualizações menos frequentes como fallback (reduzido de 30s para 10s)
    const interval = setInterval(() => {
      console.log('⏰ Refresh automático a cada 15s - verificando...');
      setRefreshKey(prev => prev + 1);
    }, 15000); // 15 segundos

    return () => {
      window.removeEventListener('bannerUpdated', handleBannerUpdate);
      window.removeEventListener('contentUpdated', handleContentUpdate);
      window.removeEventListener('productUpdated', handleProductUpdated);
      window.removeEventListener('productCreated', handleProductCreated);
      window.removeEventListener('productDeleted', handleBannerUpdate);
      window.removeEventListener('forceContentReload', handleForceContentReload);
      window.removeEventListener('storage', handleStorageChange);
      
      // NOVO: Remover listeners específicos do admin
      window.removeEventListener('adminContentSaved', handleAdminContentSaved);
      window.removeEventListener('adminContentDeleted', handleAdminContentDeleted);
      window.removeEventListener('carouselForceReload', handleCarouselForceReload);
      window.removeEventListener('paintSectionUpdated', handlePaintSectionUpdated);
      window.removeEventListener('rentalSectionUpdated', handleRentalSectionUpdated);
      window.removeEventListener('essentialSectionUpdated', handleEssentialSectionUpdated);
      window.removeEventListener('tilesSectionUpdated', handleTilesSectionUpdated);
      window.removeEventListener('decorationSectionUpdated', handleDecorationSectionUpdated);
      window.removeEventListener('topChoicesSectionUpdated', handleTopChoicesSectionUpdated);
      window.removeEventListener('clipsSectionUpdated', handleClipsSectionUpdated);
      window.removeEventListener('featuredSectionUpdated', handleFeaturedSectionUpdated);
      clearInterval(interval);
      console.log('🧹 Listeners de atualização removidos');
    };
  }, []);

  return data;
};

// Hook específico para banners
export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>(homeBanners);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        setLoading(true);
        const data = await contentService.getBanners();
        setBanners(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar banners:', err);
        setError('Erro ao carregar banners');
        // Manter dados estáticos como fallback
      } finally {
        setLoading(false);
      }
    };

    loadBanners();
  }, []);

  return { banners, loading, error };
};

// Hook específico para categorias
export const useCategories = () => {
  const [categories, setCategories] = useState<DynamicCategory[]>(
    serviceCategories.map(cat => ({
      id: cat.id.toString(),
      label: cat.name,
      icon_name: 'Tag',
      is_active: true,
      order_index: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await contentService.getCategories();
        setCategories(data.map(cat => ({
          id: cat.id.toString(),
          label: cat.label,
          icon_name: cat.icon_name,
          is_active: cat.is_active,
          order_index: cat.order_index,
          created_at: cat.created_at,
          updated_at: cat.updated_at
        })));
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
        setError('Erro ao carregar categorias');
        // Manter dados estáticos como fallback
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return { categories, loading, error };
};

// Hook específico para produtos por categoria
export const useProductsByCategory = (category: string, limit: number = 10) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await contentService.getProducts();
        const filtered = data
          .filter(p => p.category === category)
          .slice(0, limit);
        setProducts(filtered);
        setError(null);
      } catch (err) {
        console.error(`Erro ao carregar produtos da categoria ${category}:`, err);
        setError('Erro ao carregar produtos');
        // Usar dados estáticos como fallback baseado na categoria
        const fallbackData = getFallbackProductsByCategory(category);
        setProducts(fallbackData.slice(0, limit));
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [category, limit]);

  return { products, loading, error };
};


// Função auxiliar para fallback de produtos
const getFallbackProductsByCategory = (category: string): any[] => {
  switch (category) {
    case 'essenciais':
      return newEssentialProducts;
    case 'top-escolhas':
      return topChoices;
    case 'telhas':
      return roofTiles;
    case 'pintura':
      return paintWeek;
    case 'decoracao':
      return newDecorationProducts;
    case 'eletro':
      return electroProducts;
    default:
      return newFeaturedProducts;
  }
};