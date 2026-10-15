import { ArrowLeft, Percent, Truck, Star, Hammer, Paintbrush, Zap, Droplets, HardHat, Ruler, Scissors, Leaf, Wrench, Flower, TrendingUp, Heart, Store } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { Header } from "@/components/header";
import { BottomNavigation } from "@/components/layout";
import { MoreModal } from "@/components/modals";
import { ProductSection, RentalSection } from "@/components/home";
import { contentService } from "@/services/contentService";
import type { Product } from "@/types";


const ProductCategory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { category } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const storeFilter = searchParams.get('store');
  const [activeCategory, setActiveCategory] = useState("Ofertas");

  const [cartItemCount, setCartItemCount] = useState(0);
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Categorias para as choicechips
  const categories = [
    { name: 'Ofertas', icon: Percent },
    { name: 'Serviços', icon: Wrench },
    { name: 'Destaques', icon: Star },
    { name: 'Mais vendidos', icon: TrendingUp },
    { name: 'Queridinhos', icon: Heart }
  ];
  
  // Mapeamento de URLs para filtros de categoria
  const categoryFilters: Record<string, { title: string; filter: (product: any) => boolean }> = {
    'destaques': {
      title: 'Destaque',
      filter: (p) => p.is_featured
    },
    'essenciais': {
      title: 'Essenciais da obra',
      filter: (p) => p.is_essential || p.category === 'Essenciais'
    },
    'telhas': {
      title: 'Telhas',
      filter: (p) => p.category === 'Telhas e Coberturas' || p.product_group === 'tiles'
    },
    'pintura': {
      title: 'Semana da pintura',
      filter: (p) => p.product_group === 'paint' || p.category === 'Pintura'
    },
    'decoracao': {
      title: 'Vibe Decoração',
      filter: (p) => p.product_group === 'decoration' || p.category === 'Decoração'
    },
    'top-escolhas': {
      title: 'Top escolhas pra você',
      filter: (p) => p.is_top_choice
    },
    'eletro': {
      title: 'Eletro',
      filter: (p) => p.product_group === 'electro' || p.category === 'Elétrica'
    },
    'hidraulica': {
      title: 'Hidráulica',
      filter: (p) => p.category === 'Hidráulica'
    },
    'eletrica': {
      title: 'Elétrica',
      filter: (p) => p.category === 'Elétrica' || p.product_group === 'electro'
    },
    'ferramentas': {
      title: 'Ferramentas',
      filter: (p) => p.category === 'Ferramentas'
    },
    'tintas': {
      title: 'Tintas',
      filter: (p) => p.category === 'Pintura' || p.product_group === 'paint'
    },
    'pisos': {
      title: 'Pisos',
      filter: (p) => p.category === 'Pisos e Revestimentos'
    },
    'iluminacao': {
      title: 'Iluminação',
      filter: (p) => p.category === 'Iluminação'
    },
    'jardim': {
      title: 'Jardim',
      filter: (p) => p.category === 'Jardim'
    }
  };

  const currentCategory = category && categoryFilters[category as keyof typeof categoryFilters];

  useEffect(() => {
    const loadCategoryProducts = async () => {
      if (!category || !currentCategory) return;
      
      try {
        setLoading(true);
        console.log(`📦 Carregando produtos da categoria: ${category}`);
        
        // Buscar todos os produtos do banco (já vêm ordenados por created_at DESC)
        const allProducts = await contentService.getProducts();
        
        // Filtrar produtos pela categoria
        const filteredProducts = allProducts.filter(currentCategory.filter);
        
        // Mapear para o formato esperado
        const mappedProducts = filteredProducts.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image_url,
          type: p.type as 'produto' | 'serviço' | 'decoração',
          category: p.category,
          rating: p.rating || 0,
          isOffer: p.is_offer || false
        }));
        
        console.log(`✅ ${mappedProducts.length} produtos carregados para categoria ${category}`);
        setProducts(mappedProducts);
      } catch (error) {
        console.error('❌ Erro ao carregar produtos da categoria:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryProducts();
  }, [category]); // Removido currentCategory da dependência para evitar loop

  if (!currentCategory) {
    navigate('/');
    return null;
  }

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (product: Product) => {
    setCartItemCount(prev => prev + 1);
    console.log("Produto adicionado ao carrinho:", product);
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleViewMoreRentals = () => {
    navigate('/categoria/locacoes');
  };

  const handleRentalItemClick = (item: any) => {
    console.log("Item de locação clicado:", item);
    navigate(`/locacao/${item.id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* CSS para esconder scrollbar */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        body {
          background-color: white !important;
        }
        html {
          background-color: white !important;
        }
        #root {
          background-color: white !important;
        }
        input, textarea, select {
          color: #111827 !important;
          background-color: white !important;
        }
      `}</style>
      <Header 
        cartItemCount={cartItemCount}
        onMenuClick={() => {
          // Evitar loop infinito - só navegar se não estiver na página de perfil
          if (location.pathname !== '/profile') {
            navigate('/profile');
          }
        }}
        onCartClick={() => console.log("Cart clicked")}
      />

      <main className="pt-[104px] sm:pt-20 pb-20 max-w-6xl mx-auto px-4">
        {/* Header com botão voltar */}
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-black">{currentCategory.title}</h1>
            {storeFilter && storeFilter !== 'todas' && (
              <div className="flex items-center gap-2 mt-1">
                <Store className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 capitalize">
                  Filtrado por: {storeFilter.replace('-', ' ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Seção de Locações - Apenas para categoria "essenciais" (Construir) */}
        {category === 'essenciais' && (
          <div className="mb-8">
            <RentalSection
              onViewMore={handleViewMoreRentals}
              onItemClick={handleRentalItemClick}
            />
          </div>
        )}

        {/* Produtos */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Carregando produtos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Nenhum produto encontrado nesta categoria.</p>
          </div>
        ) : (
          <ProductSection
            title=""
            products={products as any}
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
            className="mb-8"
          />
        )}

        {/* Prestadores de Serviços */}
        <div className="mb-6">
          <div className="flex items-center justify-between px-4 mb-4">
            <h3 className="text-xl font-semibold text-stone-950">Prestadores de Serviços</h3>
            <button 
              onClick={() => navigate('/servicos/todos')}
              className="text-orange-600 text-sm font-medium hover:text-orange-700 transition-colors"
            >
              Ver todos
            </button>
          </div>
          <div className="px-4">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {[
                { name: 'Pedreiro', icon: Hammer, category: 'pedreiro', id: 'pedreiro' },
                { name: 'Pintor', icon: Paintbrush, category: 'pintor', id: 'pintor' },
                { name: 'Eletricista', icon: Zap, category: 'eletricista', id: 'eletricista' },
                { name: 'Encanador', icon: Wrench, category: 'encanador', id: 'encanador' },
                { name: 'Engenheiro', icon: HardHat, category: 'engenheiro', id: 'engenheiro' },
                { name: 'Arquiteto', icon: Ruler, category: 'arquiteto', id: 'arquiteto' },
                { name: 'Marceneiro', icon: Scissors, category: 'marceneiro', id: 'marceneiro' },
                { name: 'Jardineiro', icon: Flower, category: 'jardineiro', id: 'jardineiro' }
              ].map((service, index) => {
                const IconComponent = service.icon;
                
                const getBackgroundColor = (categoryId: string) => {
                  switch (categoryId) {
                    case 'pedreiro':
                      return 'bg-orange-600';
                    case 'pintor':
                      return 'bg-orange-500';
                    case 'eletricista':
                      return 'bg-orange-400';
                    case 'encanador':
                      return 'bg-orange-300';
                    case 'engenheiro':
                      return 'bg-orange-500';
                    case 'arquiteto':
                      return 'bg-orange-400';
                    case 'marceneiro':
                      return 'bg-orange-300';
                    case 'jardineiro':
                      return 'bg-orange-700';
                    default:
                      return 'bg-orange-600';
                  }
                };
                
                return (
                  <button
                    key={index}
                    onClick={() => navigate(`/servicos/${service.category}`)}
                    className="flex-none w-28 h-32 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Parte superior com ícone */}
                    <div className={`h-16 flex items-center justify-center ${getBackgroundColor(service.id)}`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    {/* Parte inferior - Nome da categoria */}
                    <div className="h-16 flex items-center justify-center px-2 bg-white">
                      <span className="text-xs font-medium text-center leading-tight break-words text-gray-800">
                        {service.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Categorias Extras */}
        <div className="bg-white shadow-sm rounded-lg mb-8">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
              {categories.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveCategory(category.name)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                      activeCategory === category.name
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation 
        cartItemCount={cartItemCount}
        onHomeClick={() => navigate('/')}
        onFavoritesClick={() => navigate('/favoritos')}
        onCartClick={() => navigate('/carrinho')}
        onClipsClick={() => navigate('/clips')}
        onMoreClick={() => setIsMoreModalOpen(true)}
      />

      {/* More Modal */}
      <MoreModal 
        isOpen={isMoreModalOpen}
        onClose={() => setIsMoreModalOpen(false)}
      />
    </div>
  );
};

export default ProductCategory;