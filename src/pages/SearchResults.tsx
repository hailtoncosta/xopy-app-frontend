import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Grid, List } from 'lucide-react';
import { Header } from '@/components/header';
import { BottomNavigation } from '@/components/layout';
import {
  homeProducts,
  featuredProducts,
  essentialProducts,
  tilesProducts,
  paintProducts,
  decorationProducts,
  topChoicesProducts
} from '@/data/products';
import {
  newFeaturedProducts,
  newEssentialProducts,
  topChoices,
  roofTiles,
  paintWeek,
  newDecorationProducts,
  electroProducts
} from '@/data/newProducts';

interface SearchProduct {
  id: number;
  name: string;
  price: string;
  originalPrice?: string;
  image: string;
  category?: string;
  type?: string;
  description?: string;
  rating?: number;
  reviews?: number;
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const query = searchParams.get('q') || '';

  const [filteredProducts, setFilteredProducts] = useState<SearchProduct[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [cartItemCount] = useState(3);

  // Categorias de prestadores de serviços
  const serviceProviderCategories = [
    { id: 'pedreiro', name: 'Pedreiro' },
    { id: 'pintor', name: 'Pintor' },
    { id: 'eletricista', name: 'Eletricista' },
    { id: 'encanador', name: 'Encanador' },
    { id: 'engenheiro', name: 'Engenheiro' },
    { id: 'arquiteto', name: 'Arquiteto' },
    { id: 'marceneiro', name: 'Marceneiro' }
  ];

  // Verificar se a busca corresponde a um prestador de serviços
  const matchedServiceProvider = serviceProviderCategories.find(
    cat => cat.id === query.toLowerCase() || cat.name.toLowerCase() === query.toLowerCase()
  );

  // Combinar todos os produtos
  const allProducts = [
    ...homeProducts,
    ...featuredProducts,
    ...essentialProducts,
    ...tilesProducts,
    ...paintProducts,
    ...decorationProducts,
    ...topChoicesProducts,
    ...newFeaturedProducts,
    ...newEssentialProducts,
    ...topChoices,
    ...roofTiles,
    ...paintWeek,
    ...newDecorationProducts,
    ...electroProducts
  ];

  useEffect(() => {
    if (query) {
      const filtered = allProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(query.toLowerCase())) ||
        (product.type && product.type.toLowerCase().includes(query.toLowerCase()))
      );

      // Converter para SearchProduct e ordenar resultados
      let sorted = [...filtered].map(product => ({
        ...product,
        category: product.category || product.type || 'Produto'
      }));

      switch (sortBy) {
        case 'price-low':
          sorted.sort((a, b) => {
            const priceA = parseFloat(a.price.replace(/[^\d,]/g, '').replace(',', '.'));
            const priceB = parseFloat(b.price.replace(/[^\d,]/g, '').replace(',', '.'));
            return priceA - priceB;
          });
          break;
        case 'price-high':
          sorted.sort((a, b) => {
            const priceA = parseFloat(a.price.replace(/[^\d,]/g, '').replace(',', '.'));
            const priceB = parseFloat(b.price.replace(/[^\d,]/g, '').replace(',', '.'));
            return priceB - priceA;
          });
          break;
        case 'name':
          sorted.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default:
          // Relevância (manter ordem original)
          break;
      }

      // @ts-ignore
      setFilteredProducts(sorted);
    }
  }, [query, sortBy]);

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formatPrice = (price: string) => {
    // Se já está formatado, retorna como está
    if (price.includes('R$')) {
      return price;
    }

    // Caso contrário, formata
    const numericPrice = parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.'));
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericPrice);
  };

  const renderProductGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
      {filteredProducts.map((product) => (
        <div
          key={product.id}
          onClick={() => handleProductClick(product.id)}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="aspect-square bg-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
              {product.name}
            </h3>
            <div className="space-y-1">
              {product.originalPrice && (
                <p className="text-xs text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </p>
              )}
              <p className="text-lg font-bold text-orange-600">
                {product.price}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderProductList = () => (
    <div className="space-y-4 p-4">
      {filteredProducts.map((product) => (
        <div
          key={product.id}
          onClick={() => handleProductClick(product.id)}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex">
            <div className="w-24 h-24 bg-gray-100 flex-shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 p-4">
              <h3 className="text-base font-medium text-gray-900 mb-2">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {product.description || product.category}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  {product.originalPrice && (
                    <p className="text-sm text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </p>
                  )}
                  <p className="text-lg font-bold text-orange-600">
                    {product.price}
                  </p>
                </div>
                {product.rating && (
                  <div className="text-sm text-gray-500">
                    ⭐ {product.rating} ({product.reviews})
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header
        cartItemCount={cartItemCount}
        onCartClick={() => navigate('/carrinho')}
        onMenuClick={() => {
          // Evitar loop infinito - só navegar se não estiver na página de perfil
          if (location.pathname !== '/profile') {
            navigate('/profile');
          }
        }}
      />

      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 pt-[104px] sm:pt-16">
        <div className="flex items-center p-4">
          <button onClick={handleBack} className="mr-3">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">
              Resultados para "{query}"
            </h1>
            <p className="text-sm text-gray-600">
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="relevance">Relevância</option>
              <option value="price-low">Menor preço</option>
              <option value="price-high">Maior preço</option>
              <option value="name">Nome A-Z</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-600'
                }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-600'
                }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 pb-20">
        {/* Service Provider Suggestion Card */}
        {matchedServiceProvider && (
          <div className="p-4">
            <div
              onClick={() => navigate(`/servicos/${matchedServiceProvider.id}`)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-white text-lg font-bold mb-2">
                    🔧 Procurando por {matchedServiceProvider.name}?
                  </h3>
                  <p className="text-orange-100 text-sm mb-3">
                    Encontre profissionais qualificados na nossa seção de Prestadores de Serviços
                  </p>
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-semibold">
                    Ver Prestadores
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Search className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {matchedServiceProvider ? 'Nenhum produto encontrado' : 'Nenhum resultado encontrado'}
            </h2>
            <p className="text-gray-600 text-center mb-6">
              {matchedServiceProvider
                ? `Não encontramos produtos para "${query}", mas você pode encontrar prestadores de serviços acima.`
                : `Não encontramos resultados para "${query}". Tente buscar por outros termos.`
              }
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Voltar ao início
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? renderProductGrid() : renderProductList()}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        cartItemCount={cartItemCount}
        onHomeClick={() => navigate('/')}
        onFavoritesClick={() => navigate('/favoritos')}
        onCartClick={() => navigate('/carrinho')}
        onClipsClick={() => navigate('/clips')}
        onMoreClick={() => { }}
      />
    </div>
  );
};

export default SearchResults;