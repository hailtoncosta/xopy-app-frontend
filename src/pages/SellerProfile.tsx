import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Package, Star, Store } from 'lucide-react';
import { Header } from '@/components/header';
import { BottomNavigation } from '@/components/layout';
import { contentService } from '@/services/contentService';
import { supabase } from '@/integrations/supabase/client';

interface SellerProfile {
  id: string;
  name: string;
  businessName?: string;
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  joinedDate: string;
  totalSales: number;
  rating: number;
}

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  rating?: number;
}

const SellerProfile = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItemCount] = useState(0);

  useEffect(() => {
    if (sellerId) {
      loadSellerProfile(sellerId);
    }
  }, [sellerId]);

  const loadSellerProfile = async (id: string) => {
    try {
      setLoading(true);
      
      // UUID do admin (produtos do sistema Xopy)
      const ADMIN_UUID = '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3';
      const isXopyStore = id === ADMIN_UUID || id === 'default' || id === 'xopy';
      
      let sellerProducts: any[] = [];
      
      // Buscar produtos da tabela products (produtos verdadeiros)
      console.log('🔍 Buscando produtos do vendedor:', id);
      
      try {
        const { data: productsData, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', id)
          .eq('approval_status', 'approved')
          .eq('status', 'active');
        
        if (error) {
          console.error('❌ Erro ao buscar produtos:', error);
        } else if (productsData && productsData.length > 0) {
          console.log('✅ Produtos encontrados na tabela products:', productsData.length);
          
          sellerProducts = productsData.map(p => {
            // Processar imagens
            let imageUrl = '';
            if (Array.isArray(p.images) && p.images.length > 0) {
              imageUrl = p.images[0];
            } else if (typeof p.images === 'string') {
              try {
                const parsed = JSON.parse(p.images);
                imageUrl = Array.isArray(parsed) ? parsed[0] : p.images;
              } catch {
                imageUrl = p.images;
              }
            }
            
            return {
              id: p.id,
              name: p.title,
              price: `R$ ${p.price.toFixed(2).replace('.', ',')}`,
              image: imageUrl,
              rating: 5.0
            };
          });
        } else {
          console.log('⚠️ Nenhum produto encontrado para este vendedor');
        }
      } catch (error) {
        console.error('❌ Erro ao buscar produtos:', error);
      }

      setProducts(sellerProducts);
      
      // Buscar dados da loja na tabela seller_stores
      let storeData = null;
      try {
        const { data: storeInfo, error: storeError } = await supabase
          .from('seller_stores')
          .select('*')
          .eq('user_id', id)
          .maybeSingle();
        
        if (!storeError && storeInfo) {
          console.log('✅ Dados da loja encontrados:', storeInfo);
          storeData = storeInfo;
        } else {
          console.log('⚠️ Loja não encontrada, usando dados padrão');
        }
      } catch (error) {
        console.error('❌ Erro ao buscar dados da loja:', error);
      }
      
      // Se encontrou dados da loja, usar eles; senão, usar padrão
      if (storeData) {
        setSeller({
          id: id,
          name: storeData.store_name || 'Loja',
          businessName: storeData.store_name || 'Loja',
          avatar: storeData.logo_url || undefined,
          address: storeData.address || undefined,
          city: storeData.city || undefined,
          state: storeData.state || undefined,
          joinedDate: storeData.created_at || new Date().toISOString(),
          totalSales: sellerProducts.length > 0 ? sellerProducts.length * 10 : 0,
          rating: 4.8
        });
      } else {
        // Dados padrão se não encontrar a loja
        setSeller({
          id: id,
          name: isXopyStore ? 'Xopy' : 'Loja',
          businessName: isXopyStore ? 'Xopy Marketplace' : 'Loja',
          avatar: isXopyStore 
            ? 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop'
            : undefined,
          address: isXopyStore ? 'Marketplace Online' : undefined,
          city: isXopyStore ? 'Brasil' : undefined,
          state: isXopyStore ? '' : undefined,
          joinedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
          totalSales: sellerProducts.length > 0 ? sellerProducts.length * 10 : 0,
          rating: 4.8
        });
      }

    } catch (error) {
      console.error('Erro ao carregar perfil do vendedor:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatJoinedDate = (date: string) => {
    const joined = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joined.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `Há ${diffDays} dias`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Há ${months} ${months === 1 ? 'mês' : 'meses'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `Há ${years} ${years === 1 ? 'ano' : 'anos'}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vendedor não encontrado</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartItemCount={cartItemCount}
        onCartClick={() => navigate('/carrinho')}
        onMenuClick={() => navigate('/profile')}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 pt-[104px] sm:pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="text-white mb-4 flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Voltar</span>
          </button>

          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 overflow-hidden flex-shrink-0">
              {seller.avatar ? (
                <img
                  src={seller.avatar}
                  alt={seller.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/10">
                  <Store className="h-10 w-10 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">
                {seller.businessName || seller.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.floor(seller.rating)
                          ? 'text-yellow-300 fill-yellow-300'
                          : 'text-white/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white text-sm font-medium">
                  {seller.rating} • {seller.totalSales} vendas
                </span>
              </div>

              {/* Location */}
              {(seller.city || seller.state) && (
                <div className="flex items-center gap-1 text-white/90 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {seller.city}
                    {seller.city && seller.state && ', '}
                    {seller.state}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                <p className="text-xs text-gray-600">Produtos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatJoinedDate(seller.joinedDate).split(' ')[1]}
                </p>
                <p className="text-xs text-gray-600">
                  {formatJoinedDate(seller.joinedDate).split(' ')[0] + ' ' + formatJoinedDate(seller.joinedDate).split(' ')[2]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-4xl mx-auto px-4 pb-24">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-600" />
            Produtos Anunciados
          </h2>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum produto anunciado ainda</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop';
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-gray-600">{product.rating}</span>
                      </div>
                    )}
                    <p className="text-lg font-bold text-orange-600">{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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

export default SellerProfile;
