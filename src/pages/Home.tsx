import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from 'lucide-react';
import { MainLayout } from "@/components/layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCart } from "@/hooks";
import {
  LocationSection, 
  BannerCarousel, 
  PromotionalSection, 
  CategoryChips, 
  ProductSection,
  NewsBanner,
  ServiceCategories,
  FeaturedProducts,
  PromotionalBanner,
  StoreCard,
  ClipsSection,
  PaintSection,
  TilesSection,
  DecorationSection,
  ServiceCategory
} from "@/components/home";
import EssentialProductsSection from "@/components/home/EssentialProductsSection";
import TopChoicesSection from "@/components/home/TopChoicesSection";
import type { Product } from "@/types";
import { contentService } from "@/services/contentService";
import { useBannerSync } from "@/hooks/useBannerSync";
import type { Banner } from "@/components/home/BannerCarousel";
import { 
  homeBanners, 
  homeCategories, 
  homeProducts, 
  homePromotions,
  serviceCategories,
  newsBannerData,
  featuredProducts,
  essentialProducts,
  smartHomeBanner,
  storeData
} from "@/data";

const Home = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { cartItemCount, addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState("ofertas");
  
  // Use the custom banner sync hook
  const { 
    banners: dynamicBanners, 
    newsBanner, 
    promotionalBanner, 
    isLoading: bannersLoading, 
    refreshBanners 
  } = useBannerSync(homeBanners);
  
  // Separate products by promotion status
  const promotionalProducts = homeProducts.filter(product => product.isOffer);
  const regularProducts = homeProducts.filter(product => !product.isOffer);

  // Load dynamic products
  useEffect(() => {
    const loadDynamicProducts = async () => {
      try {
        const products = await contentService.getProducts();
        
        console.log('Produtos dinâmicos carregados na Home:', products.length);
      } catch (error) {
        console.error('Erro ao carregar produtos dinâmicos:', error);
      }
    };

    loadDynamicProducts();
  }, []);

  const handleLocationConfirm = (cep: string) => {
    console.log("CEP confirmado:", cep);
    // TODO: Implement location logic
  };

  const handleBannerClick = (banner: Banner) => {
    console.log("Banner clicado:", banner);
    // TODO: Navigate to banner link or show modal
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    console.log("Categoria selecionada:", categoryId);
    // TODO: Filter products by category
  };

  const handleProductClick = (product: Product) => {
    console.log("Produto clicado:", product);
    // TODO: Navigate to product details
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    console.log("Produto adicionado ao carrinho:", product);
  };

  const handleNewsBannerClick = () => {
    console.log("Banner de novidades clicado");
    // TODO: Navigate to news page
  };

  const handleServiceCategoryClick = (category: ServiceCategory) => {
    console.log("Categoria de serviço clicada:", category);
    navigate(`/servicos/${category.id}`);
  };

  const handleSmartHomeBannerClick = () => {
    console.log("Banner Casa Inteligente clicado");
    // TODO: Navigate to smart home products
  };

  const handleStoreClick = () => {
    console.log("Loja clicada");
    // TODO: Navigate to store page
  };

  const handleViewMoreEssentials = () => {
    navigate('/categoria/essenciais');
  };

  const handleViewMoreTiles = () => {
    navigate('/categoria/telhas');
  };

  const handleViewMorePaint = () => {
    navigate('/categoria/pintura');
  };

  const handleViewMoreDecoration = () => {
    navigate('/categoria/decoracao');
  };

  const handleViewMoreTopChoices = () => {
    navigate('/categoria/top-escolhas');
  };

  // Debug: log mobile state
  useEffect(() => {
    console.log('🔍 Home.tsx - isMobile:', isMobile);
    console.log('🔍 Home.tsx - typeof isMobile:', typeof isMobile);
  }, [isMobile]);

  return (
    <MainLayout 
      showMobileSearch={isMobile}
      onMobileSearch={(query) => navigate(`/busca?q=${query}`)}
    >
      <LocationSection onLocationConfirm={handleLocationConfirm} />
      
      {/* Manual refresh button for banners */}
      <div className="flex justify-end px-4 py-2">
        <button
          onClick={refreshBanners}
          disabled={bannersLoading}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${bannersLoading ? 'animate-spin' : ''}`} />
          {bannersLoading ? 'Carregando...' : 'Atualizar Banners'}
        </button>
      </div>
      
      {!bannersLoading && (
        <BannerCarousel 
          banners={dynamicBanners.length > 0 ? dynamicBanners : homeBanners}
          onBannerClick={handleBannerClick}
        />
      )}
      
      <PromotionalSection items={homePromotions} />
      
      <div className="py-1"></div>
      
      <CategoryChips 
        categories={homeCategories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <NewsBanner 
        image={newsBanner?.image_url || newsBannerData.image}
        alt={newsBanner?.alt_text || newsBannerData.alt}
        onClick={handleNewsBannerClick}
      />

      <FeaturedProducts 
        products={featuredProducts}
        onProductClick={handleProductClick}
        onAddToCart={handleAddToCart}
      />

      <ServiceCategories 
        categories={serviceCategories}
        onCategoryClick={handleServiceCategoryClick}
      />
      
      <ProductSection 
        title="Promoções que constroem"
        products={promotionalProducts}
        onProductClick={handleProductClick}
        onAddToCart={handleAddToCart}
      />

      <EssentialProductsSection 
        className="mx-2 mb-6"
        onProductClick={handleProductClick}
      />

      <StoreCard 
        data={storeData}
        onClick={handleStoreClick}
        className="mx-2 mb-6"
      />

      {/* Seções específicas com sincronização automática do admin */}
      <TilesSection 
        className="mx-2 mb-6"
        onProductClick={handleProductClick}
      />

      <PaintSection 
        className="mx-2 mb-6"
        onProductClick={handleProductClick}
      />

      <DecorationSection 
        className="mx-2 mb-6"
        onProductClick={handleProductClick}
      />

      <PromotionalBanner 
        data={promotionalBanner ? {
          id: promotionalBanner.id.toString(),
          title: promotionalBanner.title,
          subtitle: promotionalBanner.description,
          description: promotionalBanner.description,
          price: "R$ 299,90",
          features: ["Frete Grátis", "Garantia", "Economia"],
          buttonText: promotionalBanner.button_text || "Ver Ofertas",
          gradient: "bg-gradient-to-r from-blue-500 to-purple-600",
          emoji: "🏠"
        } : smartHomeBanner}
        onClick={handleSmartHomeBannerClick}
        className="mx-2 mb-6"
      />

      <TopChoicesSection 
        className="mx-2 mb-6"
        onProductClick={handleProductClick}
      />

      <ClipsSection 
        className="mx-2 mb-6"
      />
    </MainLayout>
  );
};

export default Home;