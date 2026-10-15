import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Flame, Tag, Clock, Star } from 'lucide-react';
import { Header } from '@/components/header';
import { BottomNavigation } from '@/components/layout';
import { contentService } from '@/services/contentService';

interface OfferProduct {
  id: number;
  name: string;
  price: string;
  originalPrice?: string;
  discount: number;
  image: string;
  category?: string;
  type?: string;
  rating?: number;
  timeLeft?: string;
}

const Offers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItemCount] = useState(3);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [offerProducts, setOfferProducts] = useState<OfferProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      console.log('🔥 Carregando ofertas da página...');
      
      const allProducts = await contentService.getProducts();
      const offers = allProducts.filter(p => p.is_offer && p.is_active);
      
      const mappedOffers: OfferProduct[] = offers.map(product => {
        const currentPrice = parseFloat(product.price.replace(/[^\d,]/g, '').replace(',', '.'));
        const discount = product.discount || 20;
        const originalPrice = currentPrice / (1 - discount / 100);
        
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: `R$ ${originalPrice.toFixed(2).replace('.', ',')}`,
          discount: discount,
          image: product.image_url,
          category: product.category || 'Produto',
          type: product.type,
          rating: product.rating || 4.5,
          timeLeft: '2h 30m' // Pode ser dinâmico no futuro
        };
      });
      
      console.log(`✅ ${mappedOffers.length} ofertas carregadas`);
      setOfferProducts(mappedOffers);
    } catch (error) {
      console.error('❌ Erro ao carregar ofertas:', error);
      setOfferProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'Todas' },
    { id: 'produto', name: 'Materiais' },
    { id: 'decoração', name: 'Decoração' },
    { id: 'eletro', name: 'Ferramentas' }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? offerProducts 
    : offerProducts.filter(product => product.type === selectedCategory);

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

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

      {/* Offer Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white pt-[104px] sm:pt-16">
        <div className="flex items-center p-4">
          <button onClick={handleBack} className="mr-3">
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-6 w-6" />
              <h1 className="text-xl font-bold">Super Ofertas</h1>
            </div>
            <p className="text-white/90 text-sm">Até 50% OFF em materiais selecionados</p>
          </div>
        </div>

        {/* Offer Stats */}
        <div className="px-4 pb-4">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Ofertas por tempo limitado</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>{filteredProducts.length} produtos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 p-4 pb-20">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">Carregando ofertas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product.id)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow relative"
            >
              {/* Discount Badge */}
              <div className="absolute top-2 left-2 z-10">
                <div className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                  -{product.discount}%
                </div>
              </div>

              {/* Time Left Badge */}
              <div className="absolute top-2 right-2 z-10">
                <div className="bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {product.timeLeft}
                </div>
              </div>

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
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-600">{product.rating}</span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500 line-through">
                    {product.originalPrice}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-red-600">
                      {product.price}
                    </p>
                    <div className="text-xs text-green-600 font-medium">
                      Economize {product.discount}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Tag className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma oferta encontrada
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Não há ofertas disponíveis nesta categoria no momento.
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Ver todas as ofertas
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        cartItemCount={cartItemCount}
        onHomeClick={() => navigate('/')}
        onFavoritesClick={() => navigate('/favoritos')}
        onCartClick={() => navigate('/carrinho')}
        onClipsClick={() => navigate('/clips')}
        onMoreClick={() => {}}
      />
    </div>
  );
};

export default Offers;