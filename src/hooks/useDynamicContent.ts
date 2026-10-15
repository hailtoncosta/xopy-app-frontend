import { useState, useEffect, useCallback } from 'react';
import { contentService, type DynamicBanner, type DynamicProduct } from '@/services/contentService';

interface ContentState {
  banners: DynamicBanner[];
  products: DynamicProduct[];
  loading: boolean;
  error: string | null;
}

interface UseContentFilters {
  productGroup?: string;
  category?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isEssential?: boolean;
  isTopChoice?: boolean;
  isOffer?: boolean;
}

export const useDynamicContent = (filters?: UseContentFilters) => {
  const [state, setState] = useState<ContentState>({
    banners: [],
    products: [],
    loading: true,
    error: null
  });

  const loadContent = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const [banners, products] = await Promise.all([
        contentService.getBanners(),
        contentService.getProducts()
      ]);

      // Filtrar produtos se necessário
      let filteredProducts = products;
      
      if (filters) {
        filteredProducts = products.filter(product => {
          if (filters.productGroup && product.product_group !== filters.productGroup) return false;
          if (filters.category && !product.category?.toLowerCase().includes(filters.category.toLowerCase())) return false;
          if (filters.isActive !== undefined && product.is_active !== filters.isActive) return false;
          if (filters.isFeatured !== undefined && product.is_featured !== filters.isFeatured) return false;
          if (filters.isEssential !== undefined && product.is_essential !== filters.isEssential) return false;
          if (filters.isTopChoice !== undefined && product.is_top_choice !== filters.isTopChoice) return false;
          if (filters.isOffer !== undefined && product.is_offer !== filters.isOffer) return false;
          return true;
        });
      }

      setState({
        banners: banners.filter(b => b.is_active),
        products: filteredProducts.filter(p => p.is_active),
        loading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar conteúdo'
      }));
    }
  }, [filters]);

  const refreshContent = useCallback(() => {
    loadContent();
  }, [loadContent]);

  // Escutar eventos de atualização
  useEffect(() => {
    const handleContentUpdate = () => {
      refreshContent();
    };

    window.addEventListener('bannerUpdated', handleContentUpdate);
    return () => window.removeEventListener('bannerUpdated', handleContentUpdate);
  }, [refreshContent]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  return {
    ...state,
    refreshContent
  };
};

// Hook específico para carrossel
export const useCarouselBanners = () => {
  return useDynamicContent();
};

// Hook específico para produtos em destaque
export const useFeaturedProducts = () => {
  return useDynamicContent({ isFeatured: true });
};

// Hook específico para produtos essenciais
export const useEssentialProducts = () => {
  return useDynamicContent({ isEssential: true });
};

// Hook específico para produtos de pintura
export const usePaintProducts = () => {
  return useDynamicContent({ productGroup: 'paint' });
};

// Hook específico para produtos de decoração
export const useDecorationProducts = () => {
  return useDynamicContent({ productGroup: 'decoration' });
};

// Hook específico para top choices
export const useTopChoicesProducts = () => {
  return useDynamicContent({ isTopChoice: true });
};

// Hook específico para telhas
export const useTilesProducts = () => {
  return useDynamicContent({ category: 'telha' });
};

// Hook específico para ofertas
export const useOfferProducts = () => {
  return useDynamicContent({ isOffer: true });
};